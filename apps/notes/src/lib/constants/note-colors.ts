import type { NoteColor } from "@/lib/types/note";

/**
 * Note Color Palette - Zinc-First Design System
 *
 * The footer background displays the note's selected color.
 * Default/white notes use neutral zinc footer backgrounds.
 */
export const NOTE_COLORS: Array<{
  id: NoteColor;
  label: string;
  swatchClass: string;
  iconClass: string;
  cardClass: string;
  footerClass: string;
}> = [
    {
      id: "default",
      label: "Default",
      swatchClass:
        "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100",
      iconClass: "text-zinc-400 dark:text-zinc-500",
      cardClass: "bg-white dark:bg-zinc-900",
      footerClass: "bg-zinc-100 dark:bg-zinc-800/80",
    },
    {
      id: "note-white",
      label: "White",
      swatchClass: "bg-note-white text-zinc-900 border border-zinc-200",
      iconClass: "text-zinc-300 dark:text-zinc-600",
      cardClass: "bg-white dark:bg-zinc-900",
      footerClass: "bg-zinc-50 dark:bg-zinc-800/60",
    },
    {
      id: "note-lemon",
      label: "Lemon",
      swatchClass: "bg-note-lemon text-zinc-900 border border-transparent",
      iconClass: "text-yellow-500",
      cardClass: "bg-yellow-500/10 dark:bg-yellow-500/10",
      footerClass: "bg-yellow-100 dark:bg-yellow-500/20",
    },
    {
      id: "note-peach",
      label: "Peach",
      swatchClass: "bg-note-peach text-zinc-900 border border-transparent",
      iconClass: "text-orange-400",
      cardClass: "bg-orange-400/10 dark:bg-orange-400/10",
      footerClass: "bg-orange-100 dark:bg-orange-400/20",
    },
    {
      id: "note-tangerine",
      label: "Tangerine",
      swatchClass: "bg-note-tangerine text-zinc-900 border border-transparent",
      iconClass: "text-orange-500",
      cardClass: "bg-orange-500/10 dark:bg-orange-500/10",
      footerClass: "bg-orange-200 dark:bg-orange-500/25",
    },
    {
      id: "note-mint",
      label: "Mint",
      swatchClass: "bg-note-mint text-zinc-900 border border-transparent",
      iconClass: "text-emerald-500",
      cardClass: "bg-emerald-500/10 dark:bg-emerald-500/10",
      footerClass: "bg-emerald-100 dark:bg-emerald-500/20",
    },
    {
      id: "note-fog",
      label: "Fog",
      swatchClass: "bg-note-fog text-zinc-900 border border-transparent",
      iconClass: "text-slate-400",
      cardClass: "bg-slate-500/10 dark:bg-slate-500/10",
      footerClass: "bg-slate-200 dark:bg-slate-500/20",
    },
    {
      id: "note-lavender",
      label: "Lavender",
      swatchClass: "bg-note-lavender text-zinc-900 border border-transparent",
      iconClass: "text-violet-500",
      cardClass: "bg-violet-500/10 dark:bg-violet-500/10",
      footerClass: "bg-violet-100 dark:bg-violet-500/20",
    },
    {
      id: "note-blush",
      label: "Blush",
      swatchClass: "bg-note-blush text-zinc-900 border border-transparent",
      iconClass: "text-pink-500",
      cardClass: "bg-pink-500/10 dark:bg-pink-500/10",
      footerClass: "bg-pink-100 dark:bg-pink-500/20",
    },
    {
      id: "note-sky",
      label: "Sky",
      swatchClass: "bg-note-sky text-zinc-900 border border-transparent",
      iconClass: "text-sky-500",
      cardClass: "bg-sky-500/10 dark:bg-sky-500/10",
      footerClass: "bg-sky-100 dark:bg-sky-500/20",
    },
    {
      id: "note-moss",
      label: "Moss",
      swatchClass: "bg-note-moss text-zinc-900 border border-transparent",
      iconClass: "text-green-600",
      cardClass: "bg-green-600/10 dark:bg-green-600/10",
      footerClass: "bg-green-100 dark:bg-green-600/20",
    },
    {
      id: "note-coal",
      label: "Graphite",
      swatchClass: "bg-note-coal text-zinc-100 border border-transparent",
      iconClass: "text-zinc-700 dark:text-zinc-300",
      cardClass: "bg-zinc-600/10 dark:bg-zinc-600/10",
      footerClass: "bg-zinc-300 dark:bg-zinc-600/30",
    },
  ];
