import AutoScrollCarousel from "./AutoScroll";
import { FaInstagram, FaFacebookF  } from "react-icons/fa";
import Button from "./Button";

export default function Footer(){
    return(


<div className="relative mt-6 z-0 ">

  
<AutoScrollCarousel/>


<footer className="relative z-0 bg-[#4B2E24] pt-24 pb-10 px-6">
  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 text-white text-center md:text-left">

    {/* Logo Section */}
    <div className="w-9/12 md:border-r md:pr-6 border-white mx-auto md:mx-0">
      <img src="/Img/Xocolate_Coffee_Co_Logo.png" className="mx-auto w-32" />
      <p className="libre">Come and enjoy our coffee and atmosphere</p>
      <div className="flex text-lg justify-center md:justify-start gap-2 mt-3">
        <span><FaInstagram /></span>
        <span><FaFacebookF /></span>
      </div>
    </div>

        
    {/* Contact Section */}
    <div className=" md:px-6  border-white">
      <h4 className="text-3xl libre font-bold mb-2">Contact</h4>
      <div className="libre space-y-1.5">
        <p>995 Tyinn St #1,<br /> Eugene, OR 97402</p>
        <p>555-555-5555</p>
        <p>Info@xocolatecoffeeco.com</p>
      </div>
    </div>

    {/* Hours Section */}
    <div className="md:border-r  md:px-6 border-white">
      <h4 className="text-3xl libre font-bold mb-2">Hours</h4>
      <div className="libre space-y-1.5">
        <p>Monday - Friday:<br /> 6am–2pm</p>
        <p>Saturday:<br /> 7am–3pm</p>
      </div>
    </div>

    {/* Order Section */}
    <div className="bg-[#A5907B] text-white w-8/12 mx-auto shadow-[8px_8px_0_#E6D5B8] p-6 rounded-[30px] libre flex flex-col items-center justify-center">
      <h4 className="text-2xl font-bold mb-3 text-center">Ready to Get Started?</h4>
      <Button text={"Order Now"} width={"px-1 py-2"}/>
    </div>

  </div>
</footer>

</div>




    );
}




