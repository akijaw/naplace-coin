import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        subtle: "rgb(var(--subtle) / <alpha-value>)",

        /* NA'PLACE 1a 리디자인 브랜드 팔레트 (고정 hex) */
        ink: "#14263C",
        "ink-soft": "#8FA0B5", // 네이비 위 보조 텍스트
        "ink-line": "#2C4A6E", // 네이비 위 보더
        brand: "#EA6C2F",
        "brand-dark": "#D95A1E",
        blue: "#2D5C8F",
        "blue-tint": "#EDF2F8",
        "orange-tint": "#FFF1E6",
        divider: "#F0F2F5",
      },
      maxWidth: {
        content: "64rem", // 1024px — 리디자인 컨테이너
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        card: "1.375rem", // 22px
      },
      boxShadow: {
        card: "0 12px 32px -20px rgba(16,35,59,0.25)",
        glow: "0 12px 28px -20px rgba(234,108,47,0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
