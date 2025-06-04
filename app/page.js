import LandingAnimation from "@/Components/LandingAnimation";
import TalveraBanner from "@/Components/TalveraBanner";

import { FaCoffee } from "react-icons/fa";
import { BiSolidCoffeeBean } from "react-icons/bi";
import Button from "@/Components/Button";
import BakedGoods from "@/Components/BakedGoods";
import Link from "next/link";

export default function Home() {

  

  const drinks = [
    {
      name: "Espresso",
      description: "A classic, bold shot of rich espresso.",
      price: "$8",
      image: "/coffee.png",
    },
    {
      name: "Americano",
      description: "A classic, bold shot of rich espresso.",
      price: "$8",
      image: "/coffee.png",
    },
    {
      name: "Latte",
      description: "A smooth blend of espresso and steamed milk.",
      price: "$8",
      image: "/coffee.png",
    },
    {
      name: "Cappuccino",
      description: "A bold espresso topped with rich, foamy milk.",
      price: "$8",
      image: "/coffee.png",
    },
    {
      name: "Mocha",
      description: "A creamy mix of espresso, chocolate, and steamed milk.",
      price: "$8",
      image: "/coffee.png",
    },
    {
      name: "Chai Latte",
      description: "A warm blend of spiced chai and steamed milk.",
      price: "$8",
      image: "/coffee.png",
    },
    {
      name: "Hot Chocolate",
      description: "A rich, velvety cup of sweet chocolate goodness.",
      price: "$8",
      image: "/coffee.png",
    },
    {
      name: "Matcha Latte",
      description: "A smooth, earthy green tea mixed with steamed milk.",
      price: "$8",
      image: "/coffee.png",
    },
  ]
  return (
    <main>
      <LandingAnimation />

      <section className="">
        <TalveraBanner />
      </section>

      <section className="mt-10 flex flex-col relative libre gap-1">
        {/* First Row: Image Left, Text Right */}
        <div className="flex flex-wrap items-center w-full mx-auto">
          <div className="py-4 w-full  lg:w-1/2">
            <img
              src="/Img/About_Img.jpg"
              alt="Latte art"
              className="rounded-[30px]  w-80 h-80 lg:w-[400px] lg:h-[400px] object-cover shadow-[8px_8px_0_#86654B] mx-auto lg:mx-0 lg:ms-auto"
            />
          </div>

          <div className="p-4 w-full md:w-1/2 mx-auto flex items-center">
            <div className="ms-5">
              <h2 className="font-bold text-5xl libre-bold lg:w-6/12 text-white">
                Try Our Coffee Today!
              </h2>
              <p className="text-white mt-6 lg:w-1/2 text-xl">
                Taste the difference with locally sourced coffee from Cafeto,
                roasted right here in Eugene, Oregon - Crafted with care for
                unbeatable flavor.
              </p>
              <div className="flex flex-col gap-4 mt-5">
  <div className="flex items-center gap-3">
    <div className="rounded-2xl bg-[#806248] w-14 h-14 flex items-center justify-center shrink-0">
      <FaCoffee className="text-4xl text-white" />
    </div>
    <span className="text-white text-2xl leading-snug">
      Hand Crafted Coffee
    </span>
  </div>
  <div className="flex items-center gap-3">
    <div className="rounded-2xl bg-[#806248] w-14 h-14 flex items-center justify-center shrink-0">
      <BiSolidCoffeeBean className="text-4xl text-white" />
    </div>
    <span className="text-white text-2xl leading-snug">
      Locally Sourced Ingredients
    </span>
  </div>
</div>

            </div>
          </div>
        </div>

        {/* Second Row: Text Left, Image Right */}
        <div className="flex flex-wrap w-full text-right">
          <div className="p-4 w-full md:w-1/2 flex items-center order-2 md:order-1">
            <div>
              <h2 className="font-bold text-5xl libre-bold text-white">About Us</h2>
              <p className="text-white mt-6 lg:w-1/2  lg:ms-auto text-xl">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu
              </p>
             <div className="mt-6">
              <Link href={"/about"}>
              <Button color={"bg-white"} text={"Read More"} width={"px-1 py-2"}/>
              </Link>
              </div>
            </div>
          </div>

          <div className="p-4 w-full md:w-1/2 order-1 md:order-2">
            <img
              src="/Img/About_Img.jpg"
              alt="Coffee beans"
              className="rounded-[30px] w-80 h-80 lg:w-[400px] lg:h-[400px] object-cover shadow-[8px_8px_0_#86654B] mx-auto lg:mx-0 lg:me-auto"
            />
          </div>
        </div>
    
        {/* Wave divider (sits flush with the top of next section) */}
</section>
<div className="w-full overflow-hidden z-50 rotate-180" style={{ height: "160px", position: "relative" }}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 160"
    preserveAspectRatio="none"
    style={{ width: "100%", height: "160px" }}
  >
    <path
      d="M0,80
        C120,0 240,160 360,80
        C480,0 600,160 720,80
        C840,0 960,160 1080,80
        C1200,0 1320,160 1440,80
        V160 H0 Z"
      fill="#E6D5B8"
    />
  </svg>
</div>

{/* Bottom content section (blends with wave) */}
<section className="bg-[#806248] -mt-36 pb-48 lg:pb-32 " style={{ position: "relative", zIndex: 10 }}>
  <div className="translate-y-[10%] place-items-center ">
  <img className="w-80" src="/Img/Sunburst.png"/>
  <h2 className="libre text-5xl mt-4 text-[#D4CABC]">Our Menu</h2>
  <div className=" text-white px-8 py-12">
  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
    {drinks.map((item, index) => (
      <div
      key={index}
      className="flex items-start gap-4  text-white p-4 rounded-lg w-full max-w-md"
    >
      <img
        src={item.image}
        alt={item.name}
        className="w-20 h-20 border border-black rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="flex items-center">
          <span className="lg:text-2xl text-xl font-semibold whitespace-nowrap mr-2">{item.name}</span>
          <div className="flex-grow border-b border-dotted border-white mt-5 me-1 h-0"></div>
          <span className="lg:text-2xl text-xl font-semibold whitespace-nowrap">{item.price}</span>
        </div>
        <p className="text-sm lg:text-lg text-white/90 mt-1">{item.description}</p>
      </div>
    </div>
    
    
    ))}
  </div>
</div>
    <div className="z-50">
  <Button color={"bg-white"} text={"Order Now"} width={"px-1 py-2"} />
  </div>
  </div>
  
</section>

<section className="">
<BakedGoods/>
</section>



      
    </main>
  );
}
