const typography = require("@tailwindcss/typography");
const forms = require("@tailwindcss/forms");

const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {
      keyframes: {
        rollin: {
          "0%": { bottom: "-100%" },
          "100%": { bottom: 0 },
        },
        cardSwipe: {
          "100%": { transform: "translate(-100%,-100%)" },
        },
      },
      animation: {
        rollin: "rollin 1s ease-in-out forwards",
        cardSwipe: "cardSwipe 1s ease-in-out forwards",
      },
    },
  },

  plugins: [forms, typography],
};

module.exports = config;
