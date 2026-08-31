import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0E14",
        surface: "#141924",
        surfaceRaised: "#1A2130",
        border: "#232B3A",
        borderLight: "#2E3850",
        text: "#E7EAF0",
        muted: "#8A93A6",
        faint: "#5C6478",
        amber: {
          DEFAULT: "#E3A542",
          dim: "#3A2E17",
        },
        teal: {
          DEFAULT: "#3FB6A8",
          dim: "#153431",
        },
        rose: {
          DEFAULT: "#E2637A",
          dim: "#3A1B22",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "4px",
      },
    },
  },
  plugins: [],
};

export default config;
