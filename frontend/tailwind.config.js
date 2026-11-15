/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tank: {
          bg: "#0B0F19",
          card: "#121826",
          border: "#1F293D",
          borderLight: "#2E3A52",
          gold: "#D4AF37",
          goldMuted: "#A38526",
          amber: "#D97706",
          slate: "#334155",
          accent: "#2563EB",
          destructive: "#991B1B"
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      }
    },
  },
  plugins: [],
}
