import type { NoteColor } from "@/lib/types/note";

/**
 * Determines text colors for note backgrounds.
 * Light theme uses dark gray text, dark theme uses white text.
 */
export function getTextColorForBackground(color: NoteColor): {
  title: string;
  body: string;
  muted: string;
  placeholder: string;
} {
  // All colors use dark gray text in light theme, white text in dark theme
  return {
    title: "text-gray-900 dark:text-white",
    body: "text-gray-800 dark:text-white",
    muted: "text-gray-700 dark:text-gray-300",
    placeholder: "placeholder:text-gray-600 dark:placeholder:text-gray-400",
  };
}
