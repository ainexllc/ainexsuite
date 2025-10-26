'use client';

import { useEffect, useState } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@ainexsuite/firebase';
import { useAuth } from './context';
import { getSessionCookie } from './session';

/**
 * AuthBootstrap Component
 *
 * Silently authenticates users from __session cookie on page load.
 *
 * Flow:
 * 1. Check if user is already authenticated
 * 2. Check if __session cookie exists
 * 3. Call /api/auth/custom-token to generate Firebase custom token
 * 4. Sign in with custom token
 * 5. AuthContext hydrates with user data
 *
 * Usage:
 * Add to AuthProvider children:
 * <AuthProvider>
 *   <AuthBootstrap />
 *   {children}
 * </AuthProvider>
 */
export function AuthBootstrap() {
  const { firebaseUser } = useAuth();
  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    // Skip if already authenticated or currently bootstrapping
    if (firebaseUser || bootstrapping || bootstrapped) {
      return;
    }

    const sessionCookie = getSessionCookie();
    if (!sessionCookie) {
      setBootstrapped(true); // Mark as attempted to prevent re-checking
      return;
    }

    // Bootstrap from cookie
    setBootstrapping(true);
    bootstrapFromCookie(sessionCookie)
      .then(() => {
        console.log('✓ Auth bootstrapped from session cookie');
        setBootstrapped(true);
      })
      .catch((error) => {
        console.error('Auth bootstrap failed:', error);
        setBootstrapped(true);
      })
      .finally(() => {
        setBootstrapping(false);
      });
  }, [firebaseUser, bootstrapping, bootstrapped]);

  // Render nothing - this is a passive component
  return null;
}

async function bootstrapFromCookie(sessionCookie: string): Promise<void> {
  try {
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
  } catch (error) {
    // Silent fail - user will need to login manually
    console.error('Bootstrap error:', error);
    throw error;
  }
}
