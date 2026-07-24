/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#e03a3a",
          dark: "#b92c2c"
        },
        // Warm, newsprint-like tones for light mode — replaces stark white/grey
        // surfaces so the page reads more like paper. Dark mode is untouched.
        paper: {
          DEFAULT: "#f3ede0",
          card: "#faf6ec",
          border: "#e4dbc7",
          strong: "#d6c9ac"
        }
      }
    }
  },
  plugins: []
};
