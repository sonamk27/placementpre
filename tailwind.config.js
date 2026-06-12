/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6C63FF",
        secondary: "#8B5CF6",
        accent: "#A855F7",
        ink: "#0F172A",
        paper: "#F8FAFC",
      },
      boxShadow: {
        glow: "0 24px 80px rgba(108, 99, 255, 0.28)",
        "soft-panel": "0 18px 55px rgba(15, 23, 42, 0.28)",
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "slow-pulse": "slowPulse 5s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        slowPulse: {
          "0%, 100%": { opacity: 0.65, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.04)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-180% 0" },
          "100%": { backgroundPosition: "180% 0" },
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
