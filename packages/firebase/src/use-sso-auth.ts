'use client';

import { useEffect, useState } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from './client';

interface UseSSOAuthOptions {
  /** Callback when SSO completes (success or failure) */
  onComplete?: () => void;
}

/**
 * useSSOAuth Hook
 *
 * Handles Single Sign-On authentication when users switch between apps.
 * Checks for auth token in URL parameters, exchanges it for a Firebase session,
 * and cleans up the URL.
 *
 * Usage:
 * ```tsx
 * function MyApp() {
 *   const { isAuthenticating, authError } = useSSOAuth();
 *
 *   if (isAuthenticating) {
 *     return <LoadingScreen />;
 *   }
 *
 *   return <MainContent />;
 * }
 * ```
 *
 * @param options - Optional configuration including onComplete callback
 * @returns {object} - Authentication state and any errors
 */
export function useSSOAuth(options?: UseSSOAuthOptions) {
  const { onComplete } = options || {};

  // Check for auth token IMMEDIATELY on mount (synchronously)
  const hasAuthTokenOnMount = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).has('auth_token')
    : false;

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [hasAuthToken, setHasAuthToken] = useState(hasAuthTokenOnMount);

  useEffect(() => {
    const handleSSOAuth = async () => {
      // Only run in browser
      if (typeof window === 'undefined') return;

      // Get auth token from URL
      const urlParams = new URLSearchParams(window.location.search);
      const authToken = urlParams.get('auth_token');

      console.log('[SSO DEBUG] useSSOAuth - authToken present:', !!authToken);

      if (!authToken) {
        // No auth token, nothing to do
        setHasAuthToken(false);
        // Still call onComplete to signal we're done checking
        console.log('[SSO DEBUG] No auth token, calling onComplete');
        onComplete?.();
        return;
      }

      // Mark that we're processing an SSO auth token (redundant but ensures state consistency)
      setHasAuthToken(true);

      try {
        setIsAuthenticating(true);
        setAuthError(null);

        console.log('[SSO DEBUG] Calling signInWithCustomToken...');

        // Sign in with the custom token
        // This triggers onAuthStateChanged in AuthProvider, which will:
        // 1. Create the server-side session cookie
        // 2. Set the user state
        // 3. Mark ssoInProgress as false
        await signInWithCustomToken(auth, authToken);
        console.log('[SSO DEBUG] signInWithCustomToken SUCCESS');

        // Remove auth_token from URL without refreshing the page
        urlParams.delete('auth_token');
        const newUrl = window.location.pathname +
          (urlParams.toString() ? `?${urlParams.toString()}` : '') +
          window.location.hash;

        window.history.replaceState({}, '', newUrl);
        console.log('[SSO DEBUG] URL cleaned up, waiting for onAuthStateChanged to complete SSO');

        // Note: We don't call onComplete() here anymore.
        // AuthProvider's onAuthStateChanged will set ssoInProgress = false
        // once the user is fully authenticated and user state is set.

      } catch (error) {
        console.error('[SSO DEBUG] signInWithCustomToken FAILED:', error);
        setAuthError(error instanceof Error ? error.message : 'Authentication failed');

        // Still remove the token from URL even if auth failed
        urlParams.delete('auth_token');
        const newUrl = window.location.pathname +
          (urlParams.toString() ? `?${urlParams.toString()}` : '') +
          window.location.hash;

        window.history.replaceState({}, '', newUrl);

        // Signal completion on error so pages don't hang
        // AuthProvider's onAuthStateChanged will also catch this (no user)
        console.log('[SSO DEBUG] Calling onComplete due to error');
        onComplete?.();
      } finally {
        setIsAuthenticating(false);
      }
    };

    handleSSOAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount - onComplete should be stable

  return {
    isAuthenticating,
    authError,
    hasAuthToken,
  };
}
