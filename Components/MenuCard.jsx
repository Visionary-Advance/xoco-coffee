'use client';
import { useEffect, useState } from 'react';
import Button from './Button';
import EditCartModal from './MenuModal';

export default function CoffeeCard({ activeCategory, selectedSizes, setSelectedSizes }) {
  const sizes = ['S', 'M', 'L'];
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [coffeeShopItems, setCoffeeShopItems] = useState([]);

  const handleSizeClick = (id, size) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [id]: size,
    }));
  };

  const handleOpenModal = (item, id) => {
    setSelectedItem(item);
    setSelectedSize(selectedSizes?.[id] || 'S');
    setShowModal(true);
  };

useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch('/api/square-items');
        const data = await res.json();
        // Assuming data.items is the array of items from your backend
        setCoffeeShopItems(data.items || []);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    }

    fetchItems();
  }, []);
  

  return (
    <div className="flex lg:w-9/12 mx-auto flex-wrap gap-6 justify-center">
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
              className="flex-1 min-w-[250px] max-w-[300px] h-[400px] bg-white rounded-3xl overflow-hidden shadow-lg flex flex-col"
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
                 {['coffee', 'tea'].includes(item.category?.toLowerCase()) && (
  <div className="flex gap-2  ">
    {sizes.map((size) => (
      <button
        key={size}
        onClick={() => handleSizeClick(item.id, size)}
        className={`w-8 h-8 rounded-full font-semibold border-2 transition-colors duration-200 ${
          selectedSizes?.[item.id] === size
            ? 'bg-black text-white border-black'
            : 'bg-white text-black border-black'
        }`}
      >
        {size}
      </button>
    ))}
  </div>
)}
  <div className='ms-auto w-full '>
                  <Button
                    onClick={() => handleOpenModal(item, item.id)}
                    text="Add To Cart"
                    width="w-full px-1 bg-[#50311D] text-white text-sm py-2"
                  />
                  </div>
                </div>
              </div>
            </div>
          ))}
      {showModal && selectedItem && (
        <EditCartModal
          item={selectedItem}
          selectedSize={selectedSize}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}