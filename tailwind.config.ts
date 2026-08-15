import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lava: {
          950: "#08080C",
          900: "#0F0F17",
          850: "#141420",
          800: "#1B1B2A",
          700: "#28283E",
          600: "#E52E2D",
          500: "#FF3B30",
          400: "#FF5A4F",
          300: "#FF8880",
          200: "#FFAFA9",
          100: "#FFD6D4",
          50: "#FFF0F0",
        },
        titanium: {
          100: "#FFFFFF",
          200: "#F4F5F8",
          300: "#D8DCE6",
          400: "#9AA2B5",
          500: "#6B7280",
          600: "#4B5563",
        },
        signal: {
          emerald: "#1FAE7A",
          "emerald-light": "#E8F8F2",
          amber: "#F59E0B",
          "amber-light": "#FEF6EA",
          crimson: "#FF3B30",
          "crimson-light": "#FDECEE",
          violet: "#9A6BFF",
        },
      },
      fontFamily: {
        heading: ["Space Grotesk", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "lava-glow": "0 0 25px -5px rgba(255, 59, 48, 0.4)",
        "lava-sm": "0 0 15px -3px rgba(255, 59, 48, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
