'use client';

import { useEffect, useState } from 'react';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { auth } from '@ainexsuite/firebase';
import { useAuth } from './context';

/**
 * Verify session cookie is still valid
 * Used to detect cross-app logout (user logged out on another app)
 */
async function verifySessionCookie(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.authenticated === true;
  } catch {
    return false;
  }
}

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
 * Refresh the timestamp on the cross-app session to extend its validity
 * Called after successful bootstrap to keep session alive for page refreshes
 */
function refreshDevCrossAppSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const session = localStorage.getItem('__cross_app_session');
    if (session) {
      // Update timestamp to extend the 5-minute window
      localStorage.setItem('__cross_app_timestamp', Date.now().toString());
    }
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
  const { firebaseUser, setIsBootstrapping, setBootstrapStatus, ssoInProgress, hydrateFromDevSession } = useAuth();
  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    // Skip if currently bootstrapping, already bootstrapped, or SSO in progress
    if (bootstrapping || bootstrapped || ssoInProgress) {
      return;
    }

    // If Firebase has a persisted user, verify session cookie is still valid
    // This handles cross-app logout (user logged out on another app)
    if (firebaseUser) {
      setBootstrapping(true);
      setBootstrapStatus('running');

      verifySessionCookie()
        .then(async (isValid) => {
          if (!isValid) {
            // Session was revoked (user logged out on another app)
            console.log('[AuthBootstrap] Session revoked, signing out stale Firebase user');
            await signOut(auth);
            // Also clear dev localStorage session if present
            clearDevCrossAppSession();
          }
          setBootstrapped(true);
          setBootstrapStatus('complete');
        })
        .catch(() => {
          // On error, just mark as complete (don't sign out on network failures)
          setBootstrapped(true);
          setBootstrapStatus('complete');
        })
        .finally(() => {
          setBootstrapping(false);
        });
      return;
    }

    // In development, check for cross-app session from localStorage first
    if (process.env.NODE_ENV === 'development') {
      const crossAppSession = getDevCrossAppSession();
      if (crossAppSession) {
        console.log('[AuthBootstrap] Found dev cross-app session, bootstrapping...');
        // Don't clear - keep it for page refreshes
        // The session has a 5-minute expiry built into getDevCrossAppSession()

        // Bootstrap from the dev session
        setBootstrapping(true);
        setIsBootstrapping(true);
        setBootstrapStatus('running');

        bootstrapFromDevSessionFn(crossAppSession, hydrateFromDevSession)
          .then(() => {
            console.log('[AuthBootstrap] Dev session bootstrap succeeded');
            // Refresh the timestamp to extend the session on successful bootstrap
            refreshDevCrossAppSession();
            setBootstrapped(true);
            setBootstrapStatus('complete');
          })
          .catch((error) => {
            console.error('[AuthBootstrap] Dev session bootstrap failed:', error);
            // Clear the session if it failed (invalid/corrupted)
            clearDevCrossAppSession();
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
      .then((result) => {
        if (result && result.devMode && result.sessionCookie) {
          hydrateFromDevSession(result.sessionCookie);
          // Store in localStorage so page refreshes work on this port
          if (typeof window !== 'undefined') {
            localStorage.setItem('__cross_app_session', result.sessionCookie);
            localStorage.setItem('__cross_app_timestamp', Date.now().toString());
          }
        }
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
  }, [firebaseUser, bootstrapping, bootstrapped, ssoInProgress, setIsBootstrapping, setBootstrapStatus, hydrateFromDevSession]);

  // Render nothing - this is a passive component
  return null;
}

/**
 * Bootstrap from httpOnly session cookie via server endpoint
 * The server reads the cookie and returns a custom token
 */
async function bootstrapFromHttpOnlyCookie(): Promise<{ devMode?: boolean; sessionCookie?: string } | void> {
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

  const data = await response.json();

  // Check if server returned devMode (can't create real custom token)
  if (data.devMode && data.sessionCookie) {
    console.log('[AuthBootstrap] Dev mode - hydrating user directly from session');
    // In dev mode without proper admin SDK, we can't use signInWithCustomToken
    // Instead, directly hydrate the user from the session cookie
    // We need to import hydrateFromDevSession from context or pass it in
    // For now, we'll dispatch a custom event that auth provider listens to, 
    // or better: refactor this function to be part of the component logic or accept callbacks
    return { devMode: true, sessionCookie: data.sessionCookie };
  }

  const { customToken } = data;
  console.log('[AuthBootstrap] Got custom token, signing in...');

  // Sign in with custom token
  await signInWithCustomToken(auth, customToken);
  console.log('[AuthBootstrap] Sign in with custom token complete');
}

/**
 * Bootstrap from dev cross-app session (localStorage)
 * This is for development only where cookies don't work across ports
 *
 * @param sessionCookie - The base64-encoded session cookie
 * @param hydrateFromDevSession - Callback to directly set user in AuthContext
 */
async function bootstrapFromDevSessionFn(
  sessionCookie: string,
  hydrateFromDevSession: (cookie: string) => void
): Promise<void> {
  const response = await fetch('/api/auth/custom-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionCookie }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get custom token: ${response.status}`);
  }

  const data = await response.json();

  // Check if server returned devMode (can't create real custom token)
  if (data.devMode && data.sessionCookie) {
    console.log('[AuthBootstrap] Dev mode - hydrating user directly from session');
    // In dev mode without proper admin SDK, we can't use signInWithCustomToken
    // Instead, directly hydrate the user from the session cookie
    hydrateFromDevSession(data.sessionCookie);
    return;
  }

  const { customToken } = data;

  if (!customToken) {
    throw new Error('No custom token returned from server');
  }

  // Sign in with custom token (production path)
  await signInWithCustomToken(auth, customToken);
}
