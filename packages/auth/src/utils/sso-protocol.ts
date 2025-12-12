/**
 * SSO Protocol for Cross-App Authentication
 *
 * Utilities for direct API-based SSO (no iframe required)
 */

/**
 * Get the Auth Hub URL based on environment
 * Main app (port 3000 / ainexsuite.com) serves as the central auth hub
 */
export function getAuthHubUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://ainexsuite.com';
  }

  // Client-side: detect environment from current hostname
  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }

  // Production: use main ainexsuite.com domain
  if (hostname.endsWith('.ainexsuite.com') || hostname === 'ainexsuite.com') {
    return 'https://ainexsuite.com';
  }

  // Vercel preview deployments - main app preview
  if (hostname.includes('vercel.app')) {
    // For preview deployments, we can't easily determine the main app URL
    // Fall back to production auth hub
    return 'https://ainexsuite.com';
  }

  // Default to production
  return 'https://ainexsuite.com';
}

/**
 * Check if the current app is the Auth Hub (main app)
 * If so, we don't need to check for SSO - we ARE the source of truth
 */
export function isAuthHub(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const port = window.location.port;
  const hostname = window.location.hostname;

  // Development: port 3000 is the auth hub
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && port === '3000') {
    return true;
  }

  // Production: ainexsuite.com (without subdomain) is the auth hub
  if (hostname === 'ainexsuite.com' || hostname === 'www.ainexsuite.com') {
    return true;
  }

  return false;
}

/**
 * Sync session with the Auth Hub
 *
 * When a user logs into any app, this function sends the session cookie
 * to the Auth Hub so that other apps can authenticate via SSOBridge.
 *
 * This solves the development environment issue where cookies don't share
 * across different ports (localhost:3001, localhost:3002, etc.)
 */
export async function syncSessionWithAuthHub(sessionCookie: string): Promise<boolean> {
  // Don't sync if we're already on the auth hub
  if (isAuthHub()) {
    console.log('[SSO] Already on auth hub, no sync needed');
    return true;
  }

  const authHubUrl = getAuthHubUrl();
  const syncUrl = `${authHubUrl}/api/auth/session-sync`;

  try {
    console.log('[SSO] Syncing session with Auth Hub:', authHubUrl);

    const response = await fetch(syncUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ sessionCookie }),
    });

    if (response.ok) {
      console.log('[SSO] Session synced with Auth Hub successfully');
      return true;
    } else {
      console.warn('[SSO] Failed to sync session with Auth Hub:', response.status);
      return false;
    }
  } catch (error) {
    console.warn('[SSO] Error syncing session with Auth Hub:', error);
    return false;
  }
}
