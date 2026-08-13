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
          50: '#fff5f7',
          100: '#ffe4e8',
          200: '#ffccd5',
          300: '#ffa3b5',
          400: '#ff6b8b', // Main pastel pink
          500: '#fb3965',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        background: '#fcfcfc',
        surface: '#ffffff',
        'surface-light': '#fdf2f8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 4px 14px 0 rgba(255, 107, 139, 0.2)',
        'glow': '0 6px 20px rgba(255, 107, 139, 0.25)',
        'glow-lg': '0 10px 30px rgba(255, 107, 139, 0.3)',
        'glow-soft': '0 8px 30px rgba(0, 0, 0, 0.04)',
        // 3D Glass Shadow: Inset white top edge + soft outer pink/gray glow
        'glass': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.7), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.02), 0 8px 30px 0 rgba(255, 107, 139, 0.15)',
        'glass-hover': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.02), 0 12px 40px 0 rgba(255, 107, 139, 0.25)',
      }
    },
  },
  plugins: [],
}
