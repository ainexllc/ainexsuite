/**
 * ClassName Utility Template
 *
 * Utility for merging Tailwind class names with conditional logic.
 * Uses clsx for conditional classes and tailwind-merge to handle conflicts.
 *
 * File: lib/cn.ts
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with Tailwind conflict resolution
 *
 * @example
 * cn("px-2 py-1", condition && "px-4") // → "px-4 py-1"
 * cn("text-red-500", "text-blue-500") // → "text-blue-500"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
