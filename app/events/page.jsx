export default function Events(){

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
          <h2 className="text-white libre text-5xl font-bold">Events
          </h2>
        </div>
      </div>


        {/* CARDS */}


        <div className="libre mt-10 mb-20 rounded-xl p-6 flex flex-col md:flex-row gap-6 max-w-5xl w-11/12 mx-auto items-stretch">
  {/* Left image */}
  <div className="w-full md:w-1/3 flex">
    <img
      src='/Img/About_Img.png'
      alt="June Bloom Market"
      className="rounded-xl object-cover w-full h-full"
    />
  </div>

  {/* Right text content */}
  <div className="flex flex-col justify-between text-white w-full">
  <span className="inline-block border border-white rounded-full px-3 py-1 text-sm text-white mb-2 self-start">
  Market
</span>

    <h2 className="text-3xl font-bold text-white mb-2">
      June Bloom Market
    </h2>

    <p className="text-white mb-4">
      Come join us at the first-ever June Bloom Market! Located at the Xcaanda Venue in Junction City. We will serve our signature Mexican Mocha, our Signature Breakfast Sandwiches, Lunch Sandwiches, and our in-house baked goods. See less
    </p>

    <div>
      <p className="text-white ">June 28</p>
      <p className="text-white">12PM–6PM</p>
    </div>
  </div>
</div>

      </>

    );
}