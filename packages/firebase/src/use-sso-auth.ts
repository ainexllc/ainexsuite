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

        console.log('🔐 SSO: Signing in with custom token');

        // Sign in with the custom token
        const userCredential = await signInWithCustomToken(auth, authToken);
        console.log('✅ SSO: Client-side authentication successful');

        // Get ID token and create server-side session cookie
        console.log('🔐 SSO: Creating server-side session cookie');
        const idToken = await userCredential.user.getIdToken();

        const sessionResponse = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });

        if (!sessionResponse.ok) {
          console.error('❌ SSO: Failed to create session cookie');
          throw new Error('Failed to create session cookie');
        }

        console.log('✅ SSO: Server-side session cookie created');

        // Remove auth_token from URL without refreshing the page
        urlParams.delete('auth_token');
        const newUrl = window.location.pathname +
          (urlParams.toString() ? `?${urlParams.toString()}` : '') +
          window.location.hash;

        window.history.replaceState({}, '', newUrl);
        console.log('✅ SSO: Authentication complete');

      } catch (error) {
        console.error('❌ SSO: Authentication failed:', error);
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
