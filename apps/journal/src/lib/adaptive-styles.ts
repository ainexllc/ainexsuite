/**
 * Adaptive styling utilities for background-aware components.
 * These functions return Tailwind classes that adapt based on background brightness.
 */

type BackgroundBrightness = 'light' | 'dark' | null;

/**
 * Get text color classes based on background brightness
 */
export function getAdaptiveTextClass(
  brightness: BackgroundBrightness,
  variant: 'title' | 'body' | 'muted' | 'placeholder' = 'body'
): string {
  if (brightness === 'dark') {
    switch (variant) {
      case 'title':
        return 'text-white';
      case 'body':
        return 'text-white/90';
      case 'muted':
        return 'text-white/70';
      case 'placeholder':
        return 'placeholder:text-white/50';
      default:
        return 'text-white/90';
    }
  }

  if (brightness === 'light') {
    switch (variant) {
      case 'title':
        return 'text-zinc-900';
      case 'body':
        return 'text-zinc-800';
      case 'muted':
        return 'text-zinc-600';
      case 'placeholder':
        return 'placeholder:text-zinc-500';
      default:
        return 'text-zinc-800';
    }
  }

  // No background - use standard theme-aware classes
  switch (variant) {
    case 'title':
      return 'text-zinc-900 dark:text-zinc-50';
    case 'body':
      return 'text-zinc-700 dark:text-zinc-300';
    case 'muted':
      return 'text-zinc-500 dark:text-zinc-400';
    case 'placeholder':
      return 'placeholder:text-zinc-400 dark:placeholder:text-zinc-600';
    default:
      return 'text-zinc-700 dark:text-zinc-300';
  }
}

/**
 * Get input/textarea styling classes based on background brightness
 */
export function getAdaptiveInputClass(brightness: BackgroundBrightness): string {
  if (brightness === 'dark') {
    return 'bg-transparent text-white placeholder:text-white/50 caret-white';
  }

  if (brightness === 'light') {
    return 'bg-transparent text-zinc-900 placeholder:text-zinc-500 caret-zinc-900';
  }

  // No background - standard theme-aware
  return 'bg-transparent text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600';
}

/**
 * Get background classes for UI elements (buttons, toolbars, etc.)
 */
export function getAdaptiveBgClass(
  brightness: BackgroundBrightness,
  variant: 'default' | 'elevated' | 'interactive' = 'default'
): string {
  if (brightness === 'dark') {
    switch (variant) {
      case 'default':
        return 'bg-white/10';
      case 'elevated':
        return 'bg-white/15 backdrop-blur-sm';
      case 'interactive':
        return 'bg-white/10 hover:bg-white/20';
      default:
        return 'bg-white/10';
    }
  }

  if (brightness === 'light') {
    switch (variant) {
      case 'default':
        return 'bg-black/5';
      case 'elevated':
        return 'bg-black/10 backdrop-blur-sm';
      case 'interactive':
        return 'bg-black/5 hover:bg-black/10';
      default:
        return 'bg-black/5';
    }
  }

  // No background - standard theme-aware
  switch (variant) {
    case 'default':
      return 'bg-zinc-100 dark:bg-zinc-800';
    case 'elevated':
      return 'bg-white dark:bg-zinc-800 shadow-sm';
    case 'interactive':
      return 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700';
    default:
      return 'bg-zinc-100 dark:bg-zinc-800';
  }
}

/**
 * Get button styling classes based on background brightness
 */
export function getAdaptiveButtonClass(
  brightness: BackgroundBrightness,
  isActive?: boolean
): string {
  if (brightness === 'dark') {
    return isActive
      ? 'bg-white/20 text-white'
      : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white';
  }

  if (brightness === 'light') {
    return isActive
      ? 'bg-black/15 text-zinc-900'
      : 'bg-black/5 hover:bg-black/10 text-zinc-700 hover:text-zinc-900';
  }

  // No background - standard theme-aware
  return isActive
    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
    : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200';
}

/**
 * Get border color classes based on background brightness
 */
export function getAdaptiveBorderClass(brightness: BackgroundBrightness): string {
  if (brightness === 'dark') {
    return 'border-white/20';
  }

  if (brightness === 'light') {
    return 'border-black/10';
  }

  // No background - standard theme-aware
  return 'border-zinc-200 dark:border-zinc-700';
}

/**
 * Get toolbar/container classes based on background brightness
 */
export function getAdaptiveToolbarClass(brightness: BackgroundBrightness): string {
  if (brightness === 'dark') {
    return 'bg-black/30 backdrop-blur-sm border-white/10';
  }

  if (brightness === 'light') {
    return 'bg-white/50 backdrop-blur-sm border-black/10';
  }

  // No background - standard theme-aware
  return 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700';
}

/**
 * Get icon/action button classes (for toolbar icons)
 */
export function getAdaptiveIconButtonClass(
  brightness: BackgroundBrightness,
  isActive?: boolean
): string {
  if (brightness === 'dark') {
    return isActive
      ? 'text-white bg-white/20'
      : 'text-white/70 hover:text-white hover:bg-white/10';
  }

  if (brightness === 'light') {
    return isActive
      ? 'text-zinc-900 bg-black/10'
      : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/5';
  }

  // No background - standard theme-aware
  return isActive
    ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800';
}

/**
 * Get select/dropdown classes based on background brightness
 */
export function getAdaptiveSelectClass(brightness: BackgroundBrightness): string {
  if (brightness === 'dark') {
    return 'bg-white/10 text-white border-white/20 focus:border-white/40';
  }

  if (brightness === 'light') {
    return 'bg-black/5 text-zinc-900 border-black/10 focus:border-black/20';
  }

  // No background - standard theme-aware
  return 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 border-zinc-300 dark:border-zinc-600';
}

/**
 * Get mood button classes based on background brightness
 */
export function getAdaptiveMoodButtonClass(
  brightness: BackgroundBrightness,
  isSelected?: boolean
): string {
  if (brightness === 'dark') {
    return isSelected
      ? 'bg-white/25 text-white ring-2 ring-white/50'
      : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white';
  }

  if (brightness === 'light') {
    return isSelected
      ? 'bg-black/15 text-zinc-900 ring-2 ring-black/20'
      : 'bg-black/5 text-zinc-700 hover:bg-black/10 hover:text-zinc-900';
  }

  // No background - standard theme-aware
  return isSelected
    ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30'
    : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10';
}
