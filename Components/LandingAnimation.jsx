'use client';

import { motion } from 'framer-motion';
import Button from './Button';
import Link from 'next/link';

export default function LandingAnimation() {
  return (
    <section className="h-screen flex flex-col text-center relative bg-[#E6D5B8] items-center px-4 overflow-hidden">
      {/* Coffee Plant - slide in */}
      <motion.img
        src="/Img/Coffee_Plant.png"
        alt="Coffee Plant"
        className="absolute w-70 -left-3 translate-y-44 hidden lg:block"
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
      />

      {/* Coffee Beans - pop in one-by-one */}
      <motion.img
        src="/Img/Coffee_Bean_2.png"
        alt="Coffee Bean"
        className="absolute top-[10%] left-[10%] lg:left-[20%] w-12 lg:w-18"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      />
      <motion.img
        src="/Img/3_Coffee_Beans.png"
        alt="3 Coffee Beans"
        className="absolute lg:top-[50%] top-[45%] left-[76%] md:left-[90%] lg:left-[76%] w-20 lg:w-28"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.5 }}
      />
      <motion.img
        src="/Img/Coffee_Bean.png"
        alt="Coffee Bean"
        className="absolute top-[72%] left-[-3%] md:left-[1%] lg:left-[17%] w-22 lg:w-28"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.5 }}
      />

      {/* Content - fade in first */}
      <motion.div
        className="z-10 mt-4 flex-shrink-0 "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 1 }}
      >
        <img className="w-34 mx-auto" src="/Img/Flourish.png" alt="Flourish" />
        <h1 className="libre-bold text-white text-4xl sm:text-5xl leading-tight mt-2">
          Mi Casa Es <br /> Tu Casa
        </h1>
        <p className="text-white text-xl sm:text-2xl libre-bold mt-4">
          Bienvenidos to Xocolate Coffee Company
        </p>
        <p className="text-white text-base sm:text-lg mt-4 px-2">
          Join us for a cup of locally roasted and organic coffee, delicious
          pastries, and a warm atmosphere.
        </p>
        <div className="my-6">
          <Link href={'/menu'}>
          <Button color={"bg-white"} text="Order Now" width={"px-1 py-2"} />
          </Link>
        </div>
      </motion.div>

      {/* Bottom Image */}
      <div className="lg:w-[60%] w-[95%] flex-grow overflow-hidden rounded-t-[40px]">
        <img
          className="w-full h-full object-cover"
          src="/Img/Landing.webp"
          alt="Coffee shop"
        />
      </div>
    </section>
  );
}
