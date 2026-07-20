/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#f4f1eb',
        surface: '#f8f6f1',
        'surface-soft': '#ebe7df',
        'surface-warm': '#e5ded1',
        primary: '#512301',
        secondary: '#825423',
        muted: '#6f5b50',
        outline: '#d6d0c5',
        gold: '#ad9363',
        cream: '#fbfaf6',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
};
