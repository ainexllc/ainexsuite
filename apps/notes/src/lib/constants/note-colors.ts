import type { NoteColor } from "@/lib/types/note";

/**
 * Note Color Palette - Unified Colors
 *
 * Each color has:
 * - One fixed background that doesn't change with system theme
 * - Predefined text mode (light or dark) for proper contrast
 * - Column assignment for picker layout
 *
 * Light column colors use pastel backgrounds with dark text
 * Dark column colors use rich backgrounds with light text
 */

export type NoteColorConfig = {
  id: NoteColor;
  label: string;
  swatchClass: string;    // Color preview dot in picker
  bgClass: string;        // Background class
  borderClass: string;    // Border color
  footerClass: string;    // Footer styling
  textMode: "light" | "dark" | "theme";  // light = light text, dark = dark text, theme = follows system
  column: "left" | "right";    // Picker column
};

// Default color - special, adapts to theme (separate from Light/Dark columns)
export const DEFAULT_COLOR: NoteColorConfig = {
  id: "default",
  label: "Default",
  swatchClass: "bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600",
  bgClass: "bg-zinc-100 dark:bg-zinc-800",
  borderClass: "border-zinc-200 dark:border-zinc-700",
  footerClass: "bg-zinc-200/60 dark:bg-zinc-700/60",
  textMode: "theme", // Special: follows system theme
  column: "left", // Not used, but required by type
};

// Light colors (pastels with dark text)
export const LIGHT_COLORS: NoteColorConfig[] = [
  {
    id: "note-lemon",
    label: "Lemon",
    swatchClass: "bg-note-lemon-soft border border-yellow-300",
    bgClass: "bg-note-lemon-soft",
    borderClass: "border-yellow-300/70",
    footerClass: "bg-yellow-100/80",
    textMode: "dark",
    column: "left",
  },
  {
    id: "note-tangerine",
    label: "Tangerine",
    swatchClass: "bg-note-tangerine-soft border border-amber-300",
    bgClass: "bg-note-tangerine-soft",
    borderClass: "border-amber-300/70",
    footerClass: "bg-amber-100/80",
    textMode: "dark",
    column: "left",
  },
  {
    id: "note-fog",
    label: "Sky",
    swatchClass: "bg-note-sky-soft border border-blue-300",
    bgClass: "bg-note-sky-soft",
    borderClass: "border-blue-300/70",
    footerClass: "bg-blue-100/80",
    textMode: "dark",
    column: "left",
  },
  {
    id: "note-blush",
    label: "Blush",
    swatchClass: "bg-note-blush-soft border border-pink-300",
    bgClass: "bg-note-blush-soft",
    borderClass: "border-pink-300/70",
    footerClass: "bg-pink-100/80",
    textMode: "dark",
    column: "left",
  },
  {
    id: "note-moss",
    label: "Moss",
    swatchClass: "bg-note-moss-soft border border-emerald-300",
    bgClass: "bg-note-moss-soft",
    borderClass: "border-emerald-300/70",
    footerClass: "bg-emerald-100/80",
    textMode: "dark",
    column: "left",
  },
  {
    id: "note-cream",
    label: "Cream",
    swatchClass: "bg-note-cream border border-amber-200",
    bgClass: "bg-note-cream",
    borderClass: "border-amber-200/70",
    footerClass: "bg-amber-50/80",
    textMode: "dark",
    column: "left",
  },
];

// Dark colors (rich tones with light text)
export const DARK_COLORS: NoteColorConfig[] = [
  {
    id: "note-white",
    label: "Charcoal",
    swatchClass: "bg-note-white-dark border border-zinc-600",
    bgClass: "bg-note-white-dark",
    borderClass: "border-zinc-600/50",
    footerClass: "bg-zinc-800/80",
    textMode: "light",
    column: "right",
  },
  {
    id: "note-peach",
    label: "Coffee",
    swatchClass: "bg-note-peach-dark border border-amber-900",
    bgClass: "bg-note-peach-dark",
    borderClass: "border-amber-900/50",
    footerClass: "bg-amber-950/60",
    textMode: "light",
    column: "right",
  },
  {
    id: "note-mint",
    label: "Forest",
    swatchClass: "bg-note-mint-dark border border-green-700",
    bgClass: "bg-note-mint-dark",
    borderClass: "border-green-700/50",
    footerClass: "bg-green-900/60",
    textMode: "light",
    column: "right",
  },
  {
    id: "note-lavender",
    label: "Grape",
    swatchClass: "bg-note-lavender-dark border border-purple-700",
    bgClass: "bg-note-lavender-dark",
    borderClass: "border-purple-700/50",
    footerClass: "bg-purple-900/60",
    textMode: "light",
    column: "right",
  },
  {
    id: "note-sky",
    label: "Navy",
    swatchClass: "bg-note-sky-dark border border-blue-700",
    bgClass: "bg-note-sky-dark",
    borderClass: "border-blue-700/50",
    footerClass: "bg-blue-900/60",
    textMode: "light",
    column: "right",
  },
  {
    id: "note-coal",
    label: "Slate",
    swatchClass: "bg-note-coal-dark border border-slate-600",
    bgClass: "bg-note-coal-dark",
    borderClass: "border-slate-600/50",
    footerClass: "bg-slate-800/80",
    textMode: "light",
    column: "right",
  },
];

// Combined array for lookups (includes Default)
export const NOTE_COLORS: NoteColorConfig[] = [DEFAULT_COLOR, ...LIGHT_COLORS, ...DARK_COLORS];

// Helper to find color config by ID
export function getNoteColorConfig(id: NoteColor): NoteColorConfig | undefined {
  return NOTE_COLORS.find((c) => c.id === id);
}
