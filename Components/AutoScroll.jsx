'use client';

const AutoScrollCarousel = () => {
  const images = ['club.webp', 'coffee.webp', 'eggs.webp', 'cookies.webp', 'coffee4.webp', 'macroons.webp', 'sandwich.webp', 'outside.webp'];

  return (
    <div className="relative overflow-hidden -mb-16 px-6 z-10">
      <div className="scroll-track mb-5 flex gap-6 whitespace-nowrap">
        {/* Render images twice for seamless loop */}
        {images.concat(images).map((img, i) => (
          <img
            key={i}
            src={`/Img/${img}`}
            className="w-[350px] h-[350px] shadow-[8px_8px_0_#806248] object-cover rounded-[30px] shrink-0"
            alt={`Slide ${i}`}
          />
        ))}
      </div>

      <style jsx>{`
        .scroll-track {
          animation: scroll-left 50s linear infinite;
          display: flex;
        }

        @keyframes scroll-left {
          from {
            transform: translateX(0);
          }
          to {
            /* Move by exactly the width of one complete set including gaps */
            transform: translateX(calc(-356px * 8));
          }
        }
      `}</style>
    </div>
  );
};

export default AutoScrollCarousel;