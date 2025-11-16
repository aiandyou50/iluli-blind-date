/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f0fe',
          100: '#d2e3fc',
          200: '#aecbfa',
          300: '#8ab4f8',
          400: '#669df6',
          500: '#4285f4',  // Google Blue - Main brand color
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
          500: '#34a853',  // Google Green
          600: '#1e8e3e',
        },
        error: {
          500: '#ea4335',  // Google Red
          600: '#d93025',
        },
      },
      fontFamily: {
        sans: ['Google Sans', 'Roboto', 'Arial', 'sans-serif'],
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
