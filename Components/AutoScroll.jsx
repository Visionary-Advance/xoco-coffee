'use client';

import Image from 'next/image';

const AutoScrollCarousel = () => {
  const images = ['DSC02093.jpg', 'DSC02178.jpg', 'DSC01953.jpg', 'DSC02040.jpg', 'DSC01951.jpg', 'DSC02130.jpg', 'DSC02098.jpg', 'DSC02147.jpg', 'DSC02023.jpg', 'DSC02028.jpg'];

  return (
    <div className="relative overflow-hidden -mb-16 px-6 z-10">
      <div className="scroll-track mb-5 flex gap-6 whitespace-nowrap">
        {/* Render images twice for seamless loop */}
        {images.concat(images).map((img, i) => (
          <Image
            key={i}
            src={`/Img/${img}`}
            width={350}
            height={350}
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