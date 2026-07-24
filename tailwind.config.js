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
        // Warm, newsprint-like tones — kept from the main-branch palette in
        // case any leftover class references it, though this branch's UI
        // uses the "prophet" palette below instead.
        paper: {
          DEFAULT: "#f3ede0",
          card: "#faf6ec",
          border: "#e4dbc7",
          strong: "#d6c9ac"
        },
        // "Living newspaper" theme: aged parchment in light mode, a
        // charcoal-brown "midnight edition" in dark mode. Oxblood + brass
        // replace the plain red brand accent.
        prophet: {
          parchment: "#f4ecd8",
          card: "#faf3e3",
          ink: "#2c221e",
          muted: "#6b5c4d",
          border: "#d8c6a0",
          gold: "#b08d57",
          "gold-bright": "#c9a227",
          oxblood: "#5c1a1b",
          "oxblood-dark": "#3f1112",
          night: "#1c1816",
          "night-card": "#282220",
          "night-border": "#4a3f36",
          "night-ink": "#e9ddc7",
          "night-muted": "#b6a58a"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        headline: ["var(--font-headline)", "serif"],
        parchment: ["var(--font-body)", "serif"],
        press: ["var(--font-press)", "monospace"]
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        glow: {
          "0%, 100%": { opacity: 0.3 },
          "50%": { opacity: 0.7 }
        },
        inkIn: {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        },
        sparkle: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.35)" },
          "100%": { transform: "scale(1)" }
        }
      },
      animation: {
        shimmer: "shimmer 3.5s ease-in-out infinite",
        glow: "glow 2.4s ease-in-out infinite",
        "ink-in": "inkIn 0.4s ease-out both",
        sparkle: "sparkle 0.45s ease-out"
      }
    }
  },
  plugins: []
};
