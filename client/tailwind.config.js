/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        medical: {
          50: '#F0F7FF',
          100: '#E0F0FE',
          200: '#BAE0FD',
          300: '#7CC8FA',
          400: '#36A9F6',
          500: '#0C8BE8',
          600: '#006EC6',
          700: '#0157A3',
          800: '#064B86',
          900: '#0B3F6F',
          950: '#07284A',
        },
      },
    },
  },
  plugins: [],
};
