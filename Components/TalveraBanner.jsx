'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCoffee } from "react-icons/fa";
import { BiSolidCoffeeBean } from "react-icons/bi";

export default function TalveraBanner() {
  const [count, setCount] = useState(0);

  const borderImage = '/Img/Talvera.png'; 
  const borderImageWidth = 16; 

  useEffect(() => {
    const updateCount = () => {
      const screenWidth = window.innerWidth;
      const needed = Math.ceil(screenWidth / borderImageWidth);
      setCount(needed);
    };

    updateCount();
    window.addEventListener('resize', updateCount);
    return () => window.removeEventListener('resize', updateCount);
  }, []);

  const borderRow = Array.from({ length: count });

  const textItems = [
    { text: 'Fresh Baked Goods', icon: <FaCoffee /> },
    { text: 'Locally Roasted Coffee ', icon: <FaCoffee /> },
    { text: 'Sustainable & Organic ', icon: <BiSolidCoffeeBean /> },
  ];

  const renderTextGroup = () => (
    <div className="flex gap-2 libre-bold shrink-0">
      {textItems.concat(textItems).map((item, index) => (
         <div key={index} className="flex items-center text-white text-3xl space-x-2">
         <span className='text-[#50311D]'>{item.icon}</span>
         <span>{item.text}</span>
       </div>
      ))}
    </div>
  );

  return (
    <div className="bg-[#E6D5B8] overflow-hidden">
      {/* Top Border */}
      <div className="flex justify-center w-full overflow-hidden">
        {borderRow.map((_, i) => (
          <img
            key={`top-${i}`}
            src={borderImage}
            alt="border"
            className="w-16 h-auto object-contain"
          />
        ))}
      </div>

      {/* Scrolling Text */}
      <div className="overflow-hidden whitespace-nowrap py-4">
        <motion.div
          className="flex"
          animate={{ x: ['0%', '-100%'] }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {renderTextGroup()}
          {renderTextGroup()}
        </motion.div>
      </div>

      {/* Bottom Border */}
      <div className="flex justify-center w-full overflow-hidden">
        {borderRow.map((_, i) => (
          <img
            key={`bottom-${i}`}
            src={borderImage}
            alt="border"
            className="w-16 h-auto object-contain"
          />
        ))}
      </div>
    </div>
  );
}
