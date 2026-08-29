/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "ping-slow": {
          "0%": { transform: "scale(1)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        "ping-slow": "ping-slow 2.2s ease-out infinite",
      },
      fontFamily: {
        rasputin: ["Rasputin", "serif"],
      },
      "slide-up": {
        "0%": { transform: "translateY(40px)", opacity: "0" },
        "100%": { transform: "translateY(0)", opacity: "1" },
      },
    },
  },
  plugins: [],
};
