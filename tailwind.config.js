const { colors } = require("tailwindcss/colors");
const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js, jsx, ts, tsx}", "./src/**/*.{js, jsx, ts, tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
        ...fontFamily.sans,
      },
      maxWidth: {
        "screen-2xl": "1440px",
      },
      keyframes: {
        "shake-x": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
      },
      animation: {
        "shake-x": "shake-x 0.2s ease-in-out 0s 2",
      },
    },
  },
  plugins: [],
};
