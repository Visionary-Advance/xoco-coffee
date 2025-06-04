'use client';

const AutoScrollCarousel = () => {
  const images = ['About_Img.jpg', 'About_Img.jpg', 'About_Img.jpg', 'About_Img.jpg'];

  return (
    <div className="relative overflow-hidden -mb-16 px-6 z-10">
      <div className="scroll-track mb-5 flex gap-6 whitespace-nowrap">
        {[...images, ...images].concat(images).map((img, i) => (
          <img
            key={i}
            src={`/Img/${img}`}
            className="w-[350px] h-[350px] shadow-[8px_8px_0_#806248] object-cover rounded-[30px]  shrink-0"
            alt={`Slide ${i}`}
          />
        ))}
      </div>

      <style jsx>{`
        .scroll-track {
          animation: scroll-left 30s linear infinite;
          display: flex;
        }

        @keyframes scroll-left {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default AutoScrollCarousel;
