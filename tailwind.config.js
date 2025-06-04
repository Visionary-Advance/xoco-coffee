// tailwind.config.js
module.exports = {
    content: ['./app/**/*.{js,ts,jsx,tsx}'],
    theme: {
      extend: {
        keyframes: {
          scroll: {
            '0%': { transform: 'translateX(0)' },
            '100%': { transform: 'translateX(-50%)' },
          },
        },
        animation: {
          scroll: 'scroll 30s linear infinite',
        },
      },
    },
    plugins: [],
  }
  