/**
 * Utility functions for UI components
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Alias for cn (used by Tremor components)
 */
export const cx = cn;

/**
 * Focus ring utility for consistent focus styling
 */
export const focusRing =
  'outline outline-offset-2 outline-0 focus-visible:outline-2 outline-blue-500 dark:outline-blue-500';

/**
 * Generate a UUID with fallback for browsers without crypto.randomUUID
 * (crypto.randomUUID requires secure context - HTTPS or localhost)
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older browsers or non-secure contexts (HTTP on local network)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
