'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

type SkeletonVariant = 'default' | 'compact';

export interface ListSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of skeleton items to display
   * @default 3
   */
  count?: number;

  /**
   * Visual variant of the skeleton
   * @default 'default'
   */
  variant?: SkeletonVariant;
}

/**
 * ListSkeleton Component
 *
 * Loading skeleton for lists with animated shimmer effect.
 * Provides visual feedback while content is loading.
 *
 * @example
 * ```tsx
 * // Default skeleton
 * <ListSkeleton count={5} />
 *
 * // Compact variant
 * <ListSkeleton count={10} variant="compact" />
 * ```
 */
export const ListSkeleton = React.forwardRef<HTMLDivElement, ListSkeletonProps>(
  (
    {
      count = 3,
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      default: 'h-20',
      compact: 'h-14',
    };

    return (
      <div ref={ref} className={cn('space-y-3', className)} {...props}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm',
              variantStyles[variant],
              'animate-pulse',
              'relative overflow-hidden'
            )}
          >
            {/* Shimmer overlay effect */}
            <div
              className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-foreground/10 to-transparent"
              style={{
                animation: 'shimmer 2s infinite',
              }}
            />

            {/* Content skeleton */}
            <div className={cn('flex items-center gap-3', variant === 'default' ? 'p-4' : 'p-3')}>
              {/* Icon placeholder */}
              <div className={cn(
                'rounded-full bg-foreground/10',
                variant === 'default' ? 'h-10 w-10' : 'h-8 w-8'
              )} />

              {/* Text placeholders */}
              <div className="flex-1 space-y-2">
                <div className={cn(
                  'rounded-full bg-foreground/10',
                  variant === 'default' ? 'h-4 w-3/4' : 'h-3 w-2/3'
                )} />
                {variant === 'default' && (
                  <div className="h-3 w-1/2 rounded-full bg-foreground/5" />
                )}
              </div>

              {/* Trailing placeholder */}
              <div className={cn(
                'rounded-full bg-foreground/10',
                variant === 'default' ? 'h-6 w-16' : 'h-5 w-12'
              )} />
            </div>
          </div>
        ))}
      </div>
    );
  }
);

ListSkeleton.displayName = 'ListSkeleton';

// Add shimmer animation to global styles if not already present
// This would typically be added to your global CSS file
const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
`;

// If you want to inject the styles dynamically (optional)
if (typeof document !== 'undefined' && !document.getElementById('list-skeleton-styles')) {
  const style = document.createElement('style');
  style.id = 'list-skeleton-styles';
  style.textContent = shimmerKeyframes;
  document.head.appendChild(style);
}
