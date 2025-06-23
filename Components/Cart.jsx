'use client';

import { useEffect, useState } from 'react';
import Button from './Button';
import Link from 'next/link';
import EditCartModal from './MenuModal';

export default function Cart({ isOpen, onClose, cartItems, setCartItems, getFullItemData }) {
  const [editingItem, setEditingItem] = useState(null);

  // Remove debug logging since we found the issue

  // ✅ Used for saving updated items (from modal or inline)
  const updateCartItem = (cartId, updatedData) => {
    const updatedItems = cartItems.map(item =>
      item.cartId === cartId ? { ...item, ...updatedData } : item
    );
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    setCartItems(updatedItems);
    // Dispatch event to update other components
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // ✅ Remove item
  const removeItem = (cartId, sizeName) => {
    const updated = cartItems.filter(
      item =>
        !(
          item.cartId === cartId &&
          item.size.name === sizeName 
        )
    );
    localStorage.setItem('cart', JSON.stringify(updated));
    setCartItems(updated);
    // Dispatch event to update other components
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const calculateSubtotal = () =>
    cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);

  useEffect(() => {
    const handleClickOutside = e => {
      if (isOpen && e.target.id === 'cart-overlay') {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div
          id="cart-overlay"
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-[#8a6e58] text-white z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        <div className="flex justify-between items-center p-4 border-b border-[#d9c3a0]">
          <h2 className="text-2xl font-semibold">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-3xl font-bold hover:text-[#d9c3a0]"
          >
            X
          </button>
        </div>

        <div className="flex-grow overflow-y-auto py-4 px-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <p>Your cart is empty</p>
            </div>
          ) : (
            cartItems.map(item => (
              <div
                key={item.cartId}
                className="flex items-start mb-6 pb-6 border-b border-[#d9c3a0] last:border-0"
              >
                {/* Item Image */}
                <div className="h-16 w-16 rounded-full overflow-hidden mr-4 bg-[#50311D] flex-shrink-0">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Item Details */}
                <div className="flex-grow space-y-1">
                  <h3 className="text-xl font-medium">{item.name}</h3>

                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium">Details</summary>
                    <div className="mt-2 flex flex-col gap-1">
                      <div>
                        <strong>Size:</strong> {item.size.name}
                      </div>

                      {item.modifiers?.length > 0 && (
                        <div className="flex flex-col gap-1">
                          {item.modifiers
                            .filter(mod => mod.modifierListName)
                            .map(mod => (
                              <div key={mod.id}>
                                <strong>{mod.modifierListName}:</strong> {mod.name}
                              </div>
                            ))}

                          {item.modifiers.some(mod => !mod.modifierListName) && (
                            <>
                              <div>
                                <strong>Add On(s):</strong>
                              </div>
                              {item.modifiers
                                .filter(mod => !mod.modifierListName)
                                .map(mod => (
                                  <div key={mod.id}>{mod.name}</div>
                                ))}
                            </>
                          )}
                        </div>
                      )}
                        {item.specialInstructions && 
                      <div>
                        <strong>Notes:</strong> {item.specialInstructions}
                      </div>
}
                    </div>
                  </details>

                  <button
                    onClick={() => setEditingItem(item)}
                    className="text-sm text-[#d9c3a0] hover:underline mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      removeItem(item.cartId, item.size.name)
                    }
                    className="text-sm text-[#d9c3a0] hover:underline"
                  >
                    Remove
                  </button>
                </div>

                {/* Price */}
                <div className="ml-4">
                  <p className="text-lg">${item.price.toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal for editing */}
        {editingItem && (
          <EditCartModal
            item={getFullItemData ? getFullItemData(editingItem.id) : editingItem}
            editing={true}
            existingCartItem={editingItem}
            onClose={() => setEditingItem(null)}
            onSave={(updatedItem) => {
              updateCartItem(editingItem.cartId, updatedItem);
              setEditingItem(null);
            }}
          />
        )}

        {/* Subtotal + Checkout */}
        <div className="border-t border-[#d9c3a0] p-4 bg-[#6b543f]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Subtotal:</h3>
            <p className="text-xl font-semibold">${calculateSubtotal()}</p>
          </div>
          <Link
            href="/checkout"
            onClick={e => {
              if (cartItems.length === 0) {
                e.preventDefault();
              } else {
                onClose();
              }
            }}
          >
            <Button
              width="w-full"
              text="Proceed to Checkout"
              color="bg-[#50311D] text-white"
              disabled={cartItems.length === 0}
            />
          </Link>
        </div>
      </div>
    </>
  );
}