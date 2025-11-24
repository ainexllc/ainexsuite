'use client';

import { useSSOAuth } from './use-sso-auth';

/**
 * SSOHandler Component
 *
 * Client component that handles SSO authentication when users switch apps.
 * Add this to your root layout to enable automatic sign-in via auth tokens.
 *
 * Usage in layout.tsx:
 * ```tsx
 * import { SSOHandler } from '@ainexsuite/firebase';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <SSOHandler />
 *         <AuthProvider>{children}</AuthProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function SSOHandler() {
  const { isAuthenticating, authError } = useSSOAuth();

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
