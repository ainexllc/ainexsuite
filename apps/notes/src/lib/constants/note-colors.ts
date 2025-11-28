import type { NoteColor } from "@/lib/types/note";

/**
 * Note Color Palette - Zinc-First Design System
 *
 * Footer uses consistent zinc colors across all notes.
 * Color selection controls the icon indicator color for visual distinction.
 */
export const NOTE_COLORS: Array<{
  id: NoteColor;
  label: string;
  swatchClass: string;
  iconClass: string;
}> = [
  {
    id: "default",
    label: "Default",
    swatchClass:
      "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100",
    iconClass: "text-zinc-400 dark:text-zinc-500",
  },
  {
    id: "note-white",
    label: "White",
    swatchClass: "bg-note-white text-zinc-900 border border-zinc-200",
    iconClass: "text-zinc-300 dark:text-zinc-600",
  },
  {
    id: "note-lemon",
    label: "Lemon",
    swatchClass: "bg-note-lemon text-zinc-900 border border-transparent",
    iconClass: "text-yellow-500",
  },
  {
    id: "note-peach",
    label: "Peach",
    swatchClass: "bg-note-peach text-zinc-900 border border-transparent",
    iconClass: "text-orange-400",
  },
  {
    id: "note-tangerine",
    label: "Tangerine",
    swatchClass: "bg-note-tangerine text-zinc-900 border border-transparent",
    iconClass: "text-orange-500",
  },
  {
    id: "note-mint",
    label: "Mint",
    swatchClass: "bg-note-mint text-zinc-900 border border-transparent",
    iconClass: "text-emerald-500",
  },
  {
    id: "note-fog",
    label: "Fog",
    swatchClass: "bg-note-fog text-zinc-900 border border-transparent",
    iconClass: "text-slate-400",
  },
  {
    id: "note-lavender",
    label: "Lavender",
    swatchClass: "bg-note-lavender text-zinc-900 border border-transparent",
    iconClass: "text-violet-500",
  },
  {
    id: "note-blush",
    label: "Blush",
    swatchClass: "bg-note-blush text-zinc-900 border border-transparent",
    iconClass: "text-pink-500",
  },
  {
    id: "note-sky",
    label: "Sky",
    swatchClass: "bg-note-sky text-zinc-900 border border-transparent",
    iconClass: "text-sky-500",
  },
  {
    id: "note-moss",
    label: "Moss",
    swatchClass: "bg-note-moss text-zinc-900 border border-transparent",
    iconClass: "text-green-600",
  },
  {
    id: "note-coal",
    label: "Graphite",
    swatchClass: "bg-note-coal text-zinc-100 border border-transparent",
    iconClass: "text-zinc-700 dark:text-zinc-300",
  },
];
