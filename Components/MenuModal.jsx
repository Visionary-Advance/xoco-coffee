'use client'

import { useEffect, useState } from 'react';
import Button from './Button';

export default function EditCartModal({ item, selectedSize, onClose, editing = false, existingCartItem = null }) {

    const [selectedTemperature, setSelectedTemperature] = useState(existingCartItem?.temperature || "Hot");
    const [size, setSize] = useState(existingCartItem?.size || selectedSize || "M");
    const [quantity, setQuantity] = useState(existingCartItem?.quantity || 1);
    const [selectedModifiers, setSelectedModifiers] = useState(existingCartItem?.modifiers || []);
    const [specialInstructions, setSpecialInstructions] = useState(existingCartItem?.specialInstructions || "");
    const [computedPrice, setComputedPrice] = useState(Number(item.price));

  

    

    

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const handleModifierChange = (mod, isChecked, modifierListName) => {
    setSelectedModifiers(prev => {
        if (isChecked) {
            if (modifierListName?.toLowerCase().includes("temperature")) {
                // Replace any previous selection in this temperature group
                return [
                    ...prev.filter(m => m.modifierListName !== modifierListName),
                    { ...mod, modifierListName }
                ];
            } else {
                return [...prev, mod];
            }
        } else {
            return prev.filter(m => m.id !== mod.id);
        }
    });
};


    // Set default size to first variation if variations exist
    useEffect(() => {
        if (!existingCartItem > 0) {
            // Set default size to first variation if no size is selected
            if (!size || size === "M") {
                setSize(item.item_data.variations[0].id);
            }
        }
    }, [ item?.item_data?.variations, existingCartItem, size]);

    useEffect(() => {
    let basePrice = Number(item.price || 0);

    const selectedVariation = item.variations?.find(v => v.id === size);
    if (selectedVariation?.price) {
        basePrice = selectedVariation.price;
    }

    const modifiersTotal = selectedModifiers.reduce((sum, mod) => sum + (mod.price || 0), 0);

    setComputedPrice((basePrice + modifiersTotal) * quantity);
}, [size, selectedModifiers, quantity, item.variations]);


const temperatureModifierGroup = item.modifiers?.find(modList =>
  modList.name.toLowerCase().includes("temperature")
);

const otherModifierGroups = item.modifiers?.filter(modList =>
  !modList.name.toLowerCase().includes("temperature")
);


    return (
        <div className="fixed inset-0 z-50 flex items-center libre justify-center bg-black/60">
            <div role="dialog" aria-modal="true" className="relative bg-white w-[90%] max-w-md rounded-2xl overflow-hidden shadow-lg max-h-[95vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-black text-xl font-bold z-10"
                >
                    ✕
                </button>

                <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-64 object-cover"
                />

                <div className="p-4">
                    <h2 className="text-2xl font-semibold">{item.name}</h2>
                    <h2 className="text-2xl libre-bold">
                        ${computedPrice.toFixed(2)}
                    </h2>
                    <p className="text-sm text-gray-700 mb-4">
                        {item.description}
                    </p>


                    {/* Debug info for troubleshooting */}
                   

                 {item.variations && item.variations.length > 0 && (
  <div className="mb-4">
    <label className="block font-medium mb-1">Size:</label>
    <div className="flex flex-col gap-1">
      {item.variations.map((variation) => {
        const name = variation.name || 'Unnamed Size';
        const id = variation.id;
        const price = variation.price;
        const displayPrice = typeof price === 'number' ? `$${price.toFixed(2)}` : '';

        return (
          <label key={id} className="flex items-center gap-2">
            <input
              type="radio"
              name="size"
              value={id}
              checked={size === id}
              onChange={() => setSize(id)}
              required
            />
            <span>{name} {displayPrice && `(${displayPrice})`}</span>
          </label>
        );
      })}
    </div>
  </div>
)}


                    {/* Only show modifiers if they exist */}
                    {/* 🧊 Temperature Selector */}
{temperatureModifierGroup && (
  <div className="mb-4">
    <p className="">{temperatureModifierGroup.name}:</p>
    <div className="flex flex-col gap-1">
      {temperatureModifierGroup.modifiers.map(mod => (
        <label key={mod.id} className="flex items-center gap-2">
          <input
            type="radio"
            name="temperature"
            value={mod.id}
            checked={selectedModifiers.find(m => m.modifierListName === temperatureModifierGroup.name)?.id === mod.id}
            onChange={(e) =>
              handleModifierChange(mod, e.target.checked, temperatureModifierGroup.name)
            }
            required
          />
          <span>{mod.name}</span>
        </label>
      ))}
    </div>
  </div>
)}
{/* ☕ Customizations Dropdown */}
{otherModifierGroups?.length > 0 && (
  <details className="mb-6  w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-md p-4 transition-all duration-300">
    <summary className="font-semibold cursor-pointer text-lg text-gray-800 select-none">
      Customize
    </summary>

    <div className="mt-4 space-y-4">
      {otherModifierGroups.map((modList, index) => (
        <div key={index}>
          <p className="font-medium text-gray-700 mb-2">{modList.name}:</p>
          <div className="space-y-2">
            {modList.modifiers.map(mod => (
              <label
                key={mod.id}
                className="flex items-center gap-3 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
              >
                <input
                  type="checkbox"
                  value={mod.id}
                  checked={selectedModifiers.some(selected => selected.id === mod.id)}
                  onChange={e => handleModifierChange(mod, e.target.checked, modList.name)}
                  className="accent-indigo-600 w-4 h-4"
                />
                <span className="text-gray-800">
                  {mod.name}
                  {mod.price > 0 && (
                    <span className="text-gray-500"> (+ ${mod.price.toFixed(2)})</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  </details>
)}



                    {/* <div className="mb-4">
                        <label className="block font-medium mb-1">Temperature:</label>
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="temperature"
                                    value="Hot"
                                    checked={selectedTemperature === "Hot"}
                                    onChange={() => setSelectedTemperature("Hot")}
                                />
                                <span>Hot</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="temperature"
                                    value="Iced"
                                    checked={selectedTemperature === "Iced"}
                                    onChange={() => setSelectedTemperature("Iced")}
                                />
                                <span>Iced</span>
                            </label>
                        </div>
                    </div> */}

                    <div className="mb-4">
                        <label className="block font-medium mb-1">Special Instructions:</label>
                        <textarea
                            className="w-full p-2 border rounded-lg"
                            rows={3}
                            placeholder="Anything we should know?"
                            value={specialInstructions}
                            onChange={(e) => setSpecialInstructions(e.target.value)}
                        />
                    </div>
                    
                    <Button
                        text={editing ? "Update Item" : "Add To Cart"}
                        width={"w-full"}
                        color={"bg-[#50311D] text-white"}
                        onClick={() => {
                            const updatedItem = {
                                id: item.id,
                                name: item.name,
                                size,
                                temperature: selectedTemperature,
                                price: computedPrice,
                                quantity,
                                img: item.img,
                                modifiers: selectedModifiers,
                                specialInstructions,
                            };

                            if (editing) {
                                updateCartItem(existingCartItem, updatedItem);
                            } else {
                                addToCart(updatedItem);
                            }

                            onClose();
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

function addToCart(newItem) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingItemIndex = cart.findIndex(item =>
        item.id === newItem.id &&
        item.name === newItem.name &&
        item.size.name === newItem.size.name &&
        item.temperature.name === newItem.temperature.name &&
        modifiersMatch(item.modifiers, newItem.modifiers)
    );

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += newItem.quantity;
    } else {
        cart.push(newItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    // 👇 Dispatch event so Header updates
    window.dispatchEvent(new Event('cartUpdated'));
}

function modifiersMatch(mods1, mods2) {
    if (mods1.length !== mods2.length) return false;
    const ids1 = mods1.map(m => m.id).sort().join(',');
    const ids2 = mods2.map(m => m.id).sort().join(',');
    return ids1 === ids2;
}

function updateCartItem(oldItem, updatedItem) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    cart = cart.map(item => {
        const sameItem = item.id === oldItem.id &&
            item.name === oldItem.name &&
            item.size === oldItem.size &&
            item.temperature === oldItem.temperature &&
            JSON.stringify(item.modifiers) === JSON.stringify(oldItem.modifiers);

        return sameItem ? updatedItem : item;
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
}