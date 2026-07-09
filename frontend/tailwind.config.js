/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './app/**/*.{js,jsx}',
      './components/**/*.{js,jsx}',
      './context/**/*.{js,jsx}',
    ],
    theme: {
      extend: {
        colors: {
          ink: '#1C2333',
          slate: {
            950: '#0B0F19',
          },
          accent: {
            DEFAULT: '#3457D5',
            light: '#5B7CFA',
            dark: '#24399A',
          },
        },
        fontFamily: {
          display: ['"Sora"', 'sans-serif'],
          body: ['"Inter"', 'sans-serif'],
        },
      },
    },
    plugins: [],
  };