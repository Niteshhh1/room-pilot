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
          background: '#0f172a',
          primary: '#6366f1',
          secondary: '#22c55e',
          surface: '#1e293b',
          surface2: '#334155'
        }
      }
    },
  },
  plugins: [],
}
