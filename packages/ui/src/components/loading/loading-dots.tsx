'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

export type LoadingDotsSize = 'sm' | 'md' | 'lg';

export interface LoadingDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the dots
   * @default 'md'
   */
  size?: LoadingDotsSize;

  /**
   * Color of the dots (uses CSS variables or custom color)
   * @default 'accent'
   */
  color?: 'accent' | 'primary' | 'ink' | 'white' | string;
}

const sizeStyles: Record<LoadingDotsSize, string> = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
  lg: 'h-3 w-3',
};

const gapStyles: Record<LoadingDotsSize, string> = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-2',
};

const colorStyles: Record<string, string> = {
  accent: 'bg-accent-500',
  primary: 'bg-primary-500',
  ink: 'bg-ink-500',
  white: 'bg-white',
};

/**
 * LoadingDots Component
 *
 * Three animated bouncing dots for inline loading states.
 * Lightweight alternative to spinner for subtle loading indicators.
 *
 * @example
 * ```tsx
 * // Default dots
 * <LoadingDots />
 *
 * // Large white dots
 * <LoadingDots size="lg" color="white" />
 *
 * // Inline with text
 * <span>Loading<LoadingDots size="sm" /></span>
 * ```
 */
export const LoadingDots = React.forwardRef<HTMLDivElement, LoadingDotsProps>(
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
        className={cn('inline-flex items-center', gapStyles[size], className)}
        {...props}
      >
        <span
          className={cn(
            'rounded-full',
            sizeStyles[size],
            colorClass,
            'animate-bounce [animation-delay:-0.3s]'
          )}
        />
        <span
          className={cn(
            'rounded-full',
            sizeStyles[size],
            colorClass,
            'animate-bounce [animation-delay:-0.15s]'
          )}
        />
        <span
          className={cn(
            'rounded-full',
            sizeStyles[size],
            colorClass,
            'animate-bounce'
          )}
        />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

LoadingDots.displayName = 'LoadingDots';
