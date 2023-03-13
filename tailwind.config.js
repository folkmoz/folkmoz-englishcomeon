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
    },
  },
  plugins: [],
};
