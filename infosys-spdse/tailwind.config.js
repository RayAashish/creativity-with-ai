/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        serif: ['Newsreader', 'Georgia', 'serif'],
      },
      colors: {
        paper: {
          50: '#fafaf9',
          100: '#f5f5f3',
          200: '#e8e8e3',
          300: '#d7d7ce',
          800: '#1e2022',
          900: '#141618',
          950: '#0e1011',
        },
        accent: {
          light: '#0d9488',
          DEFAULT: '#0f766e',
          dark: '#14b8a6',
        }
      },
      borderRadius: {
        DEFAULT: '3px',
        sm: '2px',
        md: '4px',
        lg: '6px',
      }
    },
  },
  plugins: [],
}
