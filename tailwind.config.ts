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
        "pulse-checkpoint": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.35)", opacity: "0.55" },
        },
      },
      animation: {
        checkpoint: "pulse-checkpoint 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
