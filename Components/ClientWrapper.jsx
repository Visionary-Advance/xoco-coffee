'use client';

import FilterMenuBar from "@/Components/FilterMenuBar";
import CoffeeCard from "@/Components/MenuCard";
import Cart from "@/Components/Cart"; // Import your Cart component
import { useState, useEffect } from "react";

export default function ClientWrapper({ coffeeShopItems }) { // This should match what MenuPage sends
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedSizes, setSelectedSizes] = useState({});
  
  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Create a list of unique categories for the filter menu
  const categories = ["All", ...new Set(coffeeShopItems?.map(item => 
    item.category.charAt(0).toUpperCase() + item.category.slice(1)
  ).filter(Boolean))];

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }

    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      const updatedCart = localStorage.getItem('cart');
      if (updatedCart) {
        setCartItems(JSON.parse(updatedCart));
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  // Function to get full item data by ID for the cart editing
  const getFullItemData = (itemId) => {
    return coffeeShopItems.find(item => item.id === itemId) || null;
  };

  return (
    <>
      {/* Add a header with cart button - you can style this however you want */}
      {/* <div className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">Menu</h1>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="bg-[#50311D] text-white px-4 py-2 rounded-lg hover:bg-[#6b543f] transition-colors"
        >
          Cart ({cartItems.length})
        </button>
      </div> */}

      <FilterMenuBar 
        activeCategory={activeCategory} 
        setActiveCategory={setActiveCategory}
        categories={categories} 
      />
      
      <div className="w-11/12 mx-auto">
        <CoffeeCard
          activeCategory={activeCategory}
          selectedSizes={selectedSizes}
          setSelectedSizes={setSelectedSizes}
          coffeeShopItems={coffeeShopItems}
        />
      </div>

      {/* Cart component */}
      {/* <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        setCartItems={setCartItems}
        getFullItemData={getFullItemData}
      /> */}
      
      {/* Debug: Check if this Cart is rendering */}
      {console.log('ClientWrapper is rendering Cart with getFullItemData:', !!getFullItemData)}
    </>
  );
}