'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { Spinner, type SpinnerSize } from './spinner';

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the overlay is visible
   */
  isLoading: boolean;

  /**
   * Optional message to display below the spinner
   */
  message?: string;

  /**
   * Enable backdrop blur effect
   * @default true
   */
  blur?: boolean;

  /**
   * Cover the full screen instead of parent container
   * @default false
   */
  fullScreen?: boolean;

  /**
   * Size of the spinner
   * @default 'lg'
   */
  spinnerSize?: SpinnerSize;

  /**
   * Color of the spinner
   * @default 'accent'
   */
  spinnerColor?: string;
}

/**
 * LoadingOverlay Component
 *
 * A full overlay with spinner and optional message.
 * Uses glassmorphism backdrop with optional blur.
 *
 * @example
 * ```tsx
 * // Basic overlay
 * <LoadingOverlay isLoading={true} />
 *
 * // With message
 * <LoadingOverlay isLoading={true} message="Processing..." />
 *
 * // Full screen without blur
 * <LoadingOverlay isLoading={true} fullScreen blur={false} />
 * ```
 */
export const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  (
    {
      isLoading,
      message,
      blur = true,
      fullScreen = false,
      spinnerSize = 'lg',
      spinnerColor = 'accent',
      className,
      ...props
    },
    ref
  ) => {
    if (!isLoading) return null;

    return (
      <div
        ref={ref}
        role="alert"
        aria-busy="true"
        aria-live="polite"
        className={cn(
          'z-50 flex items-center justify-center',
          fullScreen ? 'fixed inset-0' : 'absolute inset-0',
          blur && 'backdrop-blur-sm',
          'bg-surface-overlay/50',
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-surface-elevated/80 px-8 py-6 shadow-lg backdrop-blur-md">
          <Spinner size={spinnerSize} color={spinnerColor} />
          {message && (
            <p className="text-sm font-medium text-ink-700">{message}</p>
          )}
        </div>
      </div>
    );
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';
