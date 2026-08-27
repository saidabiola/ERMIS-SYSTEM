/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--ermis-canvas)",
        surface: "var(--ermis-surface)",
        muted: "var(--ermis-muted)",
        ink: {
          DEFAULT: "var(--ermis-ink)",
          muted: "var(--ermis-ink-muted)",
        },
        line: {
          DEFAULT: "var(--ermis-border)",
          subtle: "var(--ermis-border-subtle)",
        },
        accent: "var(--ermis-accent)",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)",
        modal: "0 10px 40px rgba(15, 23, 42, 0.12)",
      },
    },
  },
  plugins: [],
}
