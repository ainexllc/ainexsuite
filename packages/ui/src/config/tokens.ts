/**
 * Design Tokens - AINexSuite Unified Design System
 *
 * This module provides a centralized token system that works seamlessly with:
 * - Tailwind CSS classes
 * - CSS custom properties (CSS variables)
 * - TypeScript type safety
 *
 * All tokens are derived from the documented design system and existing patterns
 * across the monorepo. Use these tokens to maintain consistency across all apps.
 *
 * @module @ainexsuite/ui/config/tokens
 */

/**
 * Spacing Scale
 *
 * Consistent spacing values using rem units (1rem = 16px by default).
 * Maps to Tailwind's default spacing scale.
 *
 * @example
 * ```tsx
 * import { spacing } from '@ainexsuite/ui/config/tokens';
 *
 * // In inline styles
 * <div style={{ padding: spacing.md }} />
 *
 * // For reference in calculations
 * const dynamicMargin = `calc(${spacing.lg} + 2px)`;
 * ```
 */
export const spacing = {
  /** 4px - Minimal spacing for tight layouts */
  xs: '0.25rem',
  /** 8px - Small gaps, compact elements */
  sm: '0.5rem',
  /** 16px - Default spacing, most common use */
  md: '1rem',
  /** 24px - Section spacing, card padding */
  lg: '1.5rem',
  /** 32px - Large sections, page margins */
  xl: '2rem',
  /** 48px - Major layout divisions */
  '2xl': '3rem',
  /** 64px - Hero sections, major separations */
  '3xl': '4rem',
} as const;

/**
 * Border Radius Scale
 *
 * Rounded corner values for consistent component styling.
 * Based on design system documentation (DESIGN_SYSTEM_ESSENTIALS.md).
 *
 * @example
 * ```tsx
 * import { radius } from '@ainexsuite/ui/config/tokens';
 *
 * // In inline styles
 * <div style={{ borderRadius: radius.lg }} />
 * ```
 */
export const radius = {
  /** 6px - Small elements like tags, badges */
  sm: '0.375rem',
  /** 8px - Buttons, small inputs, chips */
  md: '0.5rem',
  /** 12px - Standard cards, inputs, most components (rounded-xl) */
  lg: '0.75rem',
  /** 16px - Large cards, modals (rounded-2xl) */
  xl: '1rem',
  /** 24px - Hero cards, featured panels (rounded-3xl) */
  '2xl': '1.5rem',
  /** 9999px - Pills, avatars, circular elements (rounded-full) */
  full: '9999px',
} as const;

/**
 * Shadow Scale
 *
 * Box shadow presets matching the design system's elevation system.
 * All shadows use dark mode colors with adjusted opacity for light mode.
 *
 * @example
 * ```tsx
 * import { shadows } from '@ainexsuite/ui/config/tokens';
 *
 * // In inline styles
 * <div style={{ boxShadow: shadows.lg }} />
 * ```
 */
export const shadows = {
  /** Subtle shadow for slight elevation (4px blur, 18% opacity) */
  sm: '0 4px 20px rgba(10, 10, 15, 0.18)',
  /** Medium shadow for cards, dropdowns (10px blur, 22% opacity) */
  md: '0 10px 40px rgba(10, 10, 15, 0.22)',
  /** Large shadow for modals, popovers (20px blur, 28% opacity) */
  lg: '0 20px 60px rgba(10, 10, 15, 0.28)',
  /** Extra large shadow for major elevation (40px blur, 32% opacity) */
  xl: '0 30px 80px rgba(10, 10, 15, 0.32)',
  /** Floating shadow for tooltips, menus */
  floating: '0 12px 32px rgba(10, 10, 15, 0.24)',
} as const;

/**
 * Light Mode Shadow Scale
 *
 * Lighter shadows optimized for light theme backgrounds.
 * Automatically applied via theme-specific CSS.
 */
export const shadowsLight = {
  sm: '0 4px 16px rgba(20, 20, 30, 0.08)',
  md: '0 12px 32px rgba(20, 20, 30, 0.12)',
  lg: '0 24px 48px rgba(20, 20, 30, 0.18)',
  xl: '0 32px 64px rgba(20, 20, 30, 0.22)',
  floating: '0 16px 40px rgba(20, 20, 30, 0.14)',
} as const;

/**
 * Typography Scale
 *
 * Font size, line height, and weight presets.
 * Based on the design system's typography hierarchy.
 *
 * @example
 * ```tsx
 * import { typography } from '@ainexsuite/ui/config/tokens';
 *
 * // In inline styles
 * <h1 style={{
 *   fontSize: typography.h1.size,
 *   lineHeight: typography.h1.lineHeight,
 *   fontWeight: typography.h1.weight
 * }} />
 * ```
 */
export const typography = {
  h1: {
    size: '2.25rem', // 36px
    lineHeight: '2.5rem',
    weight: '700',
  },
  h2: {
    size: '1.5rem', // 24px
    lineHeight: '2rem',
    weight: '600',
  },
  h3: {
    size: '1.25rem', // 20px
    lineHeight: '1.75rem',
    weight: '600',
  },
  h4: {
    size: '1.125rem', // 18px
    lineHeight: '1.75rem',
    weight: '600',
  },
  body: {
    large: {
      size: '1rem', // 16px
      lineHeight: '1.5rem',
      weight: '400',
    },
    base: {
      size: '0.875rem', // 14px
      lineHeight: '1.25rem',
      weight: '400',
    },
    small: {
      size: '0.75rem', // 12px
      lineHeight: '1rem',
      weight: '400',
    },
  },
} as const;

/**
 * Font Families
 *
 * Standardized font stacks with fallbacks.
 * References CSS custom properties defined in globals.css.
 */
export const fonts = {
  /** Primary UI font - Geist Sans */
  sans: 'var(--font-geist-sans, system-ui, sans-serif)',
  /** Monospace font - Geist Mono */
  mono: 'var(--font-geist-mono, ui-monospace, monospace)',
  /** Accent font - Kanit */
  display: 'var(--font-kanit, system-ui, sans-serif)',
} as const;

/**
 * Z-Index Scale
 *
 * Layering system for stacking contexts.
 * Ensures consistent ordering of overlapping elements.
 *
 * @example
 * ```tsx
 * import { zIndex } from '@ainexsuite/ui/config/tokens';
 *
 * // In inline styles
 * <div style={{ zIndex: zIndex.modal }} />
 * ```
 */
export const zIndex = {
  /** Base content layer */
  base: 0,
  /** Dropdowns, tooltips */
  dropdown: 10,
  /** Sticky headers, fixed navigation */
  sticky: 20,
  /** Slide-in panels, drawers */
  drawer: 30,
  /** Overlay backgrounds */
  overlay: 40,
  /** Modals, dialogs */
  modal: 50,
  /** Popovers on top of modals */
  popover: 60,
  /** Toast notifications */
  toast: 70,
  /** Tooltips (highest priority) */
  tooltip: 80,
} as const;

/**
 * Glassmorphism Presets
 *
 * Pre-configured glassmorphism effects using backdrop-blur and transparency.
 * Primary pattern for Journey app, available for all apps.
 *
 * @example
 * ```tsx
 * import { glass } from '@ainexsuite/ui/config/tokens';
 *
 * // Use as className string
 * <div className={glass.light} />
 *
 * // Combine with other classes
 * <div className={`${glass.medium} rounded-xl p-6`} />
 * ```
 */
export const glass = {
  /** Light glass - Subtle transparency with minimal blur (theme-aware) */
  light: 'bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-gray-200/30 dark:border-white/10',
  /** Medium glass - Balanced transparency and blur (theme-aware) */
  medium: 'bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200/50 dark:border-white/20 shadow-lg dark:shadow-none',
  /** Heavy glass - Strong blur with subtle tint (theme-aware) */
  heavy: 'bg-white/80 dark:bg-card/60 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-lg dark:shadow-none',
  /** Card glass - Optimized for card components (theme-aware) */
  card: 'bg-card/80 dark:bg-card/60 backdrop-blur-lg border border-border shadow-lg dark:shadow-none',
  /** Overlay glass - For modal/drawer backdrops (theme-aware) */
  overlay: 'bg-black/40 dark:bg-black/60 backdrop-blur-md',
} as const;

/**
 * Container Widths
 *
 * Maximum width values for page containers.
 * Matches the design system's responsive layout patterns.
 *
 * @example
 * ```tsx
 * import { containers } from '@ainexsuite/ui/config/tokens';
 *
 * // In inline styles
 * <div style={{ maxWidth: containers.lg }} />
 *
 * // For breakpoint logic
 * const isMobile = width < parseInt(containers.sm);
 * ```
 */
export const containers = {
  /** Mobile - Full width */
  xs: '100%',
  /** Small tablets - 720px */
  sm: '720px',
  /** Tablets - 960px */
  md: '960px',
  /** Desktop - 1184px */
  lg: '1184px',
  /** Large desktop - 1280px (primary max-width) */
  xl: '1280px',
  /** Extra large - 1440px */
  '2xl': '1440px',
  /** Ultra wide - 1600px */
  '3xl': '1600px',
} as const;

/**
 * App Shell Widths
 *
 * Specialized container widths for app layouts.
 * Used in main content areas and centered layouts.
 */
export const appShell = {
  /** Standard app shell widths */
  standard: {
    xs: '100%',
    sm: '560px',
    md: '720px',
    lg: '820px',
    xl: '880px',
  },
  /** Wide app shell widths (for data-heavy views) */
  wide: {
    sm: '700px',
    md: '1120px',
    lg: '1280px',
    xl: '1440px',
  },
  /** Note board specific widths */
  noteBoard: {
    sm: '520px',
    md: '720px',
    lg: '1024px',
    xl: '1200px',
  },
  /** Fixed dimensions */
  utilityWidth: '320px',
  inspectorWidth: 'clamp(260px, 24vw, 340px)',
  gridGap: '1.5rem',
} as const;

/**
 * Transition Durations
 *
 * Standard animation timing values.
 * Keeps animations consistent across the suite.
 *
 * @example
 * ```tsx
 * import { transitions } from '@ainexsuite/ui/config/tokens';
 *
 * // In inline styles
 * <div style={{ transition: `all ${transitions.base} ease` }} />
 * ```
 */
export const transitions = {
  /** Fast transitions - Immediate feedback (100ms) */
  fast: '100ms',
  /** Base transitions - Standard interactions (160ms) */
  base: '160ms',
  /** Medium transitions - Drawers, modals (250ms) */
  medium: '250ms',
  /** Slow transitions - Page transitions (350ms) */
  slow: '350ms',
  /** Extra slow - Complex animations (500ms) */
  xSlow: '500ms',
} as const;

/**
 * Breakpoints
 *
 * Media query breakpoint values matching Tailwind's defaults.
 * Use for responsive design calculations.
 *
 * @example
 * ```tsx
 * import { breakpoints } from '@ainexsuite/ui/config/tokens';
 *
 * // In media queries
 * const mediaQuery = `(min-width: ${breakpoints.md})`;
 *
 * // For JavaScript logic
 * const isMobile = window.innerWidth < parseInt(breakpoints.sm);
 * ```
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Icon Sizes
 *
 * Standardized icon dimensions for consistent sizing.
 * Matches Lucide icon size conventions.
 */
export const iconSizes = {
  /** Extra small - 12px */
  xs: '0.75rem',
  /** Small - 16px */
  sm: '1rem',
  /** Medium - 20px (default) */
  md: '1.25rem',
  /** Large - 24px */
  lg: '1.5rem',
  /** Extra large - 32px */
  xl: '2rem',
  /** 2XL - 40px */
  '2xl': '2.5rem',
} as const;

/**
 * Avatar Sizes
 *
 * Preset sizes for user avatars and profile images.
 */
export const avatarSizes = {
  /** Tiny - 24px */
  xs: '1.5rem',
  /** Small - 32px */
  sm: '2rem',
  /** Medium - 40px */
  md: '2.5rem',
  /** Large - 48px */
  lg: '3rem',
  /** Extra large - 64px */
  xl: '4rem',
  /** 2XL - 80px */
  '2xl': '5rem',
} as const;

/**
 * Type Exports for TypeScript
 */
export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
export type Shadow = keyof typeof shadows;
export type ZIndex = keyof typeof zIndex;
export type Container = keyof typeof containers;
export type Breakpoint = keyof typeof breakpoints;
export type IconSize = keyof typeof iconSizes;
export type AvatarSize = keyof typeof avatarSizes;
