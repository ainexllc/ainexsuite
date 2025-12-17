import type { Config } from 'tailwindcss';
import sharedConfig from '@ainexsuite/config/tailwind';

const config: Config = {
  presets: [sharedConfig],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/types/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        mood: {
          amazing: '#22c55e',
          good: '#84cc16',
          okay: '#eab308',
          bad: '#f97316',
          terrible: '#ef4444',
        },
        note: {
          white: "#FFFFFF",
          "white-soft": "#F9FAFB",
          "white-dark": "#2B2B2B",
          // Bolder, more vibrant colors for glassmorphism glow
          lemon: "#FACC15", // Yellow-400
          "lemon-soft": "#FFFED2",
          "lemon-dark": "#5D5C3D",
          peach: "#FB923C", // Orange-400
          "peach-soft": "#FFE1CE",
          "peach-dark": "#5E4838",
          tangerine: "#F59E0B", // Amber-500
          "tangerine-soft": "#FFE7BA",
          "tangerine-dark": "#5F4E35",
          mint: "#34D399", // Emerald-400
          "mint-soft": "#DCFCE7",
          "mint-dark": "#345940",
          fog: "#94A3B8", // Slate-400
          "fog-soft": "#EDF3FF",
          "fog-dark": "#384A5E",
          lavender: "#A78BFA", // Violet-400
          "lavender-soft": "#F3E8FF",
          "lavender-dark": "#4E3D5E",
          blush: "#F472B6", // Pink-400
          "blush-soft": "#FCE6EF",
          "blush-dark": "#5E3848",
          sky: "#38BDF8", // Sky-400
          "sky-soft": "#E3F0FF",
          "sky-dark": "#38495E",
          moss: "#A3E635", // Lime-400
          "moss-soft": "#E8FAD9",
          "moss-dark": "#3F5338",
          coal: "#1E293B", // Slate-800
          "coal-soft": "#A1A8B0",
          "coal-dark": "#0F172A",
        },
      },
      backgroundImage: {
        "pattern-dots": "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")",
        "pattern-grid": "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
        "pattern-diagonal": "url(\"data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-1 1l2-2M0 10l10-10M9 11l2-2' stroke='%239C92AC' stroke-opacity='0.1' stroke-width='1'/%3E%3C/svg%3E\")",
        "pattern-waves": "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 c5 -5 5 -15 10 -10 c5 5 5 15 10 10' stroke='%239C92AC' stroke-opacity='0.1' fill='none'/%3E%3C/svg%3E\")",
        "pattern-circles": "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='8' stroke='%239C92AC' stroke-opacity='0.1' fill='none'/%3E%3C/svg%3E\")",
      },
    },
  },
  safelist: [
    { pattern: /bg-note-(white|lemon|peach|tangerine|mint|fog|lavender|blush|sky|moss|coal)(-(soft|dark))?/ },
    { pattern: /hover:bg-note-(white|lemon|peach|tangerine|mint|fog|lavender|blush|sky|moss|coal)(-(soft|dark))?/ },
    "bg-pattern-dots",
    "bg-pattern-grid",
    "bg-pattern-diagonal",
    "bg-pattern-waves",
    "bg-pattern-circles",
  ],
  plugins: [],
};

export default config;
