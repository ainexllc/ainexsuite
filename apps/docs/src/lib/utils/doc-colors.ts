import type { DocColor } from "@/lib/types/doc";

/**
 * Determines text colors for doc backgrounds.
 * Light theme uses dark gray text, dark theme uses white text.
 */
export function getTextColorForBackground(color: DocColor): {
  title: string;
  body: string;
  muted: string;
  placeholder: string;
} {
  void color;
  // All colors use dark gray text in light theme, white text in dark theme
  return {
    title: "text-gray-900 dark:text-white",
    body: "text-gray-800 dark:text-white",
    muted: "text-gray-700 dark:text-gray-300",
    placeholder: "placeholder:text-gray-600 dark:placeholder:text-gray-400",
  };
}
