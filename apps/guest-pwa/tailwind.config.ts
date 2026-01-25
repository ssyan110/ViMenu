import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#13b6ec",
        "background-light": "#f6f8f8",
        "background-dark": "#101d22",
      },
      fontFamily: {
        display: ["Karla", "system-ui", "sans-serif"],
        heading: ["Playfair Display SC", "serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        gradient: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        gradient: "gradient 15s ease infinite",
      },
    },
  },
  plugins: [],
};

export default config;
