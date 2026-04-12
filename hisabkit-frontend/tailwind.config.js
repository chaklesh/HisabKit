/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--color-brand-primary)",
          secondary: "var(--color-brand-secondary)",
          accent: "var(--color-brand-accent)",
        },
        surface: {
          app: "var(--color-surface-app)",
          panel: "var(--color-surface-panel)",
          subtle: "var(--color-surface-subtle)",
          inverse: "var(--color-surface-inverse)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          inverse: "var(--color-text-inverse)",
        },
        border: {
          soft: "var(--color-border-soft)",
        },
      },
    },
  },
  plugins: [],
}
