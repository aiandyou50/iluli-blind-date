/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff5c6c',
          50: '#ffe5e8',
          100: '#ffccd1',
          200: '#ff99a3',
          300: '#ff6675',
          400: '#ff5c6c',
          500: '#ff5c6c',
          600: '#e5525f',
          700: '#cc4954',
          800: '#b23f49',
          900: '#99363e',
        },
        'background-light': {
          DEFAULT: '#f8f5f6',
          secondary: '#ffffff',
          tertiary: '#f1f3f4',
        },
        'background-dark': {
          DEFAULT: '#230f11',
          secondary: '#1f1315',
          tertiary: '#0f172a',
        },
        secondary: {
          50: '#fef7e0',
          100: '#feefc3',
          200: '#fde293',
          300: '#fdd663',
          400: '#fcca3f',
          500: '#fbbc04',  // Google Yellow
          600: '#f9ab00',
          700: '#f29900',
          800: '#ea8600',
          900: '#e37400',
        },
        success: {
          50: '#e6f7ed',
          100: '#c6ead7',
          200: '#9eddb9',
          300: '#6fcf97',
          400: '#4cc17e',
          500: '#34a853',  // Google Green
          600: '#2e9849',
          700: '#25853d',
          800: '#1e8e3e',
          900: '#166534',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ea4335',  // Google Red - Main danger color
          600: '#d93025',
          700: '#c5221f',
          800: '#b91c1c',
          900: '#991b1b',
        },
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Noto Sans', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'Roboto', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'DEFAULT': '1rem',
        'google': '8px',
        'lg': '2rem',
        'xl': '3rem',
        'full': '9999px'
      },
      boxShadow: {
        'google': '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)',
        'google-lg': '0 1px 3px 0 rgba(60,64,67,.3), 0 4px 8px 3px rgba(60,64,67,.15)',
      },
    },
  },
  plugins: [],
}
