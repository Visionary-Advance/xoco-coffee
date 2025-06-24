'use client'

import { useEffect, useState } from "react";
import Button from "./Button";
import Link from "next/link";


export default function BakedGoods(){
    const [count, setCount] = useState(0);
  
    const borderImage = '/Img/Talvera.png'; 
    const borderImageWidth = 16; 

    const bakedGoods = [
        {name: "Homemade Bagels", price:"$5", description:"A flaky, buttery pastry with a golden, crisp exterior and soft layers inside"},
        {name: "Mexican Sweet Bread", price:"$4", description:"A variety of sweet, fluffy pastries like conchas, that pair perfect with coffee"},
        {name: "Banana Nut Bread", price:"$4", description:"A rich, layered pastry filled with fruit, cream cheese, or custard with a light glaze"},
    ]
  
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

    return(
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
      <div className="mt-5">
  <img className="w-34 mx-auto" src="/Img/Flourish.png" alt="Flourish" />
  <h3 className="text-white mt-5 text-center libre-bold text-5xl">
    Fresh Baked Goods
  </h3>

  <div className="w-11/12 lg:w-10/12 mx-auto my-10 flex flex-col lg:flex-row gap-10  lg:items-start justify-center">
  {bakedGoods.map((item, index) => (
  <div
    key={index}
    // flex flex-col items-center text-center lg:text-left
    className="flex flex-col items-center mx-auto lg:mx-0 text-left w-80 lg:w-[400px]"
  >
    <img
      className="rounded-[30px] w-[400px] h-80 lg:h-[400px] shadow-[8px_8px_0_#86654B] object-cover"
      src="/Img/About_Img.jpg"
    />
    <h4 className="text-white lg:text-[28px] text-[23px] libre-bold mt-5 mb-2 w-full">
      {item.name} - {item.price}
    </h4>
    <p className="lg:text-lg libre  w-full text-white">
      {item.description}
    </p>
  </div>
))}

  </div>
  <div className="mb-5 flex justify-center">
    <Link href={"/menu"}>
  <Button color={"bg-white"} text={"Order Now"} width={"px-1 py-2"} />
  </Link>
  </div>
</div>

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