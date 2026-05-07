/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Animaciones para el panel de Moltbot
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-bottom': 'slideInBottom 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-in',
      },

      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        slideInBottom: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },

      // Colores personalizados para Moltbot
      colors: {
        moltbot: {
          primary: '#9333ea',    // purple-600
          hover: '#7e22ce',      // purple-700
          light: '#a855f7',      // purple-500
          dark: '#6b21a8',       // purple-800
        }
      },

      // Box shadows personalizados
      boxShadow: {
        'moltbot': '0 0 20px rgba(147, 51, 234, 0.3)',
        'approval': '0 0 15px rgba(250, 204, 21, 0.4)',
      }
    },
  },
  plugins: [],
}
