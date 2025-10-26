/**
 * Tailwind CSS Configuration Template
 *
 * Customized for AiNex design system with blue-based primary colors,
 * semantic color names, and extended utilities.
 *
 * File: tailwind.config.ts
 */

import type { Config } from "tailwindcss";

const config: Config = {
  // Enable dark mode with class strategy
  darkMode: "class",

  // Content paths for Tailwind to scan
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      // Custom color palette
      colors: {
        // Primary brand color (blue-based)
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },

        // Accent color (orange-based for reminders, highlights)
        accent: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },

        // Semantic text colors
        ink: {
          base: "#1a1a1a",
          muted: "#666666",
          subtle: "#999999",
          50: "#ffffff",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },

        // Surface colors for backgrounds
        surface: {
          base: "#fafafa",
          muted: "#f5f5f5",
          elevated: "#ffffff",
        },

        // Outline colors for borders
        outline: {
          subtle: "#e5e5e5",
          strong: "#d4d4d4",
        },
      },

      // Extended font families
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },

      // Custom animations
      animation: {
        "spin-slow": "spin 3s linear infinite",
        shimmer: "shimmer 2s infinite",
        "loading-bar": "loading-bar 1s ease-in-out infinite",
      },

      // Keyframes for animations
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "loading-bar": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
      },

      // Extended spacing scale
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },

      // Extended border radius
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },

  plugins: [
    // Add Tailwind plugins here
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
};

export default config;
