import type { NoteColor } from "@/lib/types/note";

/**
 * Note Color Palette - Theme Lab Design System
 *
 * Uses custom note-* colors defined in tailwind.config.ts and safelisted:
 * - Light mode: note-{color}-soft for content
 * - Dark mode: note-{color}-dark for content
 */
export const NOTE_COLORS: Array<{
  id: NoteColor;
  label: string;
  swatchClass: string;
  iconClass: string;
  cardClass: string;
  footerClass: string;
  // Hex colors for inline styles (bypasses Tailwind purging)
  lightBg: string;
  darkBg: string;
}> = [
    {
      id: "default",
      label: "Default",
      swatchClass: "bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700",
      iconClass: "text-zinc-400 dark:text-zinc-500",
      cardClass: "bg-zinc-50 dark:bg-zinc-900",
      footerClass: "bg-zinc-100 dark:bg-zinc-800/60",
      lightBg: "#FAFAFA",
      darkBg: "#27272A", // zinc-800
    },
    {
      id: "note-white",
      label: "White",
      swatchClass: "bg-note-white-soft dark:bg-note-white-dark border border-zinc-200 dark:border-zinc-700",
      iconClass: "text-zinc-300 dark:text-zinc-600",
      cardClass: "bg-note-white-soft dark:bg-note-white-dark",
      footerClass: "bg-zinc-100 dark:bg-zinc-800/60",
      lightBg: "#F9FAFB",
      darkBg: "#3F3F46", // zinc-700
    },
    {
      id: "note-lemon",
      label: "Lemon",
      swatchClass: "bg-note-lemon-soft dark:bg-note-lemon-dark border border-yellow-200 dark:border-yellow-800",
      iconClass: "text-yellow-600 dark:text-yellow-400",
      cardClass: "bg-note-lemon-soft dark:bg-note-lemon-dark",
      footerClass: "bg-note-lemon-soft dark:bg-note-lemon-dark",
      lightBg: "#FEF9C3", // yellow-100
      darkBg: "#713F12", // yellow-900
    },
    {
      id: "note-peach",
      label: "Peach",
      swatchClass: "bg-note-peach-soft dark:bg-note-peach-dark border border-orange-200 dark:border-orange-800",
      iconClass: "text-orange-600 dark:text-orange-400",
      cardClass: "bg-note-peach-soft dark:bg-note-peach-dark",
      footerClass: "bg-note-peach-soft dark:bg-note-peach-dark",
      lightBg: "#FFEDD5", // orange-100
      darkBg: "#7C2D12", // orange-900
    },
    {
      id: "note-tangerine",
      label: "Tangerine",
      swatchClass: "bg-note-tangerine-soft dark:bg-note-tangerine-dark border border-amber-200 dark:border-amber-800",
      iconClass: "text-amber-600 dark:text-amber-400",
      cardClass: "bg-note-tangerine-soft dark:bg-note-tangerine-dark",
      footerClass: "bg-note-tangerine-soft dark:bg-note-tangerine-dark",
      lightBg: "#FEF3C7", // amber-100
      darkBg: "#78350F", // amber-900
    },
    {
      id: "note-mint",
      label: "Mint",
      swatchClass: "bg-note-mint-soft dark:bg-note-mint-dark border border-green-200 dark:border-green-800",
      iconClass: "text-green-600 dark:text-green-400",
      cardClass: "bg-note-mint-soft dark:bg-note-mint-dark",
      footerClass: "bg-note-mint-soft dark:bg-note-mint-dark",
      lightBg: "#DCFCE7", // green-100
      darkBg: "#14532D", // green-900
    },
    {
      id: "note-fog",
      label: "Fog",
      swatchClass: "bg-note-fog-soft dark:bg-note-fog-dark border border-slate-200 dark:border-slate-800",
      iconClass: "text-slate-600 dark:text-slate-400",
      cardClass: "bg-note-fog-soft dark:bg-note-fog-dark",
      footerClass: "bg-note-fog-soft dark:bg-note-fog-dark",
      lightBg: "#F1F5F9", // slate-100
      darkBg: "#334155", // slate-700
    },
    {
      id: "note-lavender",
      label: "Lavender",
      swatchClass: "bg-note-lavender-soft dark:bg-note-lavender-dark border border-purple-200 dark:border-purple-800",
      iconClass: "text-purple-600 dark:text-purple-400",
      cardClass: "bg-note-lavender-soft dark:bg-note-lavender-dark",
      footerClass: "bg-note-lavender-soft dark:bg-note-lavender-dark",
      lightBg: "#F3E8FF", // purple-100
      darkBg: "#581C87", // purple-900
    },
    {
      id: "note-blush",
      label: "Blush",
      swatchClass: "bg-note-blush-soft dark:bg-note-blush-dark border border-pink-200 dark:border-pink-800",
      iconClass: "text-pink-600 dark:text-pink-400",
      cardClass: "bg-note-blush-soft dark:bg-note-blush-dark",
      footerClass: "bg-note-blush-soft dark:bg-note-blush-dark",
      lightBg: "#FCE7F3", // pink-100
      darkBg: "#831843", // pink-900
    },
    {
      id: "note-sky",
      label: "Sky",
      swatchClass: "bg-note-sky-soft dark:bg-note-sky-dark border border-blue-200 dark:border-blue-800",
      iconClass: "text-blue-600 dark:text-blue-400",
      cardClass: "bg-note-sky-soft dark:bg-note-sky-dark",
      footerClass: "bg-note-sky-soft dark:bg-note-sky-dark",
      lightBg: "#DBEAFE", // blue-100
      darkBg: "#1E3A5F", // rich navy blue
    },
    {
      id: "note-moss",
      label: "Moss",
      swatchClass: "bg-note-moss-soft dark:bg-note-moss-dark border border-emerald-200 dark:border-emerald-800",
      iconClass: "text-emerald-600 dark:text-emerald-400",
      cardClass: "bg-note-moss-soft dark:bg-note-moss-dark",
      footerClass: "bg-note-moss-soft dark:bg-note-moss-dark",
      lightBg: "#D1FAE5", // emerald-100
      darkBg: "#064E3B", // emerald-900
    },
    {
      id: "note-coal",
      label: "Graphite",
      swatchClass: "bg-note-coal-soft dark:bg-note-coal-dark border border-zinc-300 dark:border-zinc-600",
      iconClass: "text-zinc-400 dark:text-zinc-300",
      cardClass: "bg-note-coal-soft dark:bg-note-coal-dark",
      footerClass: "bg-note-coal-soft dark:bg-note-coal-dark",
      lightBg: "#E4E4E7", // zinc-200
      darkBg: "#18181B", // zinc-900
    },
  ];
