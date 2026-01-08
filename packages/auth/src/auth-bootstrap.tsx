'use client';

import { useEffect, useState } from 'react';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { auth } from '@ainexsuite/firebase';
import { useAuth } from './context';
import { getAuthHubUrl, isAuthHub } from './utils/sso-protocol';

/**
 * Fast bootstrap response type
 */
interface FastBootstrapResponse {
  authenticated: boolean;
  sessionCookie?: string;
  customToken?: string;
  user?: Record<string, unknown>;
  devMode?: boolean;
  source?: string;
}

/**
 * Unified fast bootstrap function
 * Makes a single API call to get all auth data needed
 * Validates with Auth Hub in dev mode automatically
 */
async function fastBootstrap(sessionCookie?: string): Promise<FastBootstrapResponse> {
  const isDev = process.env.NODE_ENV === 'development';

  // In dev mode (non-Auth Hub), check with Auth Hub first for cross-app logout detection
  if (isDev && !isAuthHub()) {
    const authHubUrl = getAuthHubUrl();
    try {
      const response = await fetch(`${authHubUrl}/api/auth/fast-bootstrap`, {
        method: 'POST',
        headers: sessionCookie ? { 'Content-Type': 'application/json' } : {},
        body: sessionCookie ? JSON.stringify({ sessionCookie }) : undefined,
      });

      if (response.ok) {
        const data = await response.json();
        return data as FastBootstrapResponse;
      }

      // Auth Hub returned error - not authenticated
      return { authenticated: false };
    } catch {
      // Auth Hub unavailable - fall back to local endpoint
    }
  }

  // Call local fast-bootstrap endpoint
  const response = await fetch('/api/auth/fast-bootstrap', {
    method: 'POST',
    credentials: 'include',
    headers: sessionCookie ? { 'Content-Type': 'application/json' } : {},
    body: sessionCookie ? JSON.stringify({ sessionCookie }) : undefined,
  });

  if (!response.ok) {
    return { authenticated: false };
  }

  return response.json();
}

/**
 * Get cross-app session from localStorage (dev only)
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

    // Check if session is less than 8 hours old
    const DEV_SESSION_EXPIRY_MS = 8 * 60 * 60 * 1000;
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > DEV_SESSION_EXPIRY_MS) {
      localStorage.removeItem('__cross_app_session');
      localStorage.removeItem('__cross_app_timestamp');
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Clear cross-app session from localStorage
 */
function clearDevCrossAppSession(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('__cross_app_session');
    localStorage.removeItem('__cross_app_timestamp');
  } catch {
    // Silently fail
  }
}

/**
 * Refresh the timestamp on the cross-app session
 */
function refreshDevCrossAppSession(): void {
  if (typeof window === 'undefined') return;

  try {
    const session = localStorage.getItem('__cross_app_session');
    if (session) {
      localStorage.setItem('__cross_app_timestamp', Date.now().toString());
    }
  } catch {
    // Silently fail
  }
}

/**
 * Store session in localStorage for cross-port access
 */
function storeDevCrossAppSession(sessionCookie: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('__cross_app_session', sessionCookie);
    localStorage.setItem('__cross_app_timestamp', Date.now().toString());
  } catch {
    // Silently fail
  }
}

/**
 * AuthBootstrap Component
 *
 * Optimized authentication bootstrap using single fast-bootstrap endpoint.
 *
 * Flow:
 * 1. Check if Firebase has persisted user - verify still valid
 * 2. Check localStorage for dev cross-app session
 * 3. Try httpOnly cookie via fast-bootstrap endpoint
 * 4. Hydrate user directly (dev) or sign in with custom token (prod)
 */
export function AuthBootstrap() {
  const {
    firebaseUser,
    setIsBootstrapping,
    setBootstrapStatus,
    ssoInProgress,
    hydrateFromDevSession,
    hydrateFromFastBootstrap,
  } = useAuth();
  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    // Skip if already in progress
    if (bootstrapping || bootstrapped || ssoInProgress) {
      return;
    }

    // If Firebase has a persisted user, verify session is still valid
    if (firebaseUser) {
      setBootstrapping(true);
      setBootstrapStatus('running');

      fastBootstrap()
        .then(async (result) => {
          if (!result.authenticated) {
            // Session was revoked (user logged out on another app)
            console.log('[AuthBootstrap] Session invalid, signing out Firebase user');
            await signOut(auth);
            clearDevCrossAppSession();
          }
          setBootstrapped(true);
          setBootstrapStatus('complete');
        })
        .catch(() => {
          // On error, just mark complete
          setBootstrapped(true);
          setBootstrapStatus('complete');
        })
        .finally(() => {
          setBootstrapping(false);
        });
      return;
    }

    // Main bootstrap flow
    setBootstrapping(true);
    setIsBootstrapping(true);
    setBootstrapStatus('running');

    // Reduced timeout (1.5s instead of 5s)
    const timeoutId = setTimeout(() => {
      console.warn('[AuthBootstrap] Bootstrap timed out after 1.5s');
      setIsBootstrapping(false);
      setBootstrapped(true);
      setBootstrapStatus('complete');
      setBootstrapping(false);
    }, 1500);

    const runBootstrap = async () => {
      // In dev mode, try localStorage session first
      const crossAppSession = getDevCrossAppSession();

      // Single fast-bootstrap call handles everything
      const result = await fastBootstrap(crossAppSession || undefined);

      clearTimeout(timeoutId);

      if (!result.authenticated) {
        // No valid session
        if (crossAppSession) {
          // Clear stale localStorage session
          clearDevCrossAppSession();
        }
        setIsBootstrapping(false);
        setBootstrapped(true);
        setBootstrapStatus('complete');
        return;
      }

      // Handle dev mode hydration
      if (result.devMode && result.sessionCookie) {
        // Use fast bootstrap hydration if user data is available
        if (result.user && hydrateFromFastBootstrap) {
          hydrateFromFastBootstrap(result.user);
        } else {
          hydrateFromDevSession(result.sessionCookie);
        }
        // Store/refresh session for cross-port access
        storeDevCrossAppSession(result.sessionCookie);
        refreshDevCrossAppSession();

        // Also sign in with Firebase Auth if custom token available
        // This enables Firebase Storage operations in dev mode
        if (result.customToken) {
          try {
            await signInWithCustomToken(auth, result.customToken);
          } catch (e) {
            console.warn('[AuthBootstrap] Dev mode Firebase sign-in failed:', e);
          }
        }

        setBootstrapped(true);
        setBootstrapStatus('complete');
        return;
      }

      // Production path - sign in with custom token
      if (result.customToken) {
        await signInWithCustomToken(auth, result.customToken);
      }

      setBootstrapped(true);
      setBootstrapStatus('complete');
    };

    runBootstrap()
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error('[AuthBootstrap] Bootstrap failed:', error);
        setIsBootstrapping(false);
        setBootstrapped(true);
        setBootstrapStatus('complete');
      })
      .finally(() => {
        setBootstrapping(false);
      });
  }, [
    firebaseUser,
    bootstrapping,
    bootstrapped,
    ssoInProgress,
    setIsBootstrapping,
    setBootstrapStatus,
    hydrateFromDevSession,
    hydrateFromFastBootstrap,
  ]);

  return null;
}
