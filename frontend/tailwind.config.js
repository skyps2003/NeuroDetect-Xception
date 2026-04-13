/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'medical-indigo': '#4f46e5',
        'medical-violet': '#7c3aed',
        'dark-bg': '#0f172a',
        'card-bg': '#1e293b',
      }
    },
  },
  plugins: [],
}
