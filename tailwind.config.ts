import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand tokens are CSS custom properties injected server-side from
        // the editable brand configuration (see Settings -> Brand).
        cream: "var(--brand-primary)",
        sage: "var(--brand-secondary)",
        gold: "var(--brand-accent)",
        border: "var(--ui-border)",
        ink: "var(--ui-ink)",
        muted: "var(--ui-muted)",
        surface: "var(--ui-surface)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        lg: "0.9rem",
        xl: "1.4rem",
        "2xl": "2rem",
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(60, 50, 30, 0.18)",
        card: "0 2px 12px -4px rgba(60, 50, 30, 0.12)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
