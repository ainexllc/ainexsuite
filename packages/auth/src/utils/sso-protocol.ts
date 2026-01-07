/**
 * SSO Protocol for Cross-App Authentication
 *
 * Utilities for direct API-based SSO (no iframe required)
 */

/**
 * Check if a hostname is a local network IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
 */
function isLocalNetworkIP(hostname: string): boolean {
  const localNetworkPattern = /^(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/;
  return localNetworkPattern.test(hostname);
}

/**
 * Get the Auth Hub URL based on environment
 * Main app (port 3000 / ainexspace.com) serves as the central auth hub
 */
export function getAuthHubUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://ainexspace.com';
  }

  // Client-side: detect environment from current hostname
  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }

  // Local network IPs for development testing
  // Use the same IP but port 3000 (main app)
  if (isLocalNetworkIP(hostname)) {
    return `http://${hostname}:3000`;
  }

  // Production: use main ainexspace.com domain
  if (hostname.endsWith('.ainexspace.com') || hostname === 'ainexspace.com') {
    return 'https://ainexspace.com';
  }

  // Vercel preview deployments - main app preview
  if (hostname.includes('vercel.app')) {
    // For preview deployments, we can't easily determine the main app URL
    // Fall back to production auth hub
    return 'https://ainexspace.com';
  }

  // Default to production
  return 'https://ainexspace.com';
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

  // Development: port 3000 is the auth hub (localhost, 127.0.0.1, or local network IPs)
  if ((hostname === 'localhost' || hostname === '127.0.0.1' || isLocalNetworkIP(hostname)) && port === '3000') {
    return true;
  }

  // Production: ainexspace.com (without subdomain) is the auth hub
  if (hostname === 'ainexspace.com' || hostname === 'www.ainexspace.com') {
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
    return true;
  }

  const authHubUrl = getAuthHubUrl();
  const syncUrl = `${authHubUrl}/api/auth/session-sync`;

  try {
    const response = await fetch(syncUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ sessionCookie }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Sync logout with the Auth Hub
 *
 * When a user logs out of any app, this function notifies the Auth Hub
 * to clear the session from its in-memory store. This ensures other apps
 * won't get a stale session when they check for SSO.
 *
 * This is the counterpart to syncSessionWithAuthHub for login.
 */
export async function syncLogoutWithAuthHub(uid: string): Promise<boolean> {
  // Always call the logout-sync endpoint, even on the Auth Hub itself
  // This ensures the in-memory session store is cleared regardless of which app
  // the user logs out from
  const authHubUrl = getAuthHubUrl();
  const logoutUrl = `${authHubUrl}/api/auth/logout-sync`;

  try {
    const response = await fetch(logoutUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid }),
    });

    return response.ok;
  } catch {
    // Silent fail - logout will continue locally
    // The session will expire naturally anyway
    return false;
  }
}
