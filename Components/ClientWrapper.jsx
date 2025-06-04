'use client';

import FilterMenuBar from "@/Components/FilterMenuBar";
import CoffeeCard from "@/Components/MenuCard";
import { useState } from "react";

export default function ClientWrapper({ items }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedSizes, setSelectedSizes] = useState({});

  // Create a list of unique categories for the filter menu
  const categories = ["All", ...new Set(items?.map(item => 
    item.category.charAt(0).toUpperCase() + item.category.slice(1)
  ).filter(Boolean))];

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
  coffeeShopItems={items} 

        />
      </div>
    </>
  );
}