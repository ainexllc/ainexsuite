'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

export type SkeletonVariant = 'text' | 'circle' | 'rect' | 'avatar' | 'card';

export interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Type of skeleton to render
   * @default 'rect'
   */
  variant?: SkeletonVariant;

  /**
   * Width of the skeleton (CSS value or number for pixels)
   */
  width?: string | number;

  /**
   * Height of the skeleton (CSS value or number for pixels)
   */
  height?: string | number;

  /**
   * Enable animated shimmer effect
   * @default true
   */
  animate?: boolean;

  /**
   * Number of skeleton lines (for text variant)
   * @default 1
   */
  lines?: number;

  /**
   * Spacing between lines (for text variant with multiple lines)
   * @default '0.5rem'
   */
  lineSpacing?: string;
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'h-4 rounded-full',
  circle: 'rounded-full aspect-square',
  rect: 'rounded-lg',
  avatar: 'rounded-full aspect-square',
  card: 'rounded-2xl',
};

const variantDefaults: Record<SkeletonVariant, { width?: string; height?: string }> = {
  text: { height: '1rem' },
  circle: { width: '2.5rem', height: '2.5rem' },
  rect: { width: '100%', height: '5rem' },
  avatar: { width: '3rem', height: '3rem' },
  card: { width: '100%', height: '12rem' },
};

/**
 * LoadingSkeleton Component
 *
 * Versatile skeleton loader for content placeholders.
 * Supports different shapes with animated shimmer effect.
 *
 * @example
 * ```tsx
 * // Text placeholder
 * <LoadingSkeleton variant="text" width="80%" />
 *
 * // Multiple text lines
 * <LoadingSkeleton variant="text" lines={3} />
 *
 * // Avatar placeholder
 * <LoadingSkeleton variant="avatar" />
 *
 * // Circle badge
 * <LoadingSkeleton variant="circle" width={48} height={48} />
 *
 * // Card placeholder
 * <LoadingSkeleton variant="card" height="200px" />
 *
 * // Custom rectangle
 * <LoadingSkeleton variant="rect" width="300px" height="150px" />
 *
 * // Without animation
 * <LoadingSkeleton variant="text" animate={false} />
 * ```
 */
export const LoadingSkeleton = React.forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  (
    {
      variant = 'rect',
      width,
      height,
      animate = true,
      lines = 1,
      lineSpacing = '0.5rem',
      className,
      style,
      ...props
    },
    ref
  ) => {
    const defaults = variantDefaults[variant];
    const finalWidth = width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : defaults.width;
    const finalHeight = height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : defaults.height;

    const baseStyles = cn(
      'bg-white/10 backdrop-blur-sm',
      animate && 'animate-pulse',
      'relative overflow-hidden',
      variantStyles[variant],
      className
    );

    // For text variant with multiple lines
    if (variant === 'text' && lines > 1) {
      return (
        <div
          ref={ref}
          role="status"
          aria-busy="true"
          aria-label="Loading"
          className={cn('space-y-2', className)}
          style={{ gap: lineSpacing, ...style }}
          {...props}
        >
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={baseStyles}
              style={{
                width: index === lines - 1 ? `${60 + Math.random() * 20}%` : finalWidth,
                height: finalHeight,
              }}
            >
              {animate && (
                <div
                  className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  style={{
                    animation: 'shimmer 2s infinite',
                  }}
                />
              )}
            </div>
          ))}
          <span className="sr-only">Loading...</span>
        </div>
      );
    }

    // Single skeleton element
    return (
      <div
        ref={ref}
        role="status"
        aria-busy="true"
        aria-label="Loading"
        className={baseStyles}
        style={{
          width: finalWidth,
          height: finalHeight,
          ...style,
        }}
        {...props}
      >
        {animate && (
          <div
            className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{
              animation: 'shimmer 2s infinite',
            }}
          />
        )}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Add shimmer animation to global styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('loading-skeleton-styles')) {
  const style = document.createElement('style');
  style.id = 'loading-skeleton-styles';
  style.textContent = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
`;
  document.head.appendChild(style);
}
