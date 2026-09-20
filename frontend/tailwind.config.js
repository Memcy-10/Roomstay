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
          50: '#fef3f2',
          100: '#fee4e2',
          200: '#fecdca',
          300: '#fca5a0',
          400: '#f97066',
          500: '#f04438',
          600: '#d92d20',
          700: '#b42318',
          800: '#912018',
          900: '#7a271a',
        },
        secondary: {
          50: '#ecfdf3',
          100: '#d1fae0',
          200: '#a6f2c2',
          300: '#6ce49c',
          400: '#34d375',
          500: '#12b75a',
          600: '#089448',
          700: '#08753c',
          800: '#0a5c32',
          900: '#094b2a',
        },
        neutral: {
          50: '#f9fafb',
          100: '#f2f4f7',
          200: '#eaecf0',
          300: '#d0d5dd',
          400: '#98a2b3',
          500: '#667085',
          600: '#475467',
          700: '#344054',
          800: '#1d2939',
          900: '#101828',
        },
        amber: {
          50: '#fffbea',
          100: '#fff3c4',
          200: '#fce588',
          300: '#fadb5f',
          400: '#f7c948',
          500: '#f0b429',
          600: '#de911d',
          700: '#cb6e17',
          800: '#b44d12',
          900: '#8d2b0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
