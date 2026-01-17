/**
 * Note Color Palette - Re-exported from Shared Design System
 *
 * This file re-exports the shared entry color system from @ainexsuite/ui.
 * All apps should use the unified entry color system for consistency.
 */

// Re-export everything from shared entry colors
export {
  ENTRY_COLORS,
  ENTRY_COLORS as NOTE_COLORS,
  LIGHT_ENTRY_COLORS,
  LIGHT_ENTRY_COLORS as LIGHT_COLORS,
  DARK_ENTRY_COLORS,
  DARK_ENTRY_COLORS as DARK_COLORS,
  DEFAULT_ENTRY_COLOR,
  DEFAULT_ENTRY_COLOR as DEFAULT_COLOR,
  getEntryColorConfig,
  getEntryColorConfig as getNoteColorConfig,
  shouldUseLightText,
  getAdaptiveTextClasses,
  ENTRY_COLOR_SWATCHES,
  type EntryColorConfig,
  type EntryColorConfig as NoteColorConfig,
} from "@ainexsuite/ui";

// Re-export EntryColor as NoteColor for backwards compatibility
export type { EntryColor, EntryColor as NoteColor } from "@ainexsuite/types";

/**
 * Migration map from old note-* colors to new entry-* colors.
 * Used when reading notes from Firestore that have old color IDs.
 */
export const NOTE_TO_ENTRY_COLOR_MAP: Record<string, string> = {
  // Direct mappings (same concept, different prefix)
  "note-lemon": "entry-lemon",
  "note-tangerine": "entry-tangerine",
  "note-fog": "entry-fog",
  "note-blush": "entry-blush",
  "note-moss": "entry-moss",
  "note-cream": "entry-cream",
  "note-coal": "entry-coal",
  "note-lavender": "entry-lavender",
  "note-sky": "entry-sky",
  // Legacy colors mapped to closest equivalents
  "note-white": "entry-coal", // Graphite (was dark)
  "note-peach": "entry-leather", // Espresso (brown tones)
  "note-mint": "entry-midnight", // Midnight (was dark)
  // Default stays default
  default: "default",
};

/**
 * Migrate an old note color ID to the new entry color ID.
 * Returns the input if it's already a valid entry-* color or default.
 */
export function migrateNoteColor(colorId: string | undefined | null): string {
  if (!colorId) return "default";

  // Already a valid entry-* color
  if (colorId === "default" || colorId.startsWith("entry-")) {
    return colorId;
  }

  // Map old note-* color to entry-* color
  return NOTE_TO_ENTRY_COLOR_MAP[colorId] || "default";
}
