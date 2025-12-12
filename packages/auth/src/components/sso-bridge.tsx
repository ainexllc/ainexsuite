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
export function SSOBridge({ onComplete, enabled = true }: SSOBridgeProps) {
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

    console.log('[SSOBridge] Checking Auth Hub for existing session...');

    checkAuthHub()
      .then(async (sessionCookie) => {
        if (sessionCookie) {
          console.log('[SSOBridge] Found session on Auth Hub, bootstrapping...');
          await bootstrapWithSession(sessionCookie);
        } else {
          console.log('[SSOBridge] No session found on Auth Hub');
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
  }, [enabled, completed, onComplete]);

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
    console.error('[SSOBridge] Failed to check Auth Hub:', error);
    return null;
  }
}

/**
 * Bootstrap authentication using the session cookie from Auth Hub
 * Calls the local /api/auth/custom-token endpoint with the session
 */
async function bootstrapWithSession(sessionCookie: string): Promise<void> {
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
    // In this case, we need to trigger a page reload or use a different auth method
    if (data.devMode && data.sessionCookie) {
      console.log('[SSOBridge] Dev mode - setting session cookie and reloading...');
      // Store in localStorage for auth-bootstrap to pick up
      if (typeof window !== 'undefined') {
        localStorage.setItem('__cross_app_session', data.sessionCookie);
        localStorage.setItem('__cross_app_timestamp', String(Date.now()));
        // Reload to let auth-bootstrap pick up the session
        window.location.reload();
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
    console.log('[SSOBridge] Successfully signed in via SSO');
  } catch (error) {
    console.error('[SSOBridge] Bootstrap failed:', error);
  }
}
