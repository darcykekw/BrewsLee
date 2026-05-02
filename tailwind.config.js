/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brown: { DEFAULT: "#4A2C2A", light: "#6B3F3C", dark: "#2E1A19" },
        cream: { DEFAULT: "#F5F0E8", dark: "#E8DDD0" },
        gold: { DEFAULT: "#C8963E", light: "#DBA84E", dark: "#A87830" }
      }
    },
  },
  plugins: [],
}
