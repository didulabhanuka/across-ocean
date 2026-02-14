import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx,ts}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 45px rgba(255, 0, 90, 0.18)",
        soft: "0 14px 55px rgba(0,0,0,0.55)",
      },
      keyframes: {
        floaty: { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-7px)" } },
        pulseSoft: { "0%,100%": { transform: "scale(1)", opacity: "0.78" }, "50%": { transform: "scale(1.06)", opacity: "1" } },
      },
      animation: {
        floaty: "floaty 3.6s ease-in-out infinite",
        pulseSoft: "pulseSoft 1.7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
