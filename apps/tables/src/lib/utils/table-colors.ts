import type { TableColor } from "@/lib/types/table";

/**
 * Determines text colors for table backgrounds.
 * Light theme uses dark gray text, dark theme uses white text.
 */
export function getTextColorForBackground(color: TableColor): {
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
