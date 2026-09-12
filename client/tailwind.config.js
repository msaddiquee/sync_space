/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        palette: {
          cream: {
            50: '#FAF8F5',
            100: '#F4EFEA',
            200: '#E3DCD2', // Primary Cream
            300: '#D5CBBF',
            400: '#C2B4A3',
          },
          terracotta: {
            DEFAULT: '#CC8B65', // Primary Terracotta
            50: '#FBF4EF',
            100: '#F4E4D9',
            200: '#E7C3AC',
            300: '#DCA281',
            400: '#D39673',
            500: '#CC8B65',
            600: '#B8744C',
            700: '#965A37',
          },
          forest: {
            DEFAULT: '#013328', // Deep Forest Green
            50: '#E6F0ED',
            100: '#C3DDD6',
            200: '#8FBDB1',
            300: '#549887',
            400: '#236F5E',
            500: '#064E3E',
            600: '#013328',
            700: '#01281F',
            800: '#011F18',
            900: '#011510',
          },
          espresso: {
            DEFAULT: '#100C0D', // Earthy Espresso
            50: '#2E2527',
            100: '#241D1F',
            200: '#1C1618',
            300: '#151011',
            400: '#100C0D',
          },
        },
        brand: {
          50: '#FBF4EF',
          100: '#F4E4D9',
          500: '#CC8B65',
          600: '#B8744C',
          700: '#965A37',
        },
      },
    },
  },
  plugins: [],
};

