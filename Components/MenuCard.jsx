'use client';
import { useState } from 'react';
import Button from './Button';
import EditCartModal from './MenuModal';
import { isShopOpen, getShopStatus } from '../lib/businessHours'; 

export default function CoffeeCard({ 
  activeCategory, 
  selectedSizes,  
  coffeeShopItems
}) {
 
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const shopStatus = getShopStatus();

  

  const handleOpenModal = (item, id) => {
    if (!shopStatus.isOpen) {
      alert(`Sorry, we're currently closed. ${shopStatus.message}`);
      return;
    }
    
    setSelectedItem(item);
    setSelectedSize(selectedSizes?.[id] || 'S');
    setShowModal(true);
  };

  return (
    <div className="flex lg:w-9/12 mx-auto flex-wrap gap-6 justify-center">
      {/* Shop Status Banner */}
      {!shopStatus.isOpen && (
        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex">
            <div className="py-1">
              <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold">We're Currently Not Accepting Online Orders</p>
              <p className="text-sm">{shopStatus.message}</p>
            </div>
          </div>
        </div>
      )}

      {coffeeShopItems?.length > 0 &&
        coffeeShopItems
          .filter(
            (item) =>
              activeCategory === 'All' ||
              item.category?.toLowerCase() === activeCategory.toLowerCase()
          )
          .map((item) => (
            <div
              key={item.id}
              className={`flex-1 min-w-[250px] max-w-[300px] h-[400px] bg-white rounded-3xl overflow-hidden shadow-lg flex flex-col ${
                !shopStatus.isOpen ? 'opacity-60' : ''
              }`}
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-56 object-cover"
              />
              <div className="flex flex-col justify-between flex-1 p-4">
                <div className="mb-2">
                  <div className="flex justify-between items-start mb-1">
                    <h2 className="text-xl libre-bold leading-snug break-words">
                      {item.name}
                    </h2>
                    <span className="text-xl libre-bold">
                      ${(Number(item.price)).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm libre text-gray-700 mb-2">{item.description}</p>
                </div>

                <div className="flex justify-between items-center mt-auto">
                  
                  <div className='ms-auto w-full'>
                    <Button
                      onClick={() => handleOpenModal(item, item.id)}
                      text={shopStatus.isOpen ? "Add To Cart" : "Closed"}
                      width="w-full px-1 text-sm py-2"
                      color={shopStatus.isOpen ? "bg-[#50311D] text-white" : "bg-gray-400 text-gray-600 cursor-not-allowed"}
                      disabled={!shopStatus.isOpen}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
      
      {showModal && selectedItem && shopStatus.isOpen && (
        <EditCartModal
          item={selectedItem}
          selectedSize={selectedSize}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}