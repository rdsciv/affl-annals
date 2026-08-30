/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#0b0c0f",
          subtle: "#0e1013",
        },
        card: {
          DEFAULT: "#121418",
          hover: "#171a1f",
          elevated: "#1c1f25",
        },
        rule: {
          DEFAULT: "#2b3038",
          subtle: "#1f2227",
          bright: "#3d434c",
        },
        ink: {
          DEFAULT: "#ece8de",
          muted: "#9a9d9f",
          dim: "#66696c",
        },
        brand: {
          blue: "#5b87ac",
          orange: "#c05a34",
          lime: "#c9a227",
          yellow: "#c9a227",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
