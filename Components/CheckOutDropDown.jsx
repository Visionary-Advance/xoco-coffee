'use client';
import { useState } from 'react';
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';

const OrderSummaryDropdown = ({ cartItems, calculateSubtotal, calculateTip }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full libre max-w-md mx-auto">
      {/* Dropdown Button */}
      <button
  onClick={() => setIsOpen(!isOpen)}
  className={`w-full bg-[#806248] text-white text-left px-4 py-3 flex justify-between items-center ${
    isOpen ? 'rounded-t-lg' : 'rounded-lg'
  }`}
>
        <span className="font-semibold text-xl">
        {cartItems.reduce((acc, item) => acc + item.quantity, 0)} {cartItems.length === 1 ? 'Item' : 'Items'} in Cart
        </span>
        {isOpen ? <FaChevronUp className="w-5 h-5" /> : <FaChevronDown className="w-5 h-5" />}
      </button>

      {/* Dropdown Content with Animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-[#806248] rounded-b-lg"
          >
            <div className="p-6 text-white">
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

              {/* Cart Items */}
              <div className="divide-y divide-[#A98866]">
                {cartItems.map(item => (
                  <div key={`${item.id}-${item.size}-${item.temperature}`} className="py-4 flex">
                    <div className="h-16 w-16 rounded-full overflow-hidden mr-4 bg-[#50311D] flex-shrink-0">
                      <img src={item.img} alt={item.name} className="h-full w-full object-cover" />
                    </div>

                    <div className="flex-grow">
                      <div className="flex justify-between mb-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                     <p className="text-sm">
  {item.size.name} • {item.temperature === 'hot' ? 'Hot' : 'Iced'} •{" "}
  {item.modifiers
    ?.flatMap(group =>
      (group.modifiers || []).map(mod => mod.name)
    )
    .join(', ')}
</p>

                      {item.specialInstructions && (
                      <p>Special Instructions: {item.specialInstructions} </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

             
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderSummaryDropdown;
