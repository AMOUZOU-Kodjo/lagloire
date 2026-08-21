/**
 * Design tokens ETDV — source unique de vérité.
 * Toutes les couleurs, polices, rayons et ombres du projet sont définis ici,
 * puis exposés à Tailwind (utilities) et consommés par les composants CSS
 * maison dans src/styles/index.css (variables --color-*).
 * Ne modifier ces valeurs que dans ce fichier.
 *
 * Palette = site de référence : fonds clairs, texte sombre, accent teal #37cdbe,
 * bleu #4a90e2, erreurs rouges.
 */
const tokens = {
  colors: {
    ink: { DEFAULT: "#1F2937", 2: "#374151" },
    gold: { DEFAULT: "#37CDBE", dim: "#2F9E93" },
    brick: "#DC2626",
    palm: "#16A34A",
    sand: { DEFAULT: "#FFFFFF", 2: "#F2F2F2" },
    line: { DEFAULT: "#E5E6E6", dark: "#D1D5DB" },
    soft: { DEFAULT: "#6B7280", dark: "#4B5563" },
  },
  fontFamily: {
    display: ["Fraunces", "ui-serif", "Georgia", "serif"],
    sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
    mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
  },
  borderRadius: {
    sm: "8px",
    md: "14px",
    lg: "22px",
  },
  boxShadow: {
    card: "0 1px 2px rgba(17,24,39,.06), 0 8px 24px rgba(17,24,39,.08)",
  },
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: tokens.colors,
      fontFamily: tokens.fontFamily,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.boxShadow,
    },
  },
};