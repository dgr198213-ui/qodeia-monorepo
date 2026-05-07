/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        qodeia: {
          blue: {
            50: '#e6f3f7',
            100: '#cce7ef',
            200: '#99cfe0',
            300: '#66b7d0',
            400: '#339fc1',
            500: '#0087b1', // Azul principal del logo
            600: '#006c8e',
            700: '#00516a',
            800: '#003647',
            900: '#001b23',
          },
          mint: {
            50: '#e6faf4',
            100: '#ccf5e9',
            200: '#99ebd3',
            300: '#66e1bd',
            400: '#33d7a7',
            500: '#00cd91', // Verde menta del reloj
            600: '#00a474',
            700: '#007b57',
            800: '#00523a',
            900: '#00291d',
          },
          dark: {
            50: '#e8eaeb',
            100: '#d1d5d7',
            200: '#a3aaaf',
            300: '#758087',
            400: '#47555f',
            500: '#192b37', // Azul oscuro del fondo
            600: '#14222c',
            700: '#0f1a21',
            800: '#0a1116',
            900: '#05090b',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
