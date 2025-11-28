'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Spinner } from '../loading/spinner';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-foreground hover:bg-primary-dark shadow-lg shadow-primary/20',
        secondary: 'bg-secondary text-foreground hover:bg-secondary-dark shadow-lg shadow-secondary/20',
        outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-foreground',
        ghost: 'hover:bg-surface-elevated text-text-primary',
        danger: 'bg-red-500 text-foreground hover:bg-red-600',
        accent: 'bg-accent-500 text-foreground hover:bg-accent-600 shadow-lg shadow-accent-500/20',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Whether the button is in loading state
   */
  loading?: boolean;

  /**
   * Text to show when loading (overrides children)
   */
  loadingText?: string;

  /**
   * Position of the spinner relative to text
   * @default 'left'
   */
  spinnerPosition?: 'left' | 'right';

  /**
   * Custom spinner size (overrides default based on button size)
   */
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl';
}

const spinnerSizeMap = {
  sm: 'sm' as const,
  md: 'sm' as const,
  lg: 'md' as const,
};

/**
 * LoadingButton Component
 *
 * Button component with built-in loading state.
 * Shows spinner and optionally different text when loading.
 * Automatically disables interaction while loading.
 *
 * @example
 * ```tsx
 * // Basic loading button
 * <LoadingButton loading={isSubmitting}>
 *   Submit
 * </LoadingButton>
 *
 * // With loading text
 * <LoadingButton
 *   loading={isSaving}
 *   loadingText="Saving..."
 * >
 *   Save Changes
 * </LoadingButton>
 *
 * // Spinner on right
 * <LoadingButton
 *   loading={isProcessing}
 *   spinnerPosition="right"
 * >
 *   Process
 * </LoadingButton>
 *
 * // Accent variant with custom spinner
 * <LoadingButton
 *   variant="accent"
 *   loading={isDeleting}
 *   spinnerSize="lg"
 * >
 *   Delete
 * </LoadingButton>
 * ```
 */
export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      variant,
      size = 'md',
      loading = false,
      loadingText,
      spinnerPosition = 'left',
      spinnerSize,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const finalSpinnerSize = spinnerSize || spinnerSizeMap[size || 'md'];
    const isDisabled = disabled || loading;
    const displayText = loading && loadingText ? loadingText : children;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(buttonVariants({ variant, size }), className)}
        aria-busy={loading}
        {...props}
      >
        {loading && spinnerPosition === 'left' && (
          <Spinner size={finalSpinnerSize} color="text-foreground" />
        )}
        {displayText}
        {loading && spinnerPosition === 'right' && (
          <Spinner size={finalSpinnerSize} color="text-foreground" />
        )}
      </button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';
