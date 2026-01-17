/**
 * Component Variants - AINexSpace Design System
 *
 * Shared variant definitions using class-variance-authority (cva).
 * These variants ensure consistent component styling across all apps.
 *
 * Each variant definition includes:
 * - Base classes (applied to all variants)
 * - Variant options (different styles per variant)
 * - Default variants (fallback when no variant specified)
 * - Compound variants (combinations of variants)
 *
 * @module @ainexsuite/ui/config/component-variants
 */

import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Card Variants
 *
 * Consistent card component styling with multiple variants.
 *
 * @example
 * ```tsx
 * import { cardVariants } from '@ainexsuite/ui/config/component-variants';
 * import { cn } from '@ainexsuite/ui';
 *
 * // Use with cva
 * <div className={cardVariants({ variant: 'elevated', padding: 'lg' })} />
 *
 * // Export the type for props
 * export interface CardProps extends VariantProps<typeof cardVariants> {}
 * ```
 */
export const cardVariants = cva(
  // Base classes - applied to all cards
  'rounded-xl border transition-all duration-200',
  {
    variants: {
      /** Visual variant of the card */
      variant: {
        default: 'bg-[rgb(var(--color-surface-card))] border-[rgb(var(--color-outline-subtle))] shadow-sm',
        elevated: 'bg-[rgb(var(--color-surface-elevated))] border-[rgb(var(--color-outline-subtle))] shadow-lg',
        muted: 'bg-[rgb(var(--color-surface-muted))] border-[rgb(var(--color-outline-subtle))]',
        glass: 'bg-white/8 backdrop-blur-lg border-white/15 shadow-lg',
        outline: 'bg-transparent border-[rgb(var(--color-outline-base))]',
      },
      /** Padding size */
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-5',
        lg: 'p-6',
        xl: 'p-8',
      },
      /** Interactive hover state */
      interactive: {
        true: 'hover:bg-[rgb(var(--color-surface-hover))] hover:border-[rgb(var(--color-outline-base))] hover:shadow-xl cursor-pointer',
        false: '',
      },
      /** Border radius override */
      rounded: {
        default: '',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      interactive: false,
      rounded: 'default',
    },
  }
);

export type CardVariantProps = VariantProps<typeof cardVariants>;

/**
 * Button Variants
 *
 * Extended button variants that build upon the existing Button component.
 * Provides more options and consistent styling.
 *
 * @example
 * ```tsx
 * import { buttonVariants } from '@ainexsuite/ui/config/component-variants';
 *
 * <button className={buttonVariants({ variant: 'primary', size: 'lg' })} />
 * ```
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-accent-500))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      /** Visual variant */
      variant: {
        primary: 'bg-[rgb(var(--color-accent-500))] text-white shadow-sm hover:bg-[rgb(var(--color-accent-600))]',
        secondary: 'border border-[rgb(var(--color-outline-subtle))] bg-[rgb(var(--color-surface-elevated))] text-[rgb(var(--color-ink-900))] hover:bg-[rgb(var(--color-surface-muted))]',
        ghost: 'text-[rgb(var(--color-ink-900))] hover:bg-[rgb(var(--color-surface-elevated))]',
        outline: 'border-2 border-[rgb(var(--color-accent-500))] text-[rgb(var(--color-accent-500))] hover:bg-[rgb(var(--color-accent-500))] hover:text-white',
        danger: 'bg-[rgb(var(--color-danger))] text-white shadow-sm hover:opacity-90',
        success: 'bg-[rgb(var(--color-success))] text-white shadow-sm hover:opacity-90',
        link: 'text-[rgb(var(--color-accent-500))] hover:text-[rgb(var(--color-accent-600))] underline-offset-4 hover:underline',
      },
      /** Size variant */
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10 p-0',
      },
      /** Full width option */
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

/**
 * Input Variants
 *
 * Form input styling with consistent variants.
 *
 * @example
 * ```tsx
 * import { inputVariants } from '@ainexsuite/ui/config/component-variants';
 *
 * <input className={inputVariants({ size: 'lg', state: 'error' })} />
 * ```
 */
export const inputVariants = cva(
  'w-full rounded-xl border bg-[rgb(var(--color-surface-muted))]/50 text-[rgb(var(--color-ink-900))] placeholder:text-[rgb(var(--color-ink-400))] focus:outline-none transition-all duration-200',
  {
    variants: {
      /** Size variant */
      size: {
        sm: 'px-3 py-2 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-5 py-3 text-base',
      },
      /** Validation state */
      state: {
        default: 'border-[rgb(var(--color-outline-subtle))] focus:border-[rgb(var(--color-accent-500))] focus:ring-2 focus:ring-[rgb(var(--color-accent-500))]/20',
        error: 'border-[rgb(var(--color-danger))] focus:border-[rgb(var(--color-danger))] focus:ring-2 focus:ring-[rgb(var(--color-danger))]/20',
        success: 'border-[rgb(var(--color-success))] focus:border-[rgb(var(--color-success))] focus:ring-2 focus:ring-[rgb(var(--color-success))]/20',
        disabled: 'opacity-50 cursor-not-allowed bg-[rgb(var(--color-surface-muted))]',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
    },
  }
);

export type InputVariantProps = VariantProps<typeof inputVariants>;

/**
 * Badge Variants
 *
 * Small labels and status indicators.
 *
 * @example
 * ```tsx
 * import { badgeVariants } from '@ainexsuite/ui/config/component-variants';
 *
 * <span className={badgeVariants({ variant: 'success' })}>Active</span>
 * ```
 */
export const badgeVariants = cva(
  'inline-flex items-center rounded-full font-semibold',
  {
    variants: {
      /** Visual variant */
      variant: {
        primary: 'bg-[rgb(var(--color-accent-500))]/10 text-[rgb(var(--color-accent-500))] border border-[rgb(var(--color-accent-500))]/20',
        secondary: 'bg-[rgb(var(--color-surface-muted))] text-[rgb(var(--color-ink-700))] border border-[rgb(var(--color-outline-subtle))]',
        success: 'bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))] border border-[rgb(var(--color-success))]/20',
        warning: 'bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))] border border-[rgb(var(--color-warning))]/20',
        danger: 'bg-[rgb(var(--color-danger))]/10 text-[rgb(var(--color-danger))] border border-[rgb(var(--color-danger))]/20',
        outline: 'border border-[rgb(var(--color-outline-base))] text-[rgb(var(--color-ink-700))]',
      },
      /** Size variant */
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type BadgeVariantProps = VariantProps<typeof badgeVariants>;

/**
 * Avatar Variants
 *
 * User profile images and placeholder avatars.
 *
 * @example
 * ```tsx
 * import { avatarVariants } from '@ainexsuite/ui/config/component-variants';
 *
 * <div className={avatarVariants({ size: 'lg' })}>
 *   <img src={avatarUrl} alt="User" />
 * </div>
 * ```
 */
export const avatarVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[rgb(var(--color-surface-muted))]',
  {
    variants: {
      /** Size variant */
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-20 w-20 text-2xl',
      },
      /** Border option */
      border: {
        true: 'ring-2 ring-[rgb(var(--color-outline-subtle))]',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      border: false,
    },
  }
);

export type AvatarVariantProps = VariantProps<typeof avatarVariants>;

/**
 * Alert Variants
 *
 * Notification and message boxes.
 *
 * @example
 * ```tsx
 * import { alertVariants } from '@ainexsuite/ui/config/component-variants';
 *
 * <div className={alertVariants({ variant: 'error' })}>
 *   Error message here
 * </div>
 * ```
 */
export const alertVariants = cva(
  'rounded-xl border p-4',
  {
    variants: {
      /** Visual variant */
      variant: {
        info: 'bg-[rgb(var(--color-accent-500))]/10 border-[rgb(var(--color-accent-500))]/20 text-[rgb(var(--color-accent-500))]',
        success: 'bg-[rgb(var(--color-success))]/10 border-[rgb(var(--color-success))]/20 text-[rgb(var(--color-success))]',
        warning: 'bg-[rgb(var(--color-warning))]/10 border-[rgb(var(--color-warning))]/20 text-[rgb(var(--color-warning))]',
        error: 'bg-[rgb(var(--color-danger))]/10 border-[rgb(var(--color-danger))]/20 text-[rgb(var(--color-danger))]',
        neutral: 'bg-[rgb(var(--color-surface-muted))] border-[rgb(var(--color-outline-subtle))] text-[rgb(var(--color-ink-900))]',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

export type AlertVariantProps = VariantProps<typeof alertVariants>;

/**
 * Skeleton Variants
 *
 * Loading state placeholders.
 *
 * @example
 * ```tsx
 * import { skeletonVariants } from '@ainexsuite/ui/config/component-variants';
 *
 * <div className={skeletonVariants({ variant: 'text' })} />
 * ```
 */
export const skeletonVariants = cva(
  'animate-pulse bg-[rgb(var(--color-surface-muted))]',
  {
    variants: {
      /** Shape variant */
      variant: {
        text: 'h-4 rounded',
        avatar: 'rounded-full',
        card: 'rounded-xl',
        button: 'h-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'text',
    },
  }
);

export type SkeletonVariantProps = VariantProps<typeof skeletonVariants>;

/**
 * Divider Variants
 *
 * Horizontal and vertical dividers.
 *
 * @example
 * ```tsx
 * import { dividerVariants } from '@ainexsuite/ui/config/component-variants';
 *
 * <div className={dividerVariants({ orientation: 'horizontal' })} />
 * ```
 */
export const dividerVariants = cva(
  'bg-[rgb(var(--color-outline-subtle))]',
  {
    variants: {
      /** Orientation */
      orientation: {
        horizontal: 'h-px w-full',
        vertical: 'w-px h-full',
      },
      /** Spacing */
      spacing: {
        none: '',
        sm: 'my-2',
        md: 'my-4',
        lg: 'my-6',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
      spacing: 'md',
    },
    compoundVariants: [
      {
        orientation: 'vertical',
        spacing: 'sm',
        className: 'mx-2 my-0',
      },
      {
        orientation: 'vertical',
        spacing: 'md',
        className: 'mx-4 my-0',
      },
      {
        orientation: 'vertical',
        spacing: 'lg',
        className: 'mx-6 my-0',
      },
    ],
  }
);

export type DividerVariantProps = VariantProps<typeof dividerVariants>;

/**
 * Tooltip Variants
 *
 * Hover tooltip styling.
 *
 * @example
 * ```tsx
 * import { tooltipVariants } from '@ainexsuite/ui/config/component-variants';
 *
 * <div className={tooltipVariants({ size: 'sm' })}>
 *   Tooltip content
 * </div>
 * ```
 */
export const tooltipVariants = cva(
  'absolute z-50 rounded-lg bg-[rgb(var(--color-surface-overlay))] px-3 py-1.5 text-xs text-[rgb(var(--color-ink-900))] shadow-lg border border-[rgb(var(--color-outline-subtle))] backdrop-blur-sm',
  {
    variants: {
      /** Size variant */
      size: {
        sm: 'max-w-[200px]',
        md: 'max-w-[300px]',
        lg: 'max-w-[400px]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export type TooltipVariantProps = VariantProps<typeof tooltipVariants>;

/**
 * Spinner Variants
 *
 * Loading spinner animations.
 *
 * @example
 * ```tsx
 * import { spinnerVariants } from '@ainexsuite/ui/config/component-variants';
 *
 * <div className={spinnerVariants({ size: 'md', variant: 'primary' })} />
 * ```
 */
export const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      /** Size variant */
      size: {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      /** Color variant */
      variant: {
        primary: 'text-[rgb(var(--color-accent-500))]',
        secondary: 'text-[rgb(var(--color-ink-500))]',
        white: 'text-white',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  }
);

export type SpinnerVariantProps = VariantProps<typeof spinnerVariants>;
