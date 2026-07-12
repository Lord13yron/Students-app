/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#4F378A",
        secondary: "#7C7296",
        tertiary: "#C9A74D",
        neutral: "#79767D",
        light: "#F5EFF7",
        background: "#fdf7ff",
        card: "#FFFFFF",
        border: "#334155",
        title: "#1D1B20",
        text: "#322F35",
        danger: "#EF4444",
      },
    },
  },
  plugins: [],
};
