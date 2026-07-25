import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-darker": "var(--bg-darker)",
        "bg-warm": "var(--bg-warm)",
        chaos: "var(--chaos)",
        pen: "var(--pen)",
        clarity: "var(--clarity)",
        human: "var(--human)",
        warn: "var(--warn)",
        "admin-bg": "var(--admin-bg)",
      },
      fontFamily: {
        syne: ["var(--font-syne)", "sans-serif"],
        fraunces: ["var(--font-fraunces)", "serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      fontSize: {
        display: "clamp(2.5rem, 6vw, 5rem)",
        "display-m": "clamp(2rem, 8vw, 3.5rem)",
        "heading-1": "clamp(1.6rem, 6vw, 2.5rem)",
        "heading-2": "clamp(1.3rem, 5vw, 2rem)",
      },
      transitionTimingFunction: {
        settle: "cubic-bezier(0.23, 1, 0.32, 1)",
        reveal: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
