/**
 * Background helper functions for adaptive styling
 * Backgrounds are managed via admin app and stored in Firestore
 * These helpers work with any object that has a 'brightness' field
 */

import type { BackgroundOverlay } from '@ainexsuite/types';

export interface BackgroundOption {
  id: string;
  name: string;
  thumbnail: string;
  fullImage: string;
  brightness: 'light' | 'dark';
  category?: string;
  tags?: string[];
}

/**
 * Static fallback backgrounds (used when Firestore is unavailable)
 */
export const FALLBACK_BACKGROUNDS: BackgroundOption[] = [
  {
    id: 'winter-lights',
    name: 'Winter Lights',
    thumbnail: '/backgrounds/dark/winter-lights.jpg',
    fullImage: '/backgrounds/dark/winter-lights.jpg',
    brightness: 'dark',
  },
  {
    id: 'winter-cabin-light',
    name: 'Winter Cabin',
    thumbnail: '/backgrounds/light/winter-cabin.jpg',
    fullImage: '/backgrounds/light/winter-cabin.jpg',
    brightness: 'light',
  },
  {
    id: 'winter-cabin-dark',
    name: 'Winter Cabin',
    thumbnail: '/backgrounds/dark/winter-cabin.jpg',
    fullImage: '/backgrounds/dark/winter-cabin.jpg',
    brightness: 'dark',
  },
];

/**
 * Overlay options for background images
 */
export const OVERLAY_OPTIONS: { id: BackgroundOverlay; label: string; description: string }[] = [
  { id: 'none', label: 'None', description: 'No overlay' },
  { id: 'auto', label: 'Auto', description: 'Adaptive based on image' },
  { id: 'dim', label: 'Dim', description: 'Light dark overlay' },
  { id: 'dimmer', label: 'Dimmer', description: 'Medium dark overlay' },
  { id: 'dimmest', label: 'Dimmest', description: 'Heavy dark overlay' },
  { id: 'glass', label: 'Glass', description: 'Light frosted glass' },
  { id: 'frost', label: 'Frost', description: 'Heavy frosted glass' },
  { id: 'gradient', label: 'Gradient', description: 'Dark gradient from bottom' },
];

/**
 * Get text color classes based on background brightness
 */
export function getTextColorClasses(
  bg: BackgroundOption | null,
  variant: 'title' | 'body' | 'muted'
): string {
  if (!bg) {
    // No background - use theme-aware defaults
    switch (variant) {
      case 'title':
        return 'text-zinc-900 dark:text-zinc-50';
      case 'body':
        return 'text-zinc-700 dark:text-zinc-300';
      case 'muted':
        return 'text-zinc-500 dark:text-zinc-400';
      default:
        return 'text-zinc-700 dark:text-zinc-300';
    }
  }

  // Background present - adapt based on brightness
  if (bg.brightness === 'dark') {
    // Dark background - use light text
    switch (variant) {
      case 'title':
        return 'text-white';
      case 'body':
        return 'text-white/90';
      case 'muted':
        return 'text-white/70';
      default:
        return 'text-white/90';
    }
  } else {
    // Light background - use dark text
    switch (variant) {
      case 'title':
        return 'text-zinc-900';
      case 'body':
        return 'text-zinc-800';
      case 'muted':
        return 'text-zinc-600';
      default:
        return 'text-zinc-800';
    }
  }
}

/**
 * Get overlay classes based on background and overlay setting
 */
export function getOverlayClasses(
  bg: BackgroundOption | null,
  overlay: BackgroundOverlay = 'auto'
): string {
  if (!bg) return '';

  const base = 'absolute inset-0 w-full h-full pointer-events-none';

  switch (overlay) {
    case 'none':
      return '';

    case 'dim':
      // Light dark overlay
      return `${base} bg-black/30`;

    case 'dimmer':
      // Medium dark overlay
      return `${base} bg-black/50`;

    case 'dimmest':
      // Heavy dark overlay
      return `${base} bg-black/80`;

    case 'glass':
      // Light frosted glass effect
      return `${base} bg-white/10 backdrop-blur-sm`;

    case 'frost':
      // Heavy frosted glass effect
      return `${base} bg-black/20 backdrop-blur-md`;

    case 'gradient':
      // Dark gradient from bottom for text readability
      return `${base} bg-gradient-to-t from-black/60 via-black/20 to-transparent`;

    case 'auto':
    default:
      // Adaptive: white overlay on light backgrounds, none on dark
      return bg.brightness === 'light'
        ? `${base} bg-white/35`
        : '';
  }
}

/**
 * Get button/action color classes based on background brightness
 */
export function getActionColorClasses(
  bg: BackgroundOption | null,
  isActive?: boolean
): string {
  if (!bg) {
    return isActive
      ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700';
  }

  if (bg.brightness === 'dark') {
    return isActive
      ? 'text-white bg-white/20'
      : 'text-white/70 hover:text-white hover:bg-white/20';
  } else {
    return isActive
      ? 'text-zinc-900 bg-black/10'
      : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/10';
  }
}

/**
 * Get a background by ID from provided list or fallback
 */
export function getBackgroundById(
  id: string,
  backgrounds?: BackgroundOption[]
): BackgroundOption | undefined {
  const list = backgrounds || FALLBACK_BACKGROUNDS;
  return list.find(bg => bg.id === id);
}
