import type { DocColor } from "@/lib/types/doc";

/**
 * Note Color Palette - Theme Lab Design System
 *
 * Uses solid Tailwind colors matching the theme lab:
 * - Light mode: {color}-50 for content, {color}-100 for footer
 * - Dark mode: {color}-950 for content, {color}-900 for footer
 */
export const DOC_COLORS: Array<{
  id: DocColor;
  label: string;
  swatchClass: string;
  iconClass: string;
  cardClass: string;
  footerClass: string;
}> = [
    {
      id: "default",
      label: "Default",
      swatchClass: "bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700",
      iconClass: "text-zinc-400 dark:text-zinc-500",
      cardClass: "bg-zinc-50 dark:bg-zinc-900",
      footerClass: "bg-zinc-100 dark:bg-zinc-800/60",
    },
    {
      id: "doc-white",
      label: "White",
      swatchClass: "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700",
      iconClass: "text-zinc-300 dark:text-zinc-600",
      cardClass: "bg-white dark:bg-zinc-900",
      footerClass: "bg-zinc-100 dark:bg-zinc-800/60",
    },
    {
      id: "doc-lemon",
      label: "Lemon",
      swatchClass: "bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800",
      iconClass: "text-yellow-600 dark:text-yellow-400",
      cardClass: "bg-yellow-50 dark:bg-yellow-950",
      footerClass: "bg-yellow-100 dark:bg-yellow-900/70",
    },
    {
      id: "doc-peach",
      label: "Peach",
      swatchClass: "bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800",
      iconClass: "text-orange-600 dark:text-orange-400",
      cardClass: "bg-orange-50 dark:bg-orange-950",
      footerClass: "bg-orange-100 dark:bg-orange-900/70",
    },
    {
      id: "doc-tangerine",
      label: "Tangerine",
      swatchClass: "bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800",
      iconClass: "text-amber-600 dark:text-amber-400",
      cardClass: "bg-amber-50 dark:bg-amber-950",
      footerClass: "bg-amber-100 dark:bg-amber-900/70",
    },
    {
      id: "doc-mint",
      label: "Mint",
      swatchClass: "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800",
      iconClass: "text-green-600 dark:text-green-400",
      cardClass: "bg-green-50 dark:bg-green-950",
      footerClass: "bg-green-100 dark:bg-green-900/70",
    },
    {
      id: "doc-fog",
      label: "Fog",
      swatchClass: "bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800",
      iconClass: "text-slate-600 dark:text-slate-400",
      cardClass: "bg-slate-50 dark:bg-slate-950",
      footerClass: "bg-slate-100 dark:bg-slate-900/70",
    },
    {
      id: "doc-lavender",
      label: "Lavender",
      swatchClass: "bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800",
      iconClass: "text-purple-600 dark:text-purple-400",
      cardClass: "bg-purple-50 dark:bg-purple-950",
      footerClass: "bg-purple-100 dark:bg-purple-900/70",
    },
    {
      id: "doc-blush",
      label: "Blush",
      swatchClass: "bg-pink-50 dark:bg-pink-950 border border-pink-200 dark:border-pink-800",
      iconClass: "text-pink-600 dark:text-pink-400",
      cardClass: "bg-pink-50 dark:bg-pink-950",
      footerClass: "bg-pink-100 dark:bg-pink-900/70",
    },
    {
      id: "doc-sky",
      label: "Sky",
      swatchClass: "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800",
      iconClass: "text-blue-600 dark:text-blue-400",
      cardClass: "bg-blue-50 dark:bg-blue-950",
      footerClass: "bg-blue-100 dark:bg-blue-900/70",
    },
    {
      id: "doc-moss",
      label: "Moss",
      swatchClass: "bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800",
      iconClass: "text-emerald-600 dark:text-emerald-400",
      cardClass: "bg-emerald-50 dark:bg-emerald-950",
      footerClass: "bg-emerald-100 dark:bg-emerald-900/70",
    },
    {
      id: "doc-coal",
      label: "Graphite",
      swatchClass: "bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600",
      iconClass: "text-zinc-400 dark:text-zinc-300",
      cardClass: "bg-zinc-100 dark:bg-zinc-800",
      footerClass: "bg-zinc-200 dark:bg-zinc-700/70",
    },
  ];
