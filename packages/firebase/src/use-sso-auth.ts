'use client';

import { useEffect, useState } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from './client';

interface UseSSOAuthOptions {
  /** Callback when SSO completes (success or failure) */
  onComplete?: () => void;
}

/**
 * useSSOAuth Hook (DEPRECATED)
 *
 * This hook is no longer needed for cross-app SSO. The auth system now uses
 * shared session cookies (domain=.ainexspace.com) which are automatically
 * sent by the browser when navigating between subdomains.
 *
 * The AuthProvider handles session verification and Firebase Auth initialization
 * automatically via the shared cookie - no URL tokens required.
 *
 * This hook is kept for backward compatibility but is now a no-op.
 * It will be removed in a future version.
 *
 * @deprecated Use AuthProvider's built-in session handling instead
 * @param options - Optional configuration including onComplete callback
 * @returns {object} - Authentication state (always idle)
 */
export function useSSOAuth(options?: UseSSOAuthOptions) {
  const { onComplete } = options || {};

  // Legacy: Check for auth_token in URL (for backward compatibility during migration)
  const hasAuthTokenOnMount = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).has('auth_token')
    : false;

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [hasAuthToken, setHasAuthToken] = useState(hasAuthTokenOnMount);

  useEffect(() => {
    const handleSSOAuth = async () => {
      if (typeof window === 'undefined') return;

      // Check for legacy auth_token in URL (for backward compatibility)
      const urlParams = new URLSearchParams(window.location.search);
      const authToken = urlParams.get('auth_token');

      // If no auth_token, signal completion immediately
      // The new SSO flow uses shared cookies, no URL tokens needed
      if (!authToken) {
        setHasAuthToken(false);
        onComplete?.();
        return;
      }

      // Legacy path: Handle old-style URL tokens during migration period
      // This code path should rarely be hit after deployment
      setHasAuthToken(true);

      try {
        setIsAuthenticating(true);
        setAuthError(null);

        // Sign in with the custom token (legacy support)
        await signInWithCustomToken(auth, authToken);

        // Remove auth_token from URL
        urlParams.delete('auth_token');
        const newUrl = window.location.pathname +
          (urlParams.toString() ? `?${urlParams.toString()}` : '') +
          window.location.hash;

        window.history.replaceState({}, '', newUrl);

      } catch (error) {
        console.error('SSO: signInWithCustomToken FAILED:', error);
        setAuthError(error instanceof Error ? error.message : 'Authentication failed');

        // Remove token from URL even on failure
        urlParams.delete('auth_token');
        const newUrl = window.location.pathname +
          (urlParams.toString() ? `?${urlParams.toString()}` : '') +
          window.location.hash;

        window.history.replaceState({}, '', newUrl);
        onComplete?.();
      } finally {
        setIsAuthenticating(false);
      }
    };

    handleSSOAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isAuthenticating,
    authError,
    hasAuthToken,
  };
}
