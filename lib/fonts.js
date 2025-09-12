// lib/fonts.js
import localFont from 'next/font/local'

// Regular Libre Baskerville
export const libreBaskerville = localFont({
  src: [
    {
      path: '../public/Fonts/LibreBaskerville-Regular.ttf',
      weight: '400',
      style: 'normal',
    }
  ],
  variable: '--font-libre',
  display: 'swap',
})

// Bold Libre Baskerville
export const libreBaskervilleBold = localFont({
  src: [
    {
      path: '../public/Fonts/LibreBaskerville-Bold.ttf',
      weight: '700',
      style: 'normal',
    }
  ],
  variable: '--font-libre-bold',
  display: 'swap',
})