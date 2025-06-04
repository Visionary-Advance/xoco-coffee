'use client';

import { useEffect, useState} from 'react';
import Button from './Button';
import Link from 'next/link';
import EditCartModal from './MenuModal';

export default function Cart({ isOpen, onClose, cartItems, setCartItems }) {

  const [editingItem, setEditingItem] = useState(null); // will store the item object 


  const updateQuantity = (id, size, temp, newQuantity) => {
    const updatedItems = cartItems
      .map(item =>
        item.id === id && item.size === size && item.temperature === temp
          ? { ...item, quantity: newQuantity }
          : item
      )
      .filter(item => item.quantity > 0);

    localStorage.setItem('cart', JSON.stringify(updatedItems));
    setCartItems(updatedItems);
  };

  const updateItemField = (id, size, temp, field, value) => {
    const updatedItems = cartItems.map(item =>
      item.id === id && item.size === size && item.temperature === temp
        ? { ...item, [field]: value }
        : item
    );
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    setCartItems(updatedItems);
  };

  const removeItem = (id, size, temp) => {
    const updated = cartItems.filter(
      item => !(item.id === id && item.size === size && item.temperature === temp)
    );
    localStorage.setItem('cart', JSON.stringify(updated));
    setCartItems(updated);
  };

  const calculateSubtotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

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
          <h2 className="text-2xl font-semibold text-white">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-white text-3xl font-bold hover:text-[#d9c3a0] transition-colors"
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
                key={`${item.name}-${item.size}-${item.temperature}`}
                className="flex items-start mb-6 pb-6 border-b border-[#d9c3a0] last:border-0"
              >
                {/* Item Image */}
                <div className="h-16 w-16 rounded-full overflow-hidden mr-4 bg-[#50311D] flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Item Details */}
                <div className="flex-grow space-y-1">
                  <h3 className="text-xl font-medium">{item.name}</h3>

                  <div className="flex gap-2">
                    <select
                      value={item.size}
                      onChange={e =>
                        updateItemField(
                          item.id,
                          item.size,
                          item.temperature,
                          'size',
                          e.target.value
                        )
                      }
                      className="bg-[#6b543f] border border-[#d9c3a0] text-white px-2 py-1 rounded"
                    >
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                    </select>

                    <select
                      value={item.temperature}
                      onChange={e =>
                        updateItemField(
                          item.id,
                          item.size,
                          item.temperature,
                          'temperature',
                          e.target.value
                        )
                      }
                      className="bg-[#6b543f] border border-[#d9c3a0] text-white px-2 py-1 rounded"
                    >
                      <option value="Hot">Hot</option>
                      <option value="Iced">Iced</option>
                    </select>
                  </div>

                  <p className="text-lg">${item.price.toFixed(2)}</p>
                 
                 <button
  onClick={() => setEditingItem(item)}
  className="text-sm text-[#d9c3a0] hover:underline mr-2"
>
  Edit
</button> 
 <button
                    onClick={() =>
                      removeItem(item.id, item.size, item.temperature)
                    }
                    className="text-sm text-[#d9c3a0] hover:underline"
                  >
                    Remove
                  </button>
                  
                </div>
                {editingItem && (
  <EditCartModal
    item={editingItem}
    onClose={() => setEditingItem(null)}
    onSave={(updatedItem) => {
      // Replace the item in cartItems
      const updatedCart = cartItems.map(ci => 
        ci.id === editingItem.id &&
        ci.editingItem.modifiers &&
        ci.editingItem.specialInstructions &&
        ci.size === editingItem.size &&
        ci.temperature === editingItem.temperature
          ? { ...ci, ...updatedItem }
          : ci
      );
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      setEditingItem(null);
    }}
  />
)}


                {/* Quantity Input */}
                <div className="ml-4">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e =>
                      updateQuantity(
                        item.id,
                        item.size,
                        item.temperature,
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-16 px-2 py-1 text-center border border-[#d9c3a0] bg-transparent text-white rounded"
                    aria-label="Item quantity"
                  />
                </div>
              </div>
            ))
          )}
        </div>

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
