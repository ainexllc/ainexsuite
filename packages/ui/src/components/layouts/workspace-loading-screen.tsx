'use client';

import { Loader2 } from 'lucide-react';

interface WorkspaceLoadingScreenProps {
  /**
   * Optional message to show below the spinner
   */
  message?: string;
}

/**
 * Standardized loading screen for all workspace pages.
 * Uses CSS variable --color-primary for the spinner color to match app theme.
 *
 * @example
 * ```tsx
 * if (isLoading) {
 *   return <WorkspaceLoadingScreen />;
 * }
 * ```
 */
export function WorkspaceLoadingScreen({ message = 'Loading...' }: WorkspaceLoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary,#8b5cf6)]" />
        {message && <p className="text-sm text-zinc-500">{message}</p>}
      </div>
    </div>
  );
}
