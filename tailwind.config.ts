import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--cp-bg)",
        surface: "var(--cp-surface)",
        surface2: "var(--cp-surface-2)",
        border: "var(--cp-border)",
        text: "var(--cp-text)",
        muted: "var(--cp-muted)",
        accent: "var(--cp-accent)",
        accent2: "var(--cp-accent-2)",
        danger: "var(--cp-danger)",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        card: "12px",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      keyframes: {
        "frame-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(0.92)" },
        },
      },
      animation: {
        "frame-pulse": "frame-pulse 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
