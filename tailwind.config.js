/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#080d1a',
          900: '#0a0e1a',
          850: '#060a14',
          800: '#0f1629',
          750: '#0d1628',
          700: '#0f1e3a',
          600: '#101c33',
          500: '#1a2540',
          400: '#1e2d4a',
          300: '#2a3a5c',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
