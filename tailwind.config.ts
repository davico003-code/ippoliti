import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    { pattern: /bg-(navy|gold|brand|accent)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /text-(navy|gold|brand|accent)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /border-(navy|gold|brand|accent)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /ring-(navy|gold|brand|accent)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /from-(navy|gold|brand|accent)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /to-(navy|gold|brand|accent)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /via-(navy|gold|brand|accent)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /fill-(navy|gold|brand|accent)-(50|100|200|300|400|500|600|700|800|900)/ },
    "bg-navy", "bg-gold", "text-navy", "text-gold",
    "bg-brand", "bg-accent", "text-brand", "text-accent",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          DEFAULT: "#1B2B4B",
          50: "#E3E7F0",
          100: "#CBD3E6",
          200: "#9FB0D0",
          300: "#748CBA",
          400: "#4D69A3",
          500: "#34508A",
          600: "#273D6B",
          700: "#1B2B4B",
          800: "#121C31",
          900: "#090E18",
        },
        gold: {
          DEFAULT: "#C9A84C",
          50: "#F9F6ED",
          100: "#F3EBDB",
          200: "#E6D4B5",
          300: "#D9BD8F",
          400: "#CCA669",
          500: "#C9A84C",
          600: "#A88835",
          700: "#806626",
          800: "#574418",
          900: "#2E230B",
        },
        brand: {
          50: '#E8F2ED',
          100: '#C5DBCF',
          200: '#9EC2AC',
          300: '#77A98A',
          400: '#3F8A5D',
          500: '#2E7D4F',
          600: '#1A5C38',
          700: '#165030',
          800: '#124328',
          900: '#0D3620',
          DEFAULT: '#1A5C38',
        },
        accent: {
          50: '#FCE8EA',
          100: '#F8C5C8',
          200: '#F19099',
          300: '#EA5A66',
          400: '#E63946',
          500: '#CC2D3A',
          600: '#B32230',
          DEFAULT: '#E63946',
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "Times", "serif"],
        sans: ["Raleway", "system-ui", "sans-serif"],
        numeric: ["Poppins", "system-ui", "sans-serif"],
        poppins: ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
        raleway: ["var(--font-raleway)", "Raleway", "system-ui", "sans-serif"],
        lora: ["var(--font-lora)", "Lora", "Georgia", "serif"],
        playfair: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "card": "0 4px 20px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 12px 40px rgba(0, 0, 0, 0.15)",
        "gold": "0 4px 14px rgba(201, 168, 76, 0.4)",
        "navy": "0 4px 14px rgba(27, 43, 75, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
