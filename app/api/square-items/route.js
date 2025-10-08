import { NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';
import { getSquareAuth } from '@/lib/square-auth';

export async function GET() {
  try {
    // console.log('🔍 Fetching Square items for Xoco...');
    
    // Get auth credentials from Supabase
    const auth = await getSquareAuth();
    
    // console.log('✅ Retrieved auth for:', auth.restaurantName);
    // console.log('📍 Location ID:', auth.locationId);
    // console.log('🔑 Token expires at:', auth.expiresAt);
    
    // Initialize Square client with stored token
    const client = new SquareClient({
      environment: process.env.SQUARE_ENVIRONMENT === 'production' 
        ? SquareEnvironment.Production 
        : SquareEnvironment.Sandbox,
      token: auth.accessToken,
    });

    // console.log('📡 Fetching catalog from Square...');
    
    const rawResponse = await client.catalog.list({
      types: "ITEM,IMAGE,CATEGORY,MODIFIER_LIST,MODIFIER",
    });

    const result = rawResponse.response?.objects || rawResponse.data || [];
    
    // console.log('✅ Retrieved', result.length, 'catalog objects');

    const items = result.filter(obj => obj.type === 'ITEM');
    const images = result.filter(obj => obj.type === 'IMAGE');
    const modifierLists = result.filter(obj => obj.type === 'MODIFIER_LIST');
    const modifiers = result.filter(obj => obj.type === 'MODIFIER');

    // console.log('📦 Items:', items.length);
    // console.log('🖼️ Images:', images.length);
    // console.log('📝 Modifier Lists:', modifierLists.length);
    // console.log('🔧 Modifiers:', modifiers.length);

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

    // console.log('✅ Processed', filteredItems.length, 'menu items');

    return NextResponse.json({ 
      items: filteredItems,
      metadata: {
        restaurantName: auth.restaurantName,
        locationId: auth.locationId,
        itemCount: filteredItems.length
      }
    });

  } catch (error) {
    console.error('❌ Square API Error:', error);
    
    if (error.message.includes('XOCO_CLIENT_ID')) {
      return NextResponse.json({ 
        error: 'Configuration Error',
        message: 'Client ID not configured. Please contact support.',
        details: error.message 
      }, { status: 500 });
    }
    
    if (error.message.includes('expired')) {
      return NextResponse.json({ 
        error: 'Token Expired',
        message: 'Square authorization has expired. Please contact Visionary Advance to refresh.',
        details: error.message 
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch menu items',
      message: error.message 
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';