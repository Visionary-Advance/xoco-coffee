

// export default function MenuPage(){



//   return(
//     <div className= "w-full h-lvh  place-items-center text-4xl font-bold translate-y-1/2 align-middle">
//     <h1 className= "">ONLINE ORDERING COMING SOON</h1>

//     </div>


//   );
// }







'use client';

import { useState, useEffect } from 'react';
import ClientWrapper from '@/Components/ClientWrapper';
import Button from '@/Components/Button';

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(12);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/square-items');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setItems(data.items || []);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 12);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-bold">Error loading menu items</h2>
          <p>{error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold">No menu items found</h2>
          <p className="text-gray-600">Please add items to your Square catalog.</p>
        </div>
      </div>
    );
  }

  const displayedItems = items.slice(0, displayCount);
  const hasMore = displayCount < items.length;

  return (
    <div>
      <ClientWrapper coffeeShopItems={displayedItems} />
      
      {hasMore && (
        <div className="flex justify-center py-8">
          <Button 
            text="Load More" 
            width="px-8 py-3"
            color="hover:bg-white bg-[#50311D] hover:text-black text-white"
            onClick={handleLoadMore}
          />
        </div>
      )}
    </div>
  );
}