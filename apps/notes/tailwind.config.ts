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
  ],
  theme: {
    extend: {
      colors: {
        note: {
          white: "#FFFFFF",
          "white-soft": "#F9FAFB",
          "white-dark": "#2B2B2B",
          lemon: "#FEFEA1",
          "lemon-soft": "#FFFED2",
          "lemon-dark": "#5D5C3D",
          peach: "#FEC4A3",
          "peach-soft": "#FFE1CE",
          "peach-dark": "#5E4838",
          tangerine: "#FFD27F",
          "tangerine-soft": "#FFE7BA",
          "tangerine-dark": "#5F4E35",
          mint: "#BBF7D0",
          "mint-soft": "#DCFCE7",
          "mint-dark": "#345940",
          fog: "#E0ECFF",
          "fog-soft": "#EDF3FF",
          "fog-dark": "#384A5E",
          lavender: "#EAD8FF",
          "lavender-soft": "#F3E8FF",
          "lavender-dark": "#4E3D5E",
          blush: "#FAD7E5",
          "blush-soft": "#FCE6EF",
          "blush-dark": "#5E3848",
          sky: "#CDE3FF",
          "sky-soft": "#E3F0FF",
          "sky-dark": "#38495E",
          moss: "#D5F5C1",
          "moss-soft": "#E8FAD9",
          "moss-dark": "#3F5338",
          coal: "#4F5B66",
          "coal-soft": "#A1A8B0",
          "coal-dark": "#1E2428",
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