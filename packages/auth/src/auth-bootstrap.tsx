'use client';

import { useEffect, useState } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@ainexsuite/firebase';
import { useAuth } from './context';

/**
 * Get cross-app session from localStorage (dev only)
 * This is a copy of the utility from @ainexsuite/ui to avoid circular dependencies
 */
function getDevCrossAppSession(): string | null {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return null;
  }

  try {
    const session = localStorage.getItem('__cross_app_session');
    const timestamp = localStorage.getItem('__cross_app_timestamp');

    if (!session || !timestamp) {
      return null;
    }

    // Check if session is less than 5 minutes old
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > 5 * 60 * 1000) {
      // Clean up expired session
      localStorage.removeItem('__cross_app_session');
      localStorage.removeItem('__cross_app_timestamp');
      return null;
    }

    return session;
  } catch (error) {
    return null;
  }
}

/**
 * Clear cross-app session from localStorage
 */
function clearDevCrossAppSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('__cross_app_session');
    localStorage.removeItem('__cross_app_timestamp');
  } catch (error) {
    // Silently fail
  }
}

/**
 * AuthBootstrap Component
 *
 * Silently authenticates users from __session cookie on page load.
 *
 * Flow:
 * 1. Check if user is already authenticated
 * 2. Call /api/auth/custom-token to get a custom token (server checks httpOnly cookie)
 * 3. Sign in with custom token (which triggers onAuthStateChanged)
 * 4. AuthContext hydrates with user data from existing session (skips creating new session)
 *
 * NOTE: The __session cookie is httpOnly, so we can't check for it client-side.
 * Instead, we call the custom-token endpoint which reads the cookie server-side.
 * If no cookie exists, the endpoint returns 401 and we proceed to normal auth flow.
 *
 * Usage:
 * Add to AuthProvider children:
 * <AuthProvider>
 *   <AuthBootstrap />
 *   {children}
 * </AuthProvider>
 */
export function AuthBootstrap() {
  const { firebaseUser, setIsBootstrapping, setBootstrapStatus, ssoInProgress } = useAuth();
  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    // Skip if already authenticated, currently bootstrapping, or SSO in progress
    if (firebaseUser || bootstrapping || bootstrapped || ssoInProgress) {
      return;
    }

    // In development, check for cross-app session from localStorage first
    if (process.env.NODE_ENV === 'development') {
      const crossAppSession = getDevCrossAppSession();
      if (crossAppSession) {
        console.log('[AuthBootstrap] Found dev cross-app session, bootstrapping...');
        // Clear the cross-app session after reading it
        clearDevCrossAppSession();

        // Bootstrap from the dev session
        setBootstrapping(true);
        setIsBootstrapping(true);
        setBootstrapStatus('running');

        bootstrapFromDevSession(crossAppSession)
          .then(() => {
            console.log('[AuthBootstrap] Dev session bootstrap succeeded');
            setBootstrapped(true);
            setBootstrapStatus('complete');
          })
          .catch(() => {
            setIsBootstrapping(false);
            setBootstrapped(true);
            setBootstrapStatus('failed');
          })
          .finally(() => {
            setBootstrapping(false);
          });
        return;
      }
    }

    // Try to bootstrap from httpOnly session cookie
    // The server will check for the cookie - we can't read it client-side
    setBootstrapping(true);
    setIsBootstrapping(true);
    setBootstrapStatus('running');

    bootstrapFromHttpOnlyCookie()
      .then(() => {
        console.log('[AuthBootstrap] Session bootstrap succeeded');
        setBootstrapped(true);
        setBootstrapStatus('complete');
      })
      .catch(() => {
        // No session cookie or invalid - proceed to normal auth flow (this is normal for new visitors)
        setIsBootstrapping(false);
        setBootstrapped(true);
        setBootstrapStatus('complete'); // Not failed, just no session to bootstrap
      })
      .finally(() => {
        setBootstrapping(false);
      });
  }, [firebaseUser, bootstrapping, bootstrapped, ssoInProgress, setIsBootstrapping, setBootstrapStatus]);

  // Render nothing - this is a passive component
  return null;
}

/**
 * Bootstrap from httpOnly session cookie via server endpoint
 * The server reads the cookie and returns a custom token
 */
async function bootstrapFromHttpOnlyCookie(): Promise<void> {
  console.log('[AuthBootstrap] Attempting to bootstrap from httpOnly cookie...');
  console.log('[AuthBootstrap] Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'SSR');

  const response = await fetch('/api/auth/custom-token', {
    method: 'POST',
    credentials: 'include', // Include httpOnly cookies
  });

  console.log('[AuthBootstrap] custom-token response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.log('[AuthBootstrap] custom-token error:', errorData.error || response.status);
    throw new Error(errorData.error || `No valid session: ${response.status}`);
  }

  const { customToken } = await response.json();
  console.log('[AuthBootstrap] Got custom token, signing in...');

  // Sign in with custom token
  await signInWithCustomToken(auth, customToken);
  console.log('[AuthBootstrap] Sign in with custom token complete');
}

/**
 * Bootstrap from dev cross-app session (localStorage)
 * This is for development only where cookies don't work across ports
 */
async function bootstrapFromDevSession(sessionCookie: string): Promise<void> {
  const response = await fetch('/api/auth/custom-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionCookie }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get custom token: ${response.status}`);
  }

  const { customToken } = await response.json();

  // Sign in with custom token
  await signInWithCustomToken(auth, customToken);
}
