/**
 * Tailwind Class Presets - AINexSpace Design System
 *
 * Pre-configured Tailwind class combinations for common UI patterns.
 * These presets ensure consistency across all apps while reducing duplication.
 *
 * Each preset is a string of Tailwind classes that can be used directly
 * in className attributes or combined with the `cn()` utility.
 *
 * @module @ainexsuite/ui/config/tailwind-presets
 */

/**
 * Card Component Presets
 *
 * Standard card styles used throughout the suite.
 * All presets use CSS custom properties for theme compatibility.
 *
 * @example
 * ```tsx
 * import { cardStyles } from '@ainexsuite/ui/config/tailwind-presets';
 * import { cn } from '@ainexsuite/ui';
 *
 * // Use base card
 * <div className={cardStyles.base} />
 *
 * // Combine with hover
 * <div className={cn(cardStyles.base, cardStyles.hover)} />
 *
 * // Add custom classes
 * <div className={cn(cardStyles.elevated, 'p-6')} />
 * ```
 */
export const cardStyles = {
  /** Base card - Standard elevation and borders */
  base: 'rounded-xl bg-[rgb(var(--color-surface-card))] border border-[rgb(var(--color-outline-subtle))] shadow-sm',

  /** Elevated card - Higher elevation with stronger shadow */
  elevated: 'rounded-xl bg-[rgb(var(--color-surface-elevated))] border border-[rgb(var(--color-outline-subtle))] shadow-lg',

  /** Muted card - Lower contrast background */
  muted: 'rounded-xl bg-[rgb(var(--color-surface-muted))] border border-[rgb(var(--color-outline-subtle))]',

  /** Interactive card - Includes hover state */
  interactive: 'rounded-xl bg-[rgb(var(--color-surface-card))] border border-[rgb(var(--color-outline-subtle))] shadow-sm hover:bg-[rgb(var(--color-surface-hover))] hover:border-[rgb(var(--color-outline-base))] hover:shadow-lg transition-all duration-200',

  /** Glass card - Glassmorphism effect (Journey app) */
  glass: 'rounded-xl bg-white/8 backdrop-blur-lg border border-white/15 shadow-lg',

  /** Hover state - Add to base cards for interactivity */
  hover: 'hover:bg-[rgb(var(--color-surface-hover))] hover:border-[rgb(var(--color-outline-base))] hover:shadow-2xl transition-all duration-200',

  /** Active/Selected state */
  active: 'bg-[rgb(var(--color-surface-elevated))] border-[rgb(var(--color-accent-500))] shadow-lg',
} as const;

/**
 * Button Component Presets
 *
 * Common button styles that extend the existing Button component.
 * Use these for consistent button appearances across apps.
 *
 * @example
 * ```tsx
 * import { buttonStyles } from '@ainexsuite/ui/config/tailwind-presets';
 *
 * <button className={buttonStyles.primary} />
 * <button className={buttonStyles.ghost} />
 * ```
 */
export const buttonStyles = {
  /** Base button classes - Common to all variants */
  base: 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-accent-500))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',

  /** Primary button - Accent color with white text */
  primary: 'rounded-xl bg-[rgb(var(--color-accent-500))] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[rgb(var(--color-accent-600))] transition-all duration-200',

  /** Secondary button - Outlined style */
  secondary: 'rounded-xl border border-[rgb(var(--color-outline-subtle))] bg-[rgb(var(--color-surface-elevated))] px-4 py-2 text-sm font-semibold text-[rgb(var(--color-ink-900))] hover:bg-[rgb(var(--color-surface-muted))] transition-all duration-200',

  /** Ghost button - Transparent with hover state */
  ghost: 'rounded-xl px-4 py-2 text-sm font-semibold text-[rgb(var(--color-ink-900))] hover:bg-[rgb(var(--color-surface-elevated))] transition-all duration-200',

  /** Danger button - Red color for destructive actions */
  danger: 'rounded-xl bg-[rgb(var(--color-danger))] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all duration-200',

  /** Success button - Green color for positive actions */
  success: 'rounded-xl bg-[rgb(var(--color-success))] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all duration-200',

  /** Icon button - Circular button for icons */
  icon: 'inline-flex items-center justify-center rounded-full p-2 hover:bg-[rgb(var(--color-surface-elevated))] transition-all duration-200',

  /** Link button - Looks like a link */
  link: 'text-sm font-semibold text-[rgb(var(--color-accent-500))] hover:text-[rgb(var(--color-accent-600))] underline-offset-4 hover:underline transition-all duration-200',
} as const;

/**
 * Input Component Presets
 *
 * Form input styles for text inputs, textareas, and selects.
 *
 * @example
 * ```tsx
 * import { inputStyles } from '@ainexsuite/ui/config/tailwind-presets';
 *
 * <input className={inputStyles.base} />
 * <textarea className={inputStyles.textarea} />
 * ```
 */
export const inputStyles = {
  /** Base input - Standard text input */
  base: 'w-full rounded-xl border border-[rgb(var(--color-outline-subtle))] bg-[rgb(var(--color-surface-muted))]/50 px-4 py-2.5 text-sm text-[rgb(var(--color-ink-900))] placeholder:text-[rgb(var(--color-ink-400))] focus:border-[rgb(var(--color-accent-500))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-500))]/20 transition-all duration-200',

  /** Textarea - Multi-line input */
  textarea: 'w-full rounded-xl border border-[rgb(var(--color-outline-subtle))] bg-[rgb(var(--color-surface-muted))]/50 px-4 py-2.5 text-sm text-[rgb(var(--color-ink-900))] placeholder:text-[rgb(var(--color-ink-400))] focus:border-[rgb(var(--color-accent-500))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-500))]/20 transition-all duration-200 resize-none',

  /** Select dropdown */
  select: 'w-full rounded-xl border border-[rgb(var(--color-outline-subtle))] bg-[rgb(var(--color-surface-muted))]/50 px-4 py-2.5 text-sm text-[rgb(var(--color-ink-900))] focus:border-[rgb(var(--color-accent-500))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-500))]/20 transition-all duration-200',

  /** Error state */
  error: 'border-[rgb(var(--color-danger))] focus:ring-[rgb(var(--color-danger))]/20',

  /** Success state */
  success: 'border-[rgb(var(--color-success))] focus:ring-[rgb(var(--color-success))]/20',

  /** Disabled state */
  disabled: 'opacity-50 cursor-not-allowed bg-[rgb(var(--color-surface-muted))]',
} as const;

/**
 * Navigation Presets
 *
 * Common navigation patterns for headers, sidebars, and menus.
 *
 * @example
 * ```tsx
 * import { navigationStyles } from '@ainexsuite/ui/config/tailwind-presets';
 *
 * <header className={navigationStyles.header} />
 * <aside className={navigationStyles.sidebar} />
 * ```
 */
export const navigationStyles = {
  /** Top header - 64px height, sticky */
  header: 'sticky top-0 z-30 h-16 backdrop-blur-2xl bg-[rgb(var(--color-surface-base))]/95 border-b border-white/10',

  /** Header container - Centered with padding */
  headerContainer: 'mx-auto max-w-[1280px] px-6 flex items-center justify-between h-full',

  /** Left sidebar - Slide-in navigation */
  sidebar: 'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-[280px] bg-[rgb(var(--color-surface-base))]/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300',

  /** Right panel - Settings/Activity */
  panel: 'fixed right-0 top-0 z-50 h-screen w-[480px] bg-[rgb(var(--color-surface-base))]/95 backdrop-blur-xl border-l border-white/10 shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.3)]',

  /** Navigation link - Base style */
  navLink: 'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-[rgb(var(--color-ink-700))] hover:bg-[rgb(var(--color-surface-elevated))] hover:text-[rgb(var(--color-ink-900))] transition-all duration-200',

  /** Active navigation link */
  navLinkActive: 'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium bg-[rgb(var(--color-surface-elevated))] text-[rgb(var(--color-accent-500))] border-l-2 border-[rgb(var(--color-accent-500))]',
} as const;

/**
 * Modal and Dialog Presets
 *
 * Overlay, backdrop, and dialog styles for modals and drawers.
 *
 * @example
 * ```tsx
 * import { modalStyles } from '@ainexsuite/ui/config/tailwind-presets';
 *
 * <div className={modalStyles.overlay}>
 *   <div className={modalStyles.dialog}>
 *     {/* Modal content *\/}
 *   </div>
 * </div>
 * ```
 */
export const modalStyles = {
  /** Full-screen overlay */
  overlay: 'fixed inset-0 z-50 flex items-center justify-center p-4',

  /** Backdrop - Blurred background */
  backdrop: 'absolute inset-0 bg-[rgb(var(--color-surface-overlay))]/60 backdrop-blur-sm',

  /** Dialog container - Centered modal */
  dialog: 'relative rounded-3xl bg-[rgb(var(--color-surface-elevated))] shadow-floating border border-[rgb(var(--color-outline-subtle))] max-w-lg w-full',

  /** Dialog header */
  dialogHeader: 'flex items-center justify-between p-6 border-b border-[rgb(var(--color-outline-subtle))]',

  /** Dialog body */
  dialogBody: 'p-6',

  /** Dialog footer */
  dialogFooter: 'flex items-center justify-end gap-3 p-6 border-t border-[rgb(var(--color-outline-subtle))]',
} as const;

/**
 * Badge and Tag Presets
 *
 * Small labels, status indicators, and tags.
 *
 * @example
 * ```tsx
 * import { badgeStyles } from '@ainexsuite/ui/config/tailwind-presets';
 *
 * <span className={badgeStyles.primary}>New</span>
 * <span className={badgeStyles.success}>Active</span>
 * ```
 */
export const badgeStyles = {
  /** Base badge - Common classes */
  base: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',

  /** Primary badge - Accent color */
  primary: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[rgb(var(--color-accent-500))]/10 text-[rgb(var(--color-accent-500))] border border-[rgb(var(--color-accent-500))]/20',

  /** Success badge - Green */
  success: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))] border border-[rgb(var(--color-success))]/20',

  /** Warning badge - Yellow */
  warning: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))] border border-[rgb(var(--color-warning))]/20',

  /** Danger badge - Red */
  danger: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[rgb(var(--color-danger))]/10 text-[rgb(var(--color-danger))] border border-[rgb(var(--color-danger))]/20',

  /** Neutral badge - Gray */
  neutral: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[rgb(var(--color-surface-muted))] text-[rgb(var(--color-ink-700))] border border-[rgb(var(--color-outline-subtle))]',
} as const;

/**
 * List and Grid Presets
 *
 * Common layout patterns for lists, grids, and masonry layouts.
 *
 * @example
 * ```tsx
 * import { layoutStyles } from '@ainexsuite/ui/config/tailwind-presets';
 *
 * <div className={layoutStyles.masonry}>
 *   {/* Masonry items *\/}
 * </div>
 * ```
 */
export const layoutStyles = {
  /** Masonry grid - Responsive columns */
  masonry: 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4',

  /** Masonry item - Prevents breaking */
  masonryItem: 'break-inside-avoid mb-4',

  /** Grid layout - Responsive grid */
  grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',

  /** List layout - Vertical stack */
  list: 'flex flex-col gap-3',

  /** Container - Max width with padding */
  container: 'mx-auto max-w-[1280px] px-6',

  /** Section spacing */
  section: 'py-8 lg:py-12',
} as const;

/**
 * Typography Presets
 *
 * Text styles for headings, body text, and captions.
 *
 * @example
 * ```tsx
 * import { textStyles } from '@ainexsuite/ui/config/tailwind-presets';
 *
 * <h1 className={textStyles.h1}>Title</h1>
 * <p className={textStyles.body}>Content</p>
 * ```
 */
export const textStyles = {
  /** Heading 1 - Page titles */
  h1: 'text-4xl font-bold text-[rgb(var(--color-ink-900))]',

  /** Heading 2 - Section titles */
  h2: 'text-2xl font-semibold text-[rgb(var(--color-ink-900))]',

  /** Heading 3 - Subsection titles */
  h3: 'text-xl font-semibold text-[rgb(var(--color-ink-900))]',

  /** Heading 4 - Component titles */
  h4: 'text-lg font-semibold text-[rgb(var(--color-ink-900))]',

  /** Body large */
  bodyLarge: 'text-base text-[rgb(var(--color-ink-900))]',

  /** Body base - Default text */
  body: 'text-sm text-[rgb(var(--color-ink-900))]',

  /** Body small */
  bodySmall: 'text-xs text-[rgb(var(--color-ink-700))]',

  /** Caption - Muted text */
  caption: 'text-xs text-[rgb(var(--color-ink-600))]',

  /** Muted text */
  muted: 'text-sm text-[rgb(var(--color-ink-600))]',

  /** Link */
  link: 'text-sm text-[rgb(var(--color-accent-500))] hover:text-[rgb(var(--color-accent-600))] underline-offset-4 hover:underline transition-colors duration-200',
} as const;

/**
 * Utility Presets
 *
 * Common utility combinations for reuse.
 */
export const utilityStyles = {
  /** Focus ring - Accessible focus state */
  focusRing: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-accent-500))] focus-visible:ring-offset-2',

  /** Truncate text - Single line with ellipsis */
  truncate: 'overflow-hidden text-ellipsis whitespace-nowrap',

  /** Line clamp - Multi-line truncation */
  lineClamp2: 'line-clamp-2',
  lineClamp3: 'line-clamp-3',

  /** Screen reader only */
  srOnly: 'sr-only',

  /** Disabled state */
  disabled: 'opacity-50 cursor-not-allowed pointer-events-none',

  /** Smooth scroll */
  smoothScroll: 'scroll-smooth',

  /** Hide scrollbar */
  hideScrollbar: 'scrollbar-hide',
} as const;
