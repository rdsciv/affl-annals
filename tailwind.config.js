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
          DEFAULT: "#08090c",
          subtle: "#0b0e14",
        },
        card: {
          DEFAULT: "#0e1119",
          hover: "#131822",
          elevated: "#171d2a",
        },
        rule: {
          DEFAULT: "#1c2536",
          subtle: "#161d2b",
          bright: "#2a374f",
        },
        ink: {
          DEFAULT: "#eef4ff",
          muted: "#94a3b8",
          dim: "#64748b",
        },
        brand: {
          blue: "#00a2ff",
          orange: "#ff6a00",
          lime: "#c8ff00",
          yellow: "#ffc400",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
