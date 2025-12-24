/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#FEFDFB',
          100: '#FDF9F3',
          200: '#F9F1E4',
        },
        ink: {
          900: '#1C1917',
          700: '#44403C',
          500: '#78716C',
          300: '#D6D3D1',
          200: '#E7E5E4',
          100: '#F5F5F4',
        },
        amber: {
          600: '#D97706',
          700: '#B45309',
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(28, 25, 23, 0.06), 0 1px 2px rgba(28, 25, 23, 0.04)',
        'card-hover': '0 10px 24px rgba(28, 25, 23, 0.08), 0 4px 8px rgba(28, 25, 23, 0.04)',
      },
    },
  },
  plugins: [],
}