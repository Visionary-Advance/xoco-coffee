'use client'

import { useState, useRef, useEffect } from 'react';

export default function FilterMenuBar({ activeCategory, setActiveCategory }) {
  const categories = ["All", "Coffee", "Tea", "Breakfast", "Brunch", "Baked Goods", "Specialty"];
  
  const [highlightStyle, setHighlightStyle] = useState({});
  const buttonRefs = useRef([]);
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint in Tailwind
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update highlight position when active category changes or on resize
  const updateHighlightPosition = () => {
    const activeIndex = categories.indexOf(activeCategory);
    const activeButton = buttonRefs.current[activeIndex];
    const containerEl = containerRef.current;
    
    if (activeButton && containerEl) {
      const containerRect = containerEl.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      
      // Get text dimensions (approximate)
      const textHeight = isMobile ? 20 : 22; // Approximate text height in pixels
      
      // Calculate exact positions for perfect centering
      const buttonHeight = buttonRect.height;
      const buttonMiddle = buttonRect.top - containerRect.top + (buttonHeight / 2);
      
      // Make highlight just slightly larger than text
      const highlightHeight = isMobile ? textHeight + 4 : textHeight + 8;
      
      setHighlightStyle({
        left: `${buttonRect.left - containerRect.left}px`,
        top: `${buttonMiddle - (highlightHeight / 2)}px`,
        width: `${buttonRect.width}px`,
        height: `${highlightHeight}px`,
        backgroundColor: '#e0bd85',
        borderRadius: '9999px',
        zIndex: 0,
      });
    }
  };

  // Update highlight on category change
  useEffect(() => {
    // Small delay to ensure DOM is updated before calculating position
    const timer = setTimeout(() => {
      updateHighlightPosition();
    }, 10);
    return () => clearTimeout(timer);
  }, [activeCategory, isMobile]);

  // Update highlight on window resize
  useEffect(() => {
    window.addEventListener('resize', updateHighlightPosition);
    return () => window.removeEventListener('resize', updateHighlightPosition);
  }, [activeCategory, isMobile]);
  
  return (
    <div className="w-full p-4 flex justify-center">
      <div 
        ref={containerRef}
        className="w-11/12 md:max-w-2xl bg-[#50311D] rounded-[30px] lg:rounded-full px-4 py-2 flex flex-wrap md:flex-nowrap items-center justify-center md:justify-between relative gap-2 md:gap-0"
      >
        {/* The sliding highlight */}
        <div 
          className="absolute transition-all duration-300 ease-in-out" 
          style={highlightStyle}
        />
        
        {/* Menu items */}
        {categories.map((category, index) => (
          <button
            key={category}
            ref={(el) => buttonRefs.current[index] = el}
            className={`relative z-10 px-3 py-1 text-lg font-semibold transition-colors duration-200 ${
              activeCategory === category ? 'text-white' : 'text-white opacity-80 hover:opacity-100'
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}