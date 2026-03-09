import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Market Wars Dark + Neon theme
        base: "#0D1117",
        surface: "#161B22",
        border: "#30363D",
        neon: {
          green: "#00FFB2",
          cyan: "#00D4FF",
        },
        accent: {
          red: "#FF6B6B",
          purple: "#A855F7",
          yellow: "#F59E0B",
          pink: "#EC4899",
        },
        // Company colors
        company: {
          robosnack: "#FF6B6B",
          zoomzoom: "#00D4FF",
          megafun: "#A855F7",
          greenpower: "#22C55E",
          piggybank: "#F59E0B",
          safegold: "#EC4899",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Inter", "Noto Sans Thai", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
