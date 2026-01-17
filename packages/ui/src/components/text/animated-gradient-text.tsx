'use client';

import { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/utils';

export interface AnimatedGradientTextProps
  extends ComponentPropsWithoutRef<'span'> {
  /** Animation speed multiplier (default: 1) */
  speed?: number;
  /** Starting gradient color */
  colorFrom?: string;
  /** Middle/ending gradient color */
  colorTo?: string;
}

/**
 * AnimatedGradientText - Text with animated gradient background
 *
 * Creates a text element with a smoothly animated gradient that
 * shifts colors from left to right continuously.
 *
 * @example
 * ```tsx
 * <AnimatedGradientText colorFrom="#ffaa40" colorTo="#9c40ff">
 *   Magic Text
 * </AnimatedGradientText>
 * ```
 */
export function AnimatedGradientText({
  children,
  className,
  speed = 1,
  colorFrom = '#ffaa40',
  colorTo = '#9c40ff',
  ...props
}: AnimatedGradientTextProps) {
  return (
    <span
      style={
        {
          '--bg-size': `${speed * 300}%`,
          '--color-from': colorFrom,
          '--color-to': colorTo,
        } as React.CSSProperties
      }
      className={cn(
        'animate-gradient inline bg-gradient-to-r from-[var(--color-from)] via-[var(--color-to)] to-[var(--color-from)] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
