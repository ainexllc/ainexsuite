'use client';

import { useSSOAuth } from './use-sso-auth';

export interface SSOHandlerProps {
  /** Callback when SSO completes (success or failure) - used by AuthProvider */
  onComplete?: () => void;
}

/**
 * SSOHandler Component
 *
 * Client component that handles SSO authentication when users switch apps.
 * Should be placed INSIDE AuthProvider for proper coordination.
 *
 * Usage in app-providers.tsx:
 * ```tsx
 * import { SSOHandler } from '@ainexsuite/firebase';
 *
 * export function AppProviders({ children }) {
 *   return (
 *     <AuthProvider>
 *       <SSOHandler />
 *       {children}
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export function SSOHandler({ onComplete }: SSOHandlerProps = {}) {
  const { isAuthenticating, authError } = useSSOAuth({ onComplete });

  // Optional: Show a loading indicator or error message
  if (isAuthenticating) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3 px-6 py-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-white/10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          <p className="text-sm font-medium text-ink-700 dark:text-white/90">
            Signing you in...
          </p>
        </div>
      </div>
    );
  }

  // Show error if authentication failed (optional)
  if (authError) {
    console.error('SSO Authentication Error:', authError);
    // Could show a toast notification here
  }

  // Render nothing when not authenticating
  return null;
}
