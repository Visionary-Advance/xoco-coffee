import { NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';

export async function GET() {
  try {
    const client = new SquareClient({
      environment: SquareEnvironment.Sandbox,
      token: process.env.SQUARE_ACCESS_TOKEN,
    });

    const rawResponse = await client.catalog.list({
      types: "ITEM,IMAGE,CATEGORY,MODIFIER_LIST,MODIFIER",
    });

    const result = rawResponse.response?.objects || rawResponse.data || [];

    const items = result.filter(obj => obj.type === 'ITEM');
    const images = result.filter(obj => obj.type === 'IMAGE');
    const modifierLists = result.filter(obj => obj.type === 'MODIFIER_LIST');
    const modifiers = result.filter(obj => obj.type === 'MODIFIER');

    const categoryMap = {};
    result.forEach(obj => {
      if (obj.type === 'CATEGORY') {
        categoryMap[obj.id] = obj.categoryData?.name || 'Uncategorized';
      }
    });

    const modifierIdMap = {};
    for (const mod of modifiers) {
      modifierIdMap[mod.id] = {
        id: mod.id,
        name: mod.modifierData?.name || 'Unnamed',
        price: mod.modifierData?.priceMoney?.amount
          ? Number(mod.modifierData.priceMoney.amount) / 100
          : 0
      };
    }

    const modifierMap = {};
    for (const list of modifierLists) {
      const name = list.modifierListData?.name || 'Unnamed Group';
      const mods = list.modifierListData?.modifiers || [];

      const modifierObjects = mods.map(ref => {
        const possibleId = ref.modifierId || ref.id || ref.modifier_id;

        if (!possibleId && ref.modifierData) {
          return {
            id: ref.id || `inline_${Math.random()}`,
            name: ref.modifierData?.name || 'Unnamed',
            price: ref.modifierData?.priceMoney?.amount
              ? Number(ref.modifierData.priceMoney.amount) / 100
              : 0
          };
        }

        return modifierIdMap[possibleId];
      }).filter(Boolean);

      modifierMap[list.id] = {
        name,
        modifiers: modifierObjects
      };

     
    }

    const imageMap = {};
    for (const image of images) {
      imageMap[image.id] = image.imageData?.url;
    }

    const filteredItems = items.map(item => {
      const imageId = item.itemData?.imageIds?.[0];
      const categoryId = item.itemData?.categories?.[0]?.id;

      const variations = (item.itemData?.variations || []).map(v => {
        const vData = v.itemVariationData;
        return {
          id: v.id,
          name: vData?.name || 'Default',
          sku: vData?.sku || null,
          price: vData?.priceMoney?.amount ? Number(vData.priceMoney.amount) / 100 : null,
          currency: vData?.priceMoney?.currency || '',
        };
      });

      const price = variations[0]?.price || null;
      const currency = variations[0]?.currency || '';

      const attachedModifierLists = (item.itemData?.modifierListInfo || [])
        .map(info => modifierMap[info.modifierListId])
        .filter(Boolean);

      // const itemName = item.itemData?.name || 'Unnamed Item';
    
      attachedModifierLists.forEach((modList, i) => {
        console.log(`   [${i}] "${modList.name}" with ${modList.modifiers.length} modifiers`);
      });

      return {
        id: item.id,
        name: item.itemData?.name || 'Unnamed Item',
        description: item.itemData?.description || '',
        price,
        currency,
        category: categoryMap[categoryId] || 'Uncategorized',
        img: imageMap[imageId] || null,
        variations,
        modifiers: attachedModifierLists,
      };
    });

   

    return NextResponse.json({ items: filteredItems });

  } catch (error) {
    console.error('❌ Square API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
