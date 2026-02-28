/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores personalizadas para confeitaria
        confeitaria: {
          rosa: '#ff85a1',
          creme: '#fdf8f9',
          chocolate: '#4b3832'
        }
      }
    },
  },
  plugins: [],
}