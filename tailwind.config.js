/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmos: {
          bg: "#06040c",
          card: "rgba(15,10,30,0.7)",
          border: "rgba(139,92,246,0.08)",
          "border-hover": "rgba(139,92,246,0.25)",
        },
        violet: {
          glow: "#a78bfa",
          light: "#c4b5fd",
          dim: "#555",
        },
      },
      fontFamily: {
        display: ["'Crimson Pro'", "serif"],
        body: ["'IBM Plex Sans Thai'", "'IBM Plex Sans'", "sans-serif"],
      },
      animation: {
        fadeSlide: "fadeSlide 0.4s ease",
        fadeSlideQuick: "fadeSlide 0.25s ease",
        spin: "spin 0.8s linear infinite",
      },
      keyframes: {
        fadeSlide: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
