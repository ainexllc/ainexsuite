import type { Config } from "tailwindcss";
import sharedConfig from "@ainexsuite/config/tailwind";
import {
  PATTERN_DOTS_SVG,
  PATTERN_GRID_SVG,
  PATTERN_DIAGONAL_SVG,
  PATTERN_WAVES_SVG,
  PATTERN_CIRCLES_SVG,
} from "./src/lib/constants/note-patterns";

const noteTones = [
  "cream",
  "white",
  "lemon",
  "peach",
  "tangerine",
  "mint",
  "fog",
  "lavender",
  "blush",
  "sky",
  "moss",
  "coal",
];

const noteColorSafelist = noteTones.flatMap((tone) => [
  `bg-note-${tone}`,
  `bg-note-${tone}-soft`,
  `bg-note-${tone}-dark`,
  `dark:bg-note-${tone}-soft`,
  `dark:bg-note-${tone}-dark`,
  `hover:bg-note-${tone}`,
  `hover:bg-note-${tone}-soft`,
]);

const config: Config = {
  presets: [sharedConfig],
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/dist/**/*.{js,ts,jsx,tsx}",
    "../../packages/types/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        note: {
          cream: "#FFFDF7", // Warm cream for default
          white: "#FFFFFF",
          "white-soft": "#F9FAFB",
          "white-dark": "#2B2B2B",
          // Bolder, more vibrant colors for glassmorphism glow
          lemon: "#FACC15", // Yellow-400
          "lemon-soft": "#FFFED2",
          "lemon-dark": "#7D6B1A", // Golden amber (vibrant)
          peach: "#FB923C", // Orange-400
          "peach-soft": "#FFE1CE",
          "peach-dark": "#4A3728", // Rich coffee brown
          tangerine: "#F59E0B", // Amber-500
          "tangerine-soft": "#FFE7BA",
          "tangerine-dark": "#8C5A1C", // Rich amber (vibrant)
          mint: "#34D399", // Emerald-400
          "mint-soft": "#DCFCE7",
          "mint-dark": "#2A6B4A", // Teal green (vibrant)
          fog: "#94A3B8", // Slate-400
          "fog-soft": "#EDF3FF",
          "fog-dark": "#4A5568", // Clean slate (vibrant)
          lavender: "#A78BFA", // Violet-400
          "lavender-soft": "#F3E8FF",
          "lavender-dark": "#6B4A8C", // Rich purple (vibrant)
          blush: "#F472B6", // Pink-400
          "blush-soft": "#FCE6EF",
          "blush-dark": "#8C3A5C", // Vibrant rose
          sky: "#38BDF8", // Sky-400
          "sky-soft": "#E3F0FF",
          "sky-dark": "#2A5A8C", // Rich blue (vibrant)
          moss: "#A3E635", // Lime-400
          "moss-soft": "#E8FAD9",
          "moss-dark": "#4A7A2A", // Lime green (vibrant)
          coal: "#1E293B", // Slate-800
          "coal-soft": "#E4E4E7", // zinc-200 - light gray for light mode
          "coal-dark": "#3D4A5C", // Cool slate blue-gray
        },
      },
      backgroundImage: {
        "pattern-dots": `url("${PATTERN_DOTS_SVG}")`,
        "pattern-grid": `url("${PATTERN_GRID_SVG}")`,
        "pattern-diagonal": `url("${PATTERN_DIAGONAL_SVG}")`,
        "pattern-waves": `url("${PATTERN_WAVES_SVG}")`,
        "pattern-circles": `url("${PATTERN_CIRCLES_SVG}")`,
      },
    },
  },
  safelist: [
    ...noteColorSafelist,
    "bg-pattern-dots",
    "bg-pattern-grid",
    "bg-pattern-diagonal",
    "bg-pattern-waves",
    "bg-pattern-circles",
  ],
  plugins: [],
};

export default config;