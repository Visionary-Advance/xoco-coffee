'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoMenu, IoClose  } from "react-icons/io5";
import Button from './Button'
import Cart from './Cart';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [squareItems, setSquareItems] = useState([]); // Add state for Square items

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(savedCart);
  }, []);

  // Fetch Square items for cart editing
  useEffect(() => {
    const fetchSquareItems = async () => {
      try {
        const response = await fetch('/api/square-items');
        const data = await response.json();
        setSquareItems(data.items || []);
      } catch (error) {
        console.error('Error fetching Square items in Header:', error);
      }
    };

    fetchSquareItems();
  }, []);

  useEffect(() => {
    const handleCartChange = () => {
      const updatedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(updatedCart);
    };
  
    window.addEventListener('cartUpdated', handleCartChange);
  
    return () => {
      window.removeEventListener('cartUpdated', handleCartChange);
    };
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen)
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  // Function to get full item data by ID for cart editing
  const getFullItemData = (itemId) => {
    return squareItems.find(item => item.id === itemId) || null;
  };

  return (
    <header className="bg-[#50311D] text-white relative h-[90px] flex items-center">
      {/* Desktop */}
      <div className="hidden md:flex px-4 mx-5 items-center justify-between w-full">
        <nav className="flex space-x-6 text-lg libre-bold">
          <Link href="/">Home</Link>
          <Link href="/menu">Menu</Link>
          <Link href="/events">Events</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="flex items-center libre space-x-8">
        <motion.span
  className="text-lg cursor-pointer hover:text-[#d9c3a0]"
  onClick={toggleCart}
  key={cartItems.reduce((acc, item) => acc + item.quantity, 0)} // 👈 triggers animation on change
  initial={{ scale: 1 }}
  animate={{ scale: [1.2, 1] }}
  transition={{ duration: 0.3 }}
>
  Cart({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
</motion.span>
<Link href={"/menu"}>
          <Button color={"bg-white"} text={"Order Now"} width={"px-1 py-2"} />
          </Link>
        </div>
      </div>

      {/* Mobile/Tablet */}
      <div className="md:hidden px-4 mx-5 flex justify-between items-center w-full">
        {/* Left: Logo */}
        <img
          src="/Img/Xocolate_Coffee_Co_Logo.png"
          alt="Xocolate Coffee Co. Logo"
          className="w-[60px]"
        />

        {/* Center: Cart */}
        <motion.span
  className="text-lg cursor-pointer hover:text-[#d9c3a0]"
  onClick={toggleCart}
  key={cartItems.reduce((acc, item) => acc + item.quantity, 0)} // 👈 triggers animation on change
  initial={{ scale: 1 }}
  animate={{ scale: [1.2, 1] }}
  transition={{ duration: 0.3 }}
>
  Cart({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
</motion.span>
        {/* Right: Hamburger */}
        <button onClick={toggleMenu} aria-label="Toggle menu">
          {menuOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
        </button>
      </div>

      {/* Animated Slide Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ y: -200 }}
            animate={{ y: 0 }}
            exit={{ y: -200 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute top-full left-0 w-full bg-[#50311D] flex flex-col items-center py-6 z-50 space-y-6 text-lg libre-bold md:hidden"
          >
            <Link href="/" onClick={toggleMenu}>Home</Link>
            <Link href="/menu" onClick={toggleMenu}>Menu</Link>
            <Link href="/events" onClick={toggleMenu}>Events</Link>
            <Link href="/about" onClick={toggleMenu}>About</Link>
            <Link href="/contact" onClick={toggleMenu}>Contact</Link>
            <Link href={"/menu"}>
            <Button color={"bg-white"} text="Order Now" />
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Center logo stays for desktop */}
      <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <img
          src="/Img/Xocolate_Coffee_Co_Logo.png"
          alt="Xocolate Coffee Co. Logo"
          className="w-[80px]"
        />
      </div>
      
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        setCartItems={setCartItems}
        getFullItemData={getFullItemData} // Add the missing prop
      />
    </header>
  )
}