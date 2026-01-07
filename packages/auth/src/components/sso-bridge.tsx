'use client';

import { useEffect, useState, useRef } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@ainexsuite/firebase';
import { getAuthHubUrl, isAuthHub } from '../utils/sso-protocol';

interface SSOBridgeProps {
  /**
   * Called when SSO bridge has finished checking (success or failure)
   */
  onComplete?: () => void;

  /**
   * If true, the bridge is active and will check for cross-app authentication
   * Default: true when not authenticated
   */
  enabled?: boolean;

  /**
   * Callback to hydrate user from dev session cookie (dev mode only)
   * This avoids the need to reload the page
   */
  hydrateFromDevSession?: (sessionCookie: string) => void;
}

/**
 * SSOBridge Component (Simplified - No Iframe)
 *
 * Enables automatic cross-app Single Sign-On by checking the Auth Hub
 * (main app) for an existing session via direct API call.
 *
 * How it works:
 * 1. Calls Auth Hub's /api/auth/sso-status directly via fetch()
 * 2. If authenticated, receives the session cookie
 * 3. Calls local /api/auth/custom-token with the session to sign in
 *
 * This is much simpler than the previous iframe approach:
 * - No iframe, no postMessage, no dedicated sso-check page
 * - Just two API calls
 *
 * Usage:
 * Automatically included in AuthProvider - no manual usage needed.
 */
export function SSOBridge({ onComplete, enabled = true, hydrateFromDevSession }: SSOBridgeProps) {
  const [completed, setCompleted] = useState(false);
  const checkingRef = useRef(false);

  useEffect(() => {
    // Skip if disabled, already completed, or this IS the auth hub
    if (!enabled || completed || isAuthHub()) {
      if (!completed && isAuthHub()) {
        setCompleted(true);
      }
      onComplete?.();
      return;
    }

    // Prevent double-checking
    if (checkingRef.current) {
      return;
    }
    checkingRef.current = true;

    checkAuthHub()
      .then(async (sessionCookie) => {
        if (sessionCookie) {
          await bootstrapWithSession(sessionCookie, hydrateFromDevSession);
        }
      })
      .catch((error) => {
        console.error('[SSOBridge] Error checking Auth Hub:', error);
      })
      .finally(() => {
        setCompleted(true);
        checkingRef.current = false;
        onComplete?.();
      });
  }, [enabled, completed, onComplete, hydrateFromDevSession]);

  // No UI needed - this is purely functional
  return null;
}

/**
 * Check the Auth Hub for an existing session
 * Returns the session cookie if authenticated, null otherwise
 */
async function checkAuthHub(): Promise<string | null> {
  const authHubUrl = getAuthHubUrl();
  const url = `${authHubUrl}/api/auth/sso-status`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      // Note: credentials:'include' won't send cookies cross-origin,
      // but the auth hub reads its OWN cookies server-side
    });

    if (!response.ok) {
      console.warn('[SSOBridge] Auth Hub returned status:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.authenticated && data.sessionCookie) {
      return data.sessionCookie;
    }

    return null;
  } catch (error) {
    // Network errors are expected when auth hub isn't running (common in dev)
    // Only log as debug, not error
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug('[SSOBridge] Auth Hub unavailable (this is normal if main app is not running)');
    }
    return null;
  }
}

/**
 * Bootstrap authentication using the session cookie from Auth Hub
 * Calls the local /api/auth/custom-token endpoint with the session
 */
async function bootstrapWithSession(
  sessionCookie: string,
  hydrateFromDevSession?: (sessionCookie: string) => void
): Promise<void> {
  try {
    // Call local endpoint to get a custom token from the session
    const response = await fetch('/api/auth/custom-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionCookie }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('[SSOBridge] Failed to get custom token:', error);
      return;
    }

    const data = await response.json();

    // In development mode without admin SDK, server returns devMode=true with sessionCookie
    // Use hydrateFromDevSession callback to set user directly without reloading
    if (data.devMode && data.sessionCookie) {
      // Store in localStorage for future page refreshes
      if (typeof window !== 'undefined') {
        localStorage.setItem('__cross_app_session', data.sessionCookie);
        localStorage.setItem('__cross_app_timestamp', String(Date.now()));
      }
      // Use the callback to hydrate user directly (no reload!)
      if (hydrateFromDevSession) {
        hydrateFromDevSession(data.sessionCookie);
      } else {
        console.warn('[SSOBridge] No hydrateFromDevSession callback provided, user will not be hydrated');
      }
      return;
    }

    const { customToken } = data;

    if (!customToken) {
      console.error('[SSOBridge] No custom token returned');
      return;
    }

    // Sign in with the custom token
    await signInWithCustomToken(auth, customToken);
  } catch (error) {
    console.error('[SSOBridge] Bootstrap failed:', error);
  }
}
