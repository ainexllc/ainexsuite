'use client';

import { Check } from 'lucide-react';
import type { LoginStatus } from '../utils/cross-app-navigation';

export interface AppLoginStatusProps {
  status: LoginStatus;
  /** Size of the indicator */
  size?: 'sm' | 'md';
  /** Custom class name */
  className?: string;
}

/**
 * Visual indicator for app login status
 * Shows a green checkmark for logged in, gray dot for logged out,
 * and animated pulse for checking status
 */
export function AppLoginStatus({ status, size = 'sm', className = '' }: AppLoginStatusProps) {
  const sizeClasses = size === 'sm'
    ? 'h-2.5 w-2.5'
    : 'h-3 w-3';

  const checkSizeClasses = size === 'sm'
    ? 'h-1.5 w-1.5'
    : 'h-2 w-2';

  if (status === 'checking') {
    return (
      <div
        className={`${sizeClasses} rounded-full bg-zinc-600 animate-pulse ${className}`}
        title="Checking login status..."
      />
    );
  }

  if (status === 'logged-in') {
    return (
      <div
        className={`${sizeClasses} rounded-full bg-emerald-500 flex items-center justify-center ${className}`}
        title="Logged in"
      >
        <Check className={`${checkSizeClasses} text-foreground`} strokeWidth={3} />
      </div>
    );
  }

  if (status === 'logged-out') {
    return (
      <div
        className={`${sizeClasses} rounded-full bg-zinc-600 ${className}`}
        title="Not logged in"
      />
    );
  }

  // Error or unknown - show nothing or a subtle indicator
  return null;
}

/**
 * Positioned login status indicator that can be placed on top of app icons
 */
export function AppLoginStatusBadge({ status, className = '' }: Omit<AppLoginStatusProps, 'size'>) {
  if (status === 'checking') {
    return (
      <div
        className={`absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-zinc-700 animate-pulse ring-2 ring-black/50 ${className}`}
        title="Checking login status..."
      />
    );
  }

  if (status === 'logged-in') {
    return (
      <div
        className={`absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background/50 flex items-center justify-center ${className}`}
        title="Logged in"
      >
        <Check className="h-2 w-2 text-foreground" strokeWidth={3} />
      </div>
    );
  }

  if (status === 'logged-out') {
    return (
      <div
        className={`absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-zinc-600 ring-2 ring-background/50 ${className}`}
        title="Not logged in"
      />
    );
  }

  return null;
}
