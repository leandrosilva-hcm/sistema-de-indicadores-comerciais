import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#dc911b",
          hover: "#c47d12",
          dark: "#000000",
          surface: "#0d0f11",
          muted: "#64748b",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#dc911b",
          hover: "#c47d12",
          foreground: "#000000",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        border: "var(--border)",
        ring: "var(--ring)",
        sidebar: {
          DEFAULT: "#000000",
          foreground: "#ffffff",
          primary: "#dc911b",
          "primary-foreground": "#000000",
          accent: "#18181b",
          "accent-foreground": "#dc911b",
          border: "#27272a",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
