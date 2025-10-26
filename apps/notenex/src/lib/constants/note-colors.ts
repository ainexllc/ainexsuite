import type { NoteColor } from "@/lib/types/note";

export const NOTE_COLORS: Array<{
  id: NoteColor;
  label: string;
  swatchClass: string;
}> = [
  {
    id: "default",
    label: "Default",
    swatchClass:
      "bg-surface-elevated border border-outline-subtle text-ink-700",
  },
  {
    id: "note-white",
    label: "White",
    swatchClass: "bg-note-white text-gray-900 border border-gray-200",
  },
  {
    id: "note-lemon",
    label: "Lemon",
    swatchClass: "bg-note-lemon text-ink-100 border border-transparent",
  },
  {
    id: "note-peach",
    label: "Peach",
    swatchClass: "bg-note-peach text-ink-100 border border-transparent",
  },
  {
    id: "note-tangerine",
    label: "Tangerine",
    swatchClass: "bg-note-tangerine text-ink-100 border border-transparent",
  },
  {
    id: "note-mint",
    label: "Mint",
    swatchClass: "bg-note-mint text-ink-100 border border-transparent",
  },
  {
    id: "note-fog",
    label: "Fog",
    swatchClass: "bg-note-fog text-ink-100 border border-transparent",
  },
  {
    id: "note-lavender",
    label: "Lavender",
    swatchClass: "bg-note-lavender text-ink-100 border border-transparent",
  },
  {
    id: "note-blush",
    label: "Blush",
    swatchClass: "bg-note-blush text-ink-100 border border-transparent",
  },
  {
    id: "note-sky",
    label: "Sky",
    swatchClass: "bg-note-sky text-ink-100 border border-transparent",
  },
  {
    id: "note-moss",
    label: "Moss",
    swatchClass: "bg-note-moss text-ink-100 border border-transparent",
  },
  {
    id: "note-coal",
    label: "Graphite",
    swatchClass: "bg-note-coal text-white border border-transparent",
  },
];
