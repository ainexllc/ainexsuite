import type { NoteColor } from "@/lib/types/note";

export const NOTE_COLORS: Array<{
  id: NoteColor;
  label: string;
  swatchClass: string;
  footerClass: string;
}> = [
  {
    id: "default",
    label: "Default",
    swatchClass:
      "bg-surface-elevated border border-outline-subtle text-ink-700",
    footerClass: "bg-white/5",
  },
  {
    id: "note-white",
    label: "White",
    swatchClass: "bg-note-white text-gray-900 border border-gray-200",
    footerClass: "bg-note-white/20",
  },
  {
    id: "note-lemon",
    label: "Lemon",
    swatchClass: "bg-note-lemon text-ink-100 border border-transparent",
    footerClass: "bg-note-lemon/20",
  },
  {
    id: "note-peach",
    label: "Peach",
    swatchClass: "bg-note-peach text-ink-100 border border-transparent",
    footerClass: "bg-note-peach/20",
  },
  {
    id: "note-tangerine",
    label: "Tangerine",
    swatchClass: "bg-note-tangerine text-ink-100 border border-transparent",
    footerClass: "bg-note-tangerine/20",
  },
  {
    id: "note-mint",
    label: "Mint",
    swatchClass: "bg-note-mint text-ink-100 border border-transparent",
    footerClass: "bg-note-mint/20",
  },
  {
    id: "note-fog",
    label: "Fog",
    swatchClass: "bg-note-fog text-ink-100 border border-transparent",
    footerClass: "bg-note-fog/20",
  },
  {
    id: "note-lavender",
    label: "Lavender",
    swatchClass: "bg-note-lavender text-ink-100 border border-transparent",
    footerClass: "bg-note-lavender/20",
  },
  {
    id: "note-blush",
    label: "Blush",
    swatchClass: "bg-note-blush text-ink-100 border border-transparent",
    footerClass: "bg-note-blush/20",
  },
  {
    id: "note-sky",
    label: "Sky",
    swatchClass: "bg-note-sky text-ink-100 border border-transparent",
    footerClass: "bg-note-sky/20",
  },
  {
    id: "note-moss",
    label: "Moss",
    swatchClass: "bg-note-moss text-ink-100 border border-transparent",
    footerClass: "bg-note-moss/20",
  },
  {
    id: "note-coal",
    label: "Graphite",
    swatchClass: "bg-note-coal text-white border border-transparent",
    footerClass: "bg-note-coal/30",
  },
];
