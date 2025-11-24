'use client';

import { useEffect, useState } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@ainexsuite/firebase';
import { useAuth } from './context';
import { getSessionCookie } from './session';

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
 * 2. Check if __session cookie exists
 * 3. Call /api/auth/custom-token to generate Firebase custom token
 * 4. Sign in with custom token (which triggers onAuthStateChanged)
 * 5. AuthContext hydrates with user data from existing session (skips creating new session)
 *
 * Usage:
 * Add to AuthProvider children:
 * <AuthProvider>
 *   <AuthBootstrap />
 *   {children}
 * </AuthProvider>
 */
export function AuthBootstrap() {
  const { firebaseUser, setIsBootstrapping, setBootstrapStatus } = useAuth();
  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    // Skip if already authenticated or currently bootstrapping
    if (firebaseUser || bootstrapping || bootstrapped) {
      return;
    }

    // Check for session cookie (production) or cross-app session (dev)
    let sessionCookie = getSessionCookie();

    // In development, check for cross-app session from localStorage
    if (!sessionCookie && process.env.NODE_ENV === 'development') {
      const crossAppSession = getDevCrossAppSession();
      if (crossAppSession) {
        sessionCookie = crossAppSession;
        // Clear the cross-app session after reading it
        clearDevCrossAppSession();
      }
    }

    if (!sessionCookie) {
      setBootstrapped(true); // Mark as attempted to prevent re-checking
      setBootstrapStatus('complete'); // No session to bootstrap, proceed to normal auth
      return;
    }

    // Bootstrap from cookie
    setBootstrapping(true);
    // Signal to AuthProvider that we're bootstrapping from existing session
    setIsBootstrapping(true);
    setBootstrapStatus('running');

    bootstrapFromCookie(sessionCookie)
      .then(() => {
        setBootstrapped(true);
        setBootstrapStatus('complete');
      })
      .catch((_error) => {
        // Reset bootstrapping flag on error
        setIsBootstrapping(false);
        setBootstrapped(true);
        setBootstrapStatus('failed');
      })
      .finally(() => {
        setBootstrapping(false);
      });
  }, [firebaseUser, bootstrapping, bootstrapped, setIsBootstrapping, setBootstrapStatus]);

  // Render nothing - this is a passive component
  return null;
}

async function bootstrapFromCookie(sessionCookie: string): Promise<void> {
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
