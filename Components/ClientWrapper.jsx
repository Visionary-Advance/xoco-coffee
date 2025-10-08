'use client';

import FilterMenuBar from "@/Components/FilterMenuBar";
import CoffeeCard from "@/Components/MenuCard";
import { useState, useEffect } from "react";

export default function ClientWrapper({ coffeeShopItems }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedSizes, setSelectedSizes] = useState({});
  
  // Cart state
  const [cartItems, setCartItems] = useState([]); // <-- ADD THIS LINE HERE!
 
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

  return (
    <>
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
    </>
  );
}