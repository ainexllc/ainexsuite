'use client';

import { useEffect, useState } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from './client';

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
 * @returns {object} - Authentication state and any errors
 */
export function useSSOAuth() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const handleSSOAuth = async () => {
      // Only run in browser
      if (typeof window === 'undefined') return;

      // Get auth token from URL
      const urlParams = new URLSearchParams(window.location.search);
      const authToken = urlParams.get('auth_token');

      if (!authToken) {
        // No auth token, nothing to do
        return;
      }

      try {
        setIsAuthenticating(true);
        setAuthError(null);

        // Sign in with the custom token
        await signInWithCustomToken(auth, authToken);

        // Remove auth_token from URL without refreshing the page
        urlParams.delete('auth_token');
        const newUrl = window.location.pathname +
          (urlParams.toString() ? `?${urlParams.toString()}` : '') +
          window.location.hash;

        window.history.replaceState({}, '', newUrl);

      } catch (error) {
        console.error('SSO authentication failed:', error);
        setAuthError(error instanceof Error ? error.message : 'Authentication failed');

        // Still remove the token from URL even if auth failed
        urlParams.delete('auth_token');
        const newUrl = window.location.pathname +
          (urlParams.toString() ? `?${urlParams.toString()}` : '') +
          window.location.hash;

        window.history.replaceState({}, '', newUrl);
      } finally {
        setIsAuthenticating(false);
      }
    };

    handleSSOAuth();
  }, []); // Run only once on mount

  return {
    isAuthenticating,
    authError,
  };
}
