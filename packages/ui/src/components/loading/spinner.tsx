'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the spinner
   * @default 'md'
   */
  size?: SpinnerSize;

  /**
   * Color variant (uses CSS variables or custom color)
   * @default 'accent'
   */
  color?: 'accent' | 'primary' | 'ink' | 'white' | string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const colorStyles: Record<string, string> = {
  accent: 'text-accent-500',
  primary: 'text-primary-500',
  ink: 'text-ink-500',
  white: 'text-white',
};

/**
 * Spinner Component
 *
 * A simple animated spinner for loading states.
 * Uses Loader2 icon from lucide-react with consistent sizing and colors.
 *
 * @example
 * ```tsx
 * // Default spinner
 * <Spinner />
 *
 * // Large accent spinner
 * <Spinner size="lg" color="accent" />
 *
 * // Custom color
 * <Spinner color="text-orange-500" />
 * ```
 */
export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      size = 'md',
      color = 'accent',
      className,
      ...props
    },
    ref
  ) => {
    const colorClass = colorStyles[color] || color;

    return (
      <div
        ref={ref}
        role="status"
        aria-busy="true"
        aria-label="Loading"
        className={cn('inline-flex items-center justify-center', className)}
        {...props}
      >
        <Loader2
          className={cn(
            'animate-spin',
            sizeStyles[size],
            colorClass
          )}
        />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';
