import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        sans: ['var(--font-space-grotesk)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
      colors: {
        background: "#F3F1EC",
        foreground: "#0D0D0D",
        muted: "#888888",
        surface: "rgba(255,255,255,0.6)",
        accent: {
          DEFAULT: "#FF3B2F",
          foreground: "#FFFFFF",
        },
        tfidf: "#C3AED6",
        semantic: "#94B8E8",
        hybrid: "#E8A8B0",
      },
      letterSpacing: {
        label: "0.15em",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
