// Import EntryColor and re-export for convenience
import type { EntryColor } from '@ainexsuite/types';
export type { EntryColor };

/**
 * Entry Color Palette - Shared Design System
 *
 * Uses solid Tailwind colors with light/dark mode support:
 * - Light mode: {color}-50 for content, {color}-100 for footer
 * - Dark mode: {color}-950 for content, {color}-900 for footer
 *
 * textMode determines text color for proper contrast:
 * - 'theme': follows system light/dark mode
 * - 'dark': always dark text (for light backgrounds)
 * - 'light': always light text (for dark backgrounds)
 */
export type EntryColorConfig = {
  id: EntryColor;
  label: string;
  /** Color preview dot in picker */
  swatchClass: string;
  /** Icon color when used on this background */
  iconClass: string;
  /** Main card/content background */
  cardClass: string;
  /** Footer/toolbar area background */
  footerClass: string;
  /** Text mode for contrast: 'theme' | 'dark' | 'light' */
  textMode: 'theme' | 'dark' | 'light';
  /** Border styling */
  borderClass: string;
  /** Which column in two-column picker layout */
  column: 'left' | 'right';
};

export const ENTRY_COLORS: EntryColorConfig[] = [
  // Default - adapts to system theme (shown separately, not in columns)
  {
    id: 'default',
    label: 'Default',
    swatchClass: 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700',
    iconClass: 'text-zinc-400 dark:text-zinc-500',
    cardClass: 'bg-zinc-50 dark:bg-zinc-900',
    footerClass: 'bg-zinc-100 dark:bg-zinc-800/60',
    textMode: 'theme',
    borderClass: 'border-zinc-200 dark:border-zinc-700',
    column: 'left', // Not used - shown separately
  },
  // Light colors (pastel backgrounds - dark text) - 6 colors
  // Note: These stay LIGHT even in dark mode (no dark: variants) for visual consistency
  {
    id: 'entry-lemon',
    label: 'Sunshine',
    swatchClass: 'bg-yellow-100 border border-yellow-200',
    iconClass: 'text-yellow-600',
    cardClass: 'bg-yellow-100',
    footerClass: 'bg-yellow-200/70',
    textMode: 'dark',
    borderClass: 'border-yellow-200',
    column: 'left',
  },
  {
    id: 'entry-tangerine',
    label: 'Apricot',
    swatchClass: 'bg-amber-100 border border-amber-200',
    iconClass: 'text-amber-600',
    cardClass: 'bg-amber-100',
    footerClass: 'bg-amber-200/70',
    textMode: 'dark',
    borderClass: 'border-amber-200',
    column: 'left',
  },
  {
    id: 'entry-fog',
    label: 'Cloud',
    swatchClass: 'bg-blue-100 border border-blue-200',
    iconClass: 'text-blue-600',
    cardClass: 'bg-blue-100',
    footerClass: 'bg-blue-200/70',
    textMode: 'dark',
    borderClass: 'border-blue-200',
    column: 'left',
  },
  {
    id: 'entry-blush',
    label: 'Rose',
    swatchClass: 'bg-pink-100 border border-pink-200',
    iconClass: 'text-pink-600',
    cardClass: 'bg-pink-100',
    footerClass: 'bg-pink-200/70',
    textMode: 'dark',
    borderClass: 'border-pink-200',
    column: 'left',
  },
  {
    id: 'entry-moss',
    label: 'Sage',
    swatchClass: 'bg-emerald-100 border border-emerald-200',
    iconClass: 'text-emerald-600',
    cardClass: 'bg-emerald-100',
    footerClass: 'bg-emerald-200/70',
    textMode: 'dark',
    borderClass: 'border-emerald-200',
    column: 'left',
  },
  {
    id: 'entry-cream',
    label: 'Ivory',
    swatchClass: 'bg-amber-50 border border-amber-100',
    iconClass: 'text-amber-600',
    cardClass: 'bg-amber-50',
    footerClass: 'bg-amber-100/70',
    textMode: 'dark',
    borderClass: 'border-amber-100',
    column: 'left',
  },
  // Dark colors (rich backgrounds - light text) - 6 colors
  {
    id: 'entry-coal',
    label: 'Graphite',
    swatchClass: 'bg-zinc-700 dark:bg-zinc-800 border border-zinc-600 dark:border-zinc-600',
    iconClass: 'text-zinc-300 dark:text-zinc-300',
    cardClass: 'bg-zinc-700 dark:bg-zinc-800',
    footerClass: 'bg-zinc-800 dark:bg-zinc-700/70',
    textMode: 'light',
    borderClass: 'border-zinc-600 dark:border-zinc-600',
    column: 'right',
  },
  {
    id: 'entry-leather',
    label: 'Espresso',
    swatchClass: 'bg-amber-900 dark:bg-amber-950 border border-amber-700 dark:border-amber-800',
    iconClass: 'text-amber-200 dark:text-amber-300',
    cardClass: 'bg-amber-900 dark:bg-amber-950',
    footerClass: 'bg-amber-950 dark:bg-amber-900/70',
    textMode: 'light',
    borderClass: 'border-amber-700 dark:border-amber-800',
    column: 'right',
  },
  {
    id: 'entry-midnight',
    label: 'Midnight',
    swatchClass: 'bg-neutral-800 dark:bg-neutral-900 border border-neutral-700 dark:border-neutral-700',
    iconClass: 'text-neutral-300 dark:text-neutral-300',
    cardClass: 'bg-neutral-800 dark:bg-neutral-900',
    footerClass: 'bg-neutral-900 dark:bg-neutral-800/70',
    textMode: 'light',
    borderClass: 'border-neutral-700 dark:border-neutral-700',
    column: 'right',
  },
  {
    id: 'entry-lavender',
    label: 'Plum',
    swatchClass: 'bg-purple-800 dark:bg-purple-950 border border-purple-700 dark:border-purple-800',
    iconClass: 'text-purple-200 dark:text-purple-300',
    cardClass: 'bg-purple-800 dark:bg-purple-950',
    footerClass: 'bg-purple-900 dark:bg-purple-900/70',
    textMode: 'light',
    borderClass: 'border-purple-700 dark:border-purple-800',
    column: 'right',
  },
  {
    id: 'entry-sky',
    label: 'Ocean',
    swatchClass: 'bg-blue-800 dark:bg-blue-950 border border-blue-700 dark:border-blue-800',
    iconClass: 'text-blue-200 dark:text-blue-300',
    cardClass: 'bg-blue-800 dark:bg-blue-950',
    footerClass: 'bg-blue-900 dark:bg-blue-900/70',
    textMode: 'light',
    borderClass: 'border-blue-700 dark:border-blue-800',
    column: 'right',
  },
  {
    id: 'entry-slate',
    label: 'Blush',
    swatchClass: 'bg-pink-700 dark:bg-pink-800 border border-pink-600 dark:border-pink-700',
    iconClass: 'text-pink-200 dark:text-pink-300',
    cardClass: 'bg-pink-700 dark:bg-pink-800',
    footerClass: 'bg-pink-800 dark:bg-pink-700/70',
    textMode: 'light',
    borderClass: 'border-pink-600 dark:border-pink-700',
    column: 'right',
  },
];

/**
 * Get color configuration by ID
 */
export function getEntryColorConfig(colorId: EntryColor | string = 'default'): EntryColorConfig {
  return ENTRY_COLORS.find((c) => c.id === colorId) || ENTRY_COLORS[0];
}

/**
 * Get light colors (for left column in picker)
 */
export const LIGHT_ENTRY_COLORS = ENTRY_COLORS.filter((c) => c.column === 'left');

/**
 * Get dark colors (for right column in picker)
 */
export const DARK_ENTRY_COLORS = ENTRY_COLORS.filter((c) => c.column === 'right');

/**
 * Get the default color config
 */
export const DEFAULT_ENTRY_COLOR = ENTRY_COLORS[0];

/**
 * Determine if text should be light (white) on a given entry
 * @param colorId The entry color ID
 * @param hasCover Whether the entry has a cover image
 * @param hasBackgroundImage Whether the entry has a background image
 * @param backgroundBrightness The brightness of any background image
 * @returns True if text should be light
 */
export function shouldUseLightText(
  colorId: EntryColor | string,
  hasCover?: boolean,
  hasBackgroundImage?: boolean,
  backgroundBrightness?: 'light' | 'dark'
): boolean {
  // Cover images and dark backgrounds always need light text
  if (hasCover) return true;
  if (backgroundBrightness === 'dark') return true;
  if (hasBackgroundImage && backgroundBrightness !== 'light') return true;

  // Check the color's text mode
  const config = getEntryColorConfig(colorId);
  return config.textMode === 'light';
}

/**
 * Get adaptive text color classes based on entry configuration
 * @param colorId The entry color ID
 * @param hasCover Whether the entry has a cover image
 * @param backgroundBrightness The brightness of any background image
 * @returns Tailwind classes for text color
 */
export function getAdaptiveTextClasses(
  colorId: EntryColor | string,
  hasCover?: boolean,
  backgroundBrightness?: 'light' | 'dark'
): string {
  const useLightText = shouldUseLightText(colorId, hasCover, false, backgroundBrightness);

  if (useLightText) {
    return 'text-white/90';
  }

  const config = getEntryColorConfig(colorId);
  if (config.textMode === 'dark') {
    return 'text-zinc-800';
  }

  // Theme mode - follows system
  return 'text-zinc-900 dark:text-zinc-100';
}

/**
 * Simple color swatches for filter UI
 */
export const ENTRY_COLOR_SWATCHES: { value: EntryColor; label: string; className: string }[] = [
  { value: 'default', label: 'Default', className: 'bg-background' },
  { value: 'entry-lemon', label: 'Sunshine', className: 'bg-yellow-100' },
  { value: 'entry-tangerine', label: 'Apricot', className: 'bg-amber-100' },
  { value: 'entry-fog', label: 'Cloud', className: 'bg-slate-100' },
  { value: 'entry-blush', label: 'Rose', className: 'bg-pink-100' },
  { value: 'entry-moss', label: 'Sage', className: 'bg-emerald-100' },
  { value: 'entry-cream', label: 'Ivory', className: 'bg-stone-100' },
  { value: 'entry-coal', label: 'Graphite', className: 'bg-zinc-700' },
  { value: 'entry-leather', label: 'Espresso', className: 'bg-amber-900' },
  { value: 'entry-midnight', label: 'Midnight', className: 'bg-neutral-800' },
  { value: 'entry-lavender', label: 'Plum', className: 'bg-purple-800' },
  { value: 'entry-sky', label: 'Ocean', className: 'bg-blue-800' },
  { value: 'entry-slate', label: 'Blush', className: 'bg-pink-700' },
];

// Legacy aliases for backwards compatibility with Notes app
/** @deprecated Use EntryColor instead */
export type NoteColor = EntryColor;
/** @deprecated Use EntryColorConfig instead */
export type NoteColorConfig = EntryColorConfig;
/** @deprecated Use ENTRY_COLORS instead */
export const NOTE_COLORS = ENTRY_COLORS;
/** @deprecated Use getEntryColorConfig instead */
export const getNoteColorConfig = getEntryColorConfig;
/** @deprecated Use LIGHT_ENTRY_COLORS instead */
export const LIGHT_COLORS = LIGHT_ENTRY_COLORS;
/** @deprecated Use DARK_ENTRY_COLORS instead */
export const DARK_COLORS = DARK_ENTRY_COLORS;
/** @deprecated Use DEFAULT_ENTRY_COLOR instead */
export const DEFAULT_COLOR = DEFAULT_ENTRY_COLOR;
