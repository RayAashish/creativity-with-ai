/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        sepia: {
          50: '#fcf8f0',
          100: '#f8f1e1',
          200: '#f1e2c4',
          300: '#e7cfa2',
          400: '#dbb67c',
          500: '#c89956',
          600: '#ad7a41',
          700: '#895a32',
          800: '#6d4529',
          900: '#432d1f',
          bg: '#fbf0d9',
          surface: '#f5e7c8',
          text: '#433422',
          muted: '#806952',
          border: '#e4d3b6',
        },
      },
    },
  },
  plugins: [],
};
