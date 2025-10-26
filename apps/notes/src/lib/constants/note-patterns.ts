import type { NotePattern } from "@/lib/types/note";

/**
 * SVG background patterns for notes
 * Each pattern is designed to be subtle (8% opacity) and work on all note colors
 */

export const NOTE_PATTERNS: Array<{
  id: NotePattern;
  label: string;
  description: string;
  /** Tailwind class for the pattern background */
  patternClass: string;
  /** Preview icon for the picker */
  previewClass: string;
}> = [
  {
    id: "none",
    label: "None",
    description: "No pattern",
    patternClass: "",
    previewClass: "bg-orange-200 border-2 border-orange-300",
  },
  {
    id: "dots",
    label: "Dots",
    description: "Subtle dot pattern",
    patternClass: "bg-pattern-dots",
    previewClass: "bg-pattern-dots bg-orange-200",
  },
  {
    id: "grid",
    label: "Grid",
    description: "Minimal grid lines",
    patternClass: "bg-pattern-grid",
    previewClass: "bg-pattern-grid bg-orange-200",
  },
  {
    id: "diagonal",
    label: "Diagonal",
    description: "Diagonal stripes",
    patternClass: "bg-pattern-diagonal",
    previewClass: "bg-pattern-diagonal bg-orange-200",
  },
  {
    id: "waves",
    label: "Waves",
    description: "Organic wave pattern",
    patternClass: "bg-pattern-waves",
    previewClass: "bg-pattern-waves bg-orange-200",
  },
  {
    id: "circles",
    label: "Circles",
    description: "Scattered circles",
    patternClass: "bg-pattern-circles",
    previewClass: "bg-pattern-circles bg-orange-200",
  },
];

/**
 * SVG Pattern Data URIs
 * These are encoded SVG patterns that can be used as CSS background-image
 * Opacity is controlled via the stroke/fill opacity in the SVG (8% for subtlety)
 */

// Dots: Small circular dots in a grid pattern
export const PATTERN_DOTS_SVG =
  "data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='%23000' fill-opacity='0.08'/%3E%3C/svg%3E";

// Grid: Subtle grid lines
export const PATTERN_GRID_SVG =
  "data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 0v40M40 0v40M0 0h40M0 40h40' stroke='%23000' stroke-width='0.5' stroke-opacity='0.08'/%3E%3C/svg%3E";

// Diagonal: Diagonal stripes
export const PATTERN_DIAGONAL_SVG =
  "data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0M-10 10L10 -10M30 50L50 30' stroke='%23000' stroke-width='1' stroke-opacity='0.08'/%3E%3C/svg%3E";

// Waves: Organic wave pattern
export const PATTERN_WAVES_SVG =
  "data:image/svg+xml,%3Csvg width='60' height='30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 15Q15 5 30 15T60 15' stroke='%23000' stroke-width='1' fill='none' stroke-opacity='0.08'/%3E%3C/svg%3E";

// Circles: Scattered circles of varying sizes
export const PATTERN_CIRCLES_SVG =
  "data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='3' fill='%23000' fill-opacity='0.08'/%3E%3Ccircle cx='35' cy='25' r='4' fill='%23000' fill-opacity='0.06'/%3E%3Ccircle cx='50' cy='45' r='2.5' fill='%23000' fill-opacity='0.08'/%3E%3Ccircle cx='20' cy='48' r='3.5' fill='%23000' fill-opacity='0.07'/%3E%3C/svg%3E";
