import type { Config } from "tailwindcss";

/**
 * Road to Glory — Design Tokens
 * Dark-gold luxury system. Gold is used sparingly as an accent, never as fill.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Base surfaces — deep black to anthracite
        obsidian: "#050506",
        ink: "#0A0A0C",
        surface: "#101013",
        elevated: "#16161A",
        line: "#232329",
        // Gold accent ramp
        gold: {
          DEFAULT: "#C8A24B",
          soft: "#E4C879",
          deep: "#9A7A2E",
          glow: "rgba(200,162,75,0.14)",
        },
        // Text
        chalk: "#F4F1EA",
        mist: "#A7A39B",
        faint: "#6B6862",
        // Semantic
        success: "#5FA36B",
        danger: "#B5544C",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.03em",
        luxe: "0.18em",
      },
      borderRadius: {
        xl2: "1.375rem",
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.03) inset, 0 24px 48px -24px rgba(0,0,0,0.9)",
        gold: "0 0 0 1px rgba(200,162,75,0.35), 0 0 32px -8px rgba(200,162,75,0.35)",
        goldsoft: "0 12px 40px -16px rgba(200,162,75,0.30)",
      },
      backgroundImage: {
        "gold-line": "linear-gradient(90deg, transparent, rgba(200,162,75,0.55), transparent)",
        "gold-fill": "linear-gradient(135deg, #E4C879 0%, #C8A24B 45%, #9A7A2E 100%)",
        "gold-text": "linear-gradient(180deg, #F0DCA0 0%, #C8A24B 60%, #A07E33 100%)",
        "obsidian-fade": "radial-gradient(120% 80% at 50% -10%, rgba(200,162,75,0.10), transparent 60%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "ring-fill": {
          "0%": { strokeDashoffset: "var(--ring-circ)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.8s ease both",
        shimmer: "shimmer 2.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
