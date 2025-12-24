/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bablo': {
          bg: '#1F2228',
          card: 'rgba(26, 27, 30, 0.5)',
          gold: '#F0B90B',
          green: '#10B981',
          red: '#EF4444',
          border: 'rgba(255, 255, 255, 0.05)',
        }
      }
    },
  },
  plugins: [],
}
