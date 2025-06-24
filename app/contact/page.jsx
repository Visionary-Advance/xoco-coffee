import Button from "@/Components/Button";

export default function Contact() {
  return (
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
          <h2 className="text-white libre text-5xl font-bold">Contact</h2>
        </div>
      </div>

      <div className="lg:max-w-6xl w-11/12 libre mt-10 mx-auto grid md:grid-cols-2 gap-10 items-stretch">
        {/* Image Container */}
        <div className="rounded-[30px] order-2 lg:order-1 overflow-hidden shadow-[8px_8px_0_#806248] h-full">
          <img
            src="/Img/AboutPage_Img.jpg"
            alt="Cafe"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Form */}
        <div className="flex order-1 lg:order-2 flex-col justify-between">
          <div>
            <h2 className="text-5xl font-bold mb-6 text-white">Let’s Talk!</h2>
            <form className="space-y-6 h-full">
              <div>
                <label
                  className="block mb-1 text-white font-semibold"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full border-b-2 border-white bg-transparent outline-none py-2 text-white placeholder-white"
                  placeholder=""
                />
              </div>
              <div>
                <label
                  className="block mb-1 text-white font-semibold"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full border-b-2 border-white bg-transparent outline-none py-2 text-white placeholder-white"
                  placeholder=""
                />
              </div>
              <div>
                <label
                  className="block mb-1 text-white font-semibold"
                  htmlFor="message"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  className="w-full border-b-2 border-white bg-transparent outline-none py-2 text-white placeholder-white"
                  placeholder=""
                ></textarea>
              </div>
              <div className="w-full">
                <Button text={"Send"} width={"py-2 px-6"} color={'bg-white'} />
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="lg:max-w-6xl w-11/12 libre mx-auto mt-12 grid md:grid-cols-3 gap-8 text-white text-center  lg:pt-10">
        <div className="flex flex-col lg:border-r lg:items-center justify-start">
          <div className="text-left">
            <h3 className="text-3xl font-bold mb-2">Address</h3>
            <p>
              995 Tyinn St #1,
              <br />
              Eugene, OR 97402
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:border-r  lg:items-center justify-start">
          <div className="text-left">
            <h3 className="text-3xl font-bold mb-2">Email Address</h3>
            <p>
              Get in touch with us and
              <br />
              let us know how we can help
            </p>
            <p className="mt-2">Info@Xocolatecoffeeco.com</p>
          </div>
        </div>

        <div className="flex flex-col lg:items-center justify-start">
          <div className="text-left">
            <h3 className="text-3xl font-bold mb-2">Give Us A Call</h3>
            <p className="italic">541-684-0066</p>
          </div>
        </div>
      </div>

     
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2867.6417750219143!2d-123.1363413!3d44.0494548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54c11f082979291f%3A0xa00a6bf6b9891415!2sXocolate%20Coffee%20Co!5e0!3m2!1sen!2sus!4v1750711607791!5m2!1sen!2sus"
        width="90%"
        height="470"
        className="mx-auto mt-8 rounded-[30px]"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </>
  );
}
