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
        primary: '#ff5c6c', // Main brand color - Pink/Red
        'background-light': '#f8f5f6',
        'background-dark': '#230f11',
        'primary-old': {
          50: '#e8f0fe',
          100: '#d2e3fc',
          200: '#aecbfa',
          300: '#8ab4f8',
          400: '#669df6',
          500: '#4285f4',  // Google Blue - Old brand color
          600: '#1a73e8',
          700: '#1967d2',
          800: '#185abc',
          900: '#174ea6',
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
        sans: ['Google Sans', 'Roboto', 'Arial', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Noto Sans', 'sans-serif'],
      },
      borderRadius: {
        'google': '8px',
      },
      boxShadow: {
        'google': '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)',
        'google-lg': '0 1px 3px 0 rgba(60,64,67,.3), 0 4px 8px 3px rgba(60,64,67,.15)',
      },
    },
  },
  plugins: [],
}
