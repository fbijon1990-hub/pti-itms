import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "green-ink": "#0c2a1f",
        green: "#16483a",
        "green-mid": "#2c6e54",
        "green-soft": "#e7efe9",
        gold: "#a67c22",
        "gold-soft": "#f3ead4",
        paper: "#f2f5f1",
        surface: "#ffffff",
        border: "#dbe2dc",
        "border-strong": "#c3cec6",
        ink: "#1b2620",
        muted: "#5e6d64",
        faint: "#8a978e",
        ok: "#1f7a4d",
        "ok-soft": "#e2f2e9",
        warn: "#9a6b0f",
        "warn-soft": "#f6ecd3",
        bad: "#a3352b",
        "bad-soft": "#f6e2df",
        info: "#245b86",
        "info-soft": "#e0ecf5"
      },
      fontFamily: {
        serif: ['Georgia', '"Times New Roman"', "serif"],
        sans: ["system-ui", "-apple-system", '"Segoe UI"', "Roboto", "sans-serif"],
        mono: ['ui-monospace', '"Cascadia Code"', '"Consolas"', "monospace"]
      },
      borderRadius: { DEFAULT: "8px" },
      boxShadow: {
        card: "0 1px 2px rgba(12,42,31,.06), 0 6px 18px rgba(12,42,31,.05)"
      }
    }
  },
  plugins: []
};
export default config;
