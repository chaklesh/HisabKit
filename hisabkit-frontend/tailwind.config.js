/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#2E3A59", // Deep Indigo
          secondary: "#10B981", // Emerald Green
          accent: "#4F46E5",
          background: "#F9FAFB"
        }
      }
    },
  },
  plugins: [],
}
