'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { Spinner } from './spinner';

export interface PageLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional message to display
   */
  message?: string;

  /**
   * Show app logo above spinner
   * @default true
   */
  showLogo?: boolean;

  /**
   * Custom logo component or image URL
   */
  logo?: React.ReactNode | string;

  /**
   * Background style
   * @default 'gradient'
   */
  background?: 'gradient' | 'solid' | 'none';
}

/**
 * PageLoading Component
 *
 * Full-page loading screen for initial app/page loads.
 * Features glassmorphism background and optional app logo.
 *
 * @example
 * ```tsx
 * // Default loading screen
 * <PageLoading />
 *
 * // With custom message
 * <PageLoading message="Initializing workspace..." />
 *
 * // With custom logo
 * <PageLoading logo={<YourLogo />} />
 *
 * // With logo URL
 * <PageLoading logo="/logo.svg" />
 * ```
 */
export const PageLoading = React.forwardRef<HTMLDivElement, PageLoadingProps>(
  (
    {
      message = 'Loading...',
      showLogo = true,
      logo,
      background = 'gradient',
      className,
      ...props
    },
    ref
  ) => {
    const backgroundStyles = {
      gradient: 'bg-gradient-to-br from-surface-base via-surface-muted to-surface-base',
      solid: 'bg-surface-base',
      none: '',
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-busy="true"
        aria-live="polite"
        className={cn(
          'fixed inset-0 z-50 flex min-h-screen items-center justify-center',
          backgroundStyles[background],
          className
        )}
        {...props}
      >
        {/* Atmospheric background effects */}
        {background !== 'none' && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl" />
          </div>
        )}

        {/* Loading content */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Logo */}
          {showLogo && (
            <div className="mb-2">
              {typeof logo === 'string' ? (
                <img
                  src={logo}
                  alt="App logo"
                  className="h-16 w-auto animate-pulse"
                />
              ) : logo ? (
                <div className="animate-pulse">{logo}</div>
              ) : (
                // Default logo placeholder
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md">
                  <div className="h-8 w-8 rounded-lg bg-accent-500/50" />
                </div>
              )}
            </div>
          )}

          {/* Spinner and message */}
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-surface-elevated/60 px-8 py-6 shadow-lg backdrop-blur-md">
            <Spinner size="lg" color="accent" />
            {message && (
              <p className="text-sm font-medium text-ink-700">{message}</p>
            )}
          </div>
        </div>

        <span className="sr-only">{message}</span>
      </div>
    );
  }
);

PageLoading.displayName = 'PageLoading';
