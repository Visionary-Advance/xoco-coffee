'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FaAngleRight, FaAngleLeft } from "react-icons/fa";




export default function About(){

  const testimonials = [
    {
      name: 'Stacy Morgan',
      quote:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
      name: 'Carlos Ramirez',
      quote:
        'This company is amazing. The attention to detail and customer care really stand out. Highly recommended!',
    },
    {
      name: 'Jenna Lee',
      quote:
        'I’ve never had a smoother experience. Everything was top-notch from start to finish!',
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
        src="/Img/Title_1.jpg"
        alt="Cafe interior"
        className="rounded-[30px] shadow-[8px_8px_0_#806248] w-full md:w-1/2 object-cover"
      />
      {/* Text */}
      <div className="text-white libre md:w-1/2">
        <h2 className="text-5xl font-bold mb-4">Title 1</h2>
        <p className="text-lg leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
          ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
    </div>

    {/* Row 2 */}
    <div className="flex flex-col md:flex-row-reverse items-center gap-10">
      {/* Image */}
      <img
        src="/Img/Title_2.jpg"
        alt="Coffee closeup"
        className="rounded-[30px] shadow-[8px_8px_0_#806248] w-full md:w-1/2 object-cover"
      />
      {/* Text */}
      <div className="text-white text-right libre md:w-1/2">
        <h2 className="text-5xl font-bold mb-4">Title 2</h2>
        <p className="text-lg leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
          ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
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