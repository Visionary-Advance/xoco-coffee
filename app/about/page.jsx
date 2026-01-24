'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FaAngleRight, FaAngleLeft } from "react-icons/fa";




export default function About(){

  const testimonials = [
    {
      name: 'Sarah M.',
      quote:
        'The Mexican mocha is absolutely incredible! The Abuelita chocolate adds such a unique, warm flavor. This is my new favorite coffee spot in Eugene.',
    },
    {
      name: 'Carlos R.',
      quote:
        'Finally, authentic Latin-inspired coffee drinks in Eugene! The homemade bagel sandwiches are amazing too. Analley makes the best bagels in town.',
    },
    {
      name: 'Jennifer L.',
      quote:
        'Such a cozy, family-owned spot. You can taste the love in every cup. The drinking chocolate with sweet bread is the perfect breakfast treat!',
    },
  ]

  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const next = () => {
    setDirection(1)
    setIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setDirection(-1)
    setIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    )
  }

    return(

        <>
        
        <div className="relative w-11/12 mx-auto h-60 lg:h-96 rounded-[30px] overflow-hidden mt-10 shadow-[8px_8px_0_#806248]">
  {/* Image */}
  <img
    src="/Img/AboutPage_Img.jpg"
    alt="Picture of the cafe"
    className="w-full h-full object-cover"
  />

  {/* Dark overlay */}
  <div className="absolute inset-0 bg-black/50"></div>

  {/* Centered text */}
  <div className="absolute inset-0 flex items-center justify-center">
    <h2 className="text-white libre text-5xl font-bold">About</h2>
  </div>
</div>

<div className="lg:max-w-6xl w-11/12 mx-auto mt-16 space-y-20">
    {/* Row 1 */}
    <div className="flex flex-col md:flex-row items-center gap-10">
      {/* Image */}
      <img
        src="/Img/Outside.jpg"
        alt="Cafe Exterior"
        className="rounded-[30px] shadow-[8px_8px_0_#806248] w-full md:w-5/12 object-cover"
      />
      {/* Text */}
      <div className="text-white libre md:w-1/2">
        <h2 className="text-5xl font-bold mb-4">Our Story</h2>
        <p className="text-lg leading-relaxed">
          Xocolate Coffee Co. is a locally family-owned coffee shop and cafe
          in Eugene, Oregon, owned by Jeshua Castellanos and Analley Sanchez.
          We built our menu around our signature chocolate ganache made with
          Abuelita Chocolate, a beloved chocolate popular in Mexico. The result
          is drinks that are sweet, nutty, and slightly spicy - like our famous
          Mexican mocha that adds a whole new depth of flavor to your morning.
        </p>
      </div>
    </div>

    {/* Row 2 */}
    <div className="flex flex-col md:flex-row-reverse items-center gap-10">
      {/* Image */}
      <img
        src="/Img/Fresh.jpg"
        alt="Coffee closeup"
        className="rounded-[30px] shadow-[8px_8px_0_#806248] w-full md:w-5/12 object-cover"
      />
      {/* Text */}
      <div className="text-white text-right libre md:w-1/2">
        <h2 className="text-5xl font-bold mb-4">Fresh & Local</h2>
        <p className="text-lg leading-relaxed">
          We're your one-stop breakfast spot, serving up Latin-inspired drinks
          alongside made-to-order bagel sandwiches and fresh pastries. Analley
          makes all of our bagels from scratch daily. Our coffee is locally
          sourced from Cafeto, roasted right here in Eugene, Oregon. From
          drinking chocolate and sweet bread to smoothies and lunch items,
          we have something delicious for everyone.
        </p>
      </div>
    </div>
  </div>

  <div className="relative libre py-24 px-4 text-center overflow-hidden">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 relative z-10">
        What Our Customers Have to{' '}
        <span className="text-[#806248]">Say</span>
      </h2>

      {/* Giant quotation mark */}
      <div className="absolute top-[34%] lg:top-[28%] left-1/2 -translate-x-1/2 text-[#806248] text-[200px] leading-none  z-0 select-none">
        &rdquo;
      </div>

      <div className="relative z-10 h-[160px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-white text-lg md:text-2xl  leading-relaxed absolute"
          >
            {testimonials[index].quote}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 h-12 mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`name-${index}`}
            initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
            transition={{ duration: 0.5 }}
            className="text-2xl text-[#5C3A21] font-semibold absolute w-full"
          >
            {testimonials[index].name}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-4 mt-6 relative z-10">
        <button
          onClick={prev}
          className="border border-[#5C3A21] text-4xl rounded-md  text-[#5C3A21] hover:bg-[#d8c09b] transition"
        >
          <FaAngleLeft />
        </button>
        <button
          onClick={next}
          className="border border-[#5C3A21] text-4xl rounded-md  text-[#5C3A21] hover:bg-[#d8c09b] transition"
        >
          <FaAngleRight/>
        </button>
      </div>
    </div>

        
        
        </>


    );
}