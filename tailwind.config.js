/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A2B3C',
        secondary: '#00BFA5',
        'bg-light': '#F0F2F5',
        'text-dark': '#333333',
        accent: '#FF6B6B',
        success: '#00BFA5',
        warning: '#FFA726',
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}