/**
 * Cross-app navigation utilities
 * Handles navigation between different apps in the AinexSuite with automatic authentication
 */

import { getAppUrl } from '../config/apps';
import type { AppSlug } from '../config/apps';

/**
 * Navigate to another app's workspace with automatic authentication via SSO
 *
 * Flow:
 * 1. Request custom token from current app's /api/auth/custom-token
 * 2. Navigate to target app with ?auth_token parameter
 * 3. Target app's SSOHandler picks up token and signs user in
 * 4. Creates server-side session cookie
 * 5. User is fully authenticated
 *
 * In development:
 * - Also syncs session to localStorage as fallback
 *
 * @param appSlug - The target app slug (e.g., 'notes', 'journey', 'pulse')
 * @param currentAppSlug - Optional current app slug to avoid navigating to same app
 */
export async function navigateToApp(appSlug: AppSlug | string, currentAppSlug?: string): Promise<void> {
  // Don't navigate if clicking on current app
  if (currentAppSlug && appSlug === currentAppSlug) {
    return;
  }

  const isDev = process.env.NODE_ENV === 'development';
  const targetUrl = getAppUrl(appSlug, isDev);

  // In development, sync session cookie to localStorage for cross-port authentication
  if (isDev) {
    syncSessionForDev();
  }

  try {
    // Request custom token for SSO
    const response = await fetch('/api/auth/custom-token', {
      method: 'POST',
      credentials: 'include', // Include httpOnly cookies
    });

    if (response.ok) {
      const { customToken } = await response.json();

      // Add auth token to URL
      const urlWithToken = new URL(targetUrl);
      urlWithToken.searchParams.set('auth_token', customToken);

      window.location.href = urlWithToken.toString();
    } else {
      // No valid session - navigate without SSO (target app will handle auth)
      window.location.href = targetUrl;
    }
  } catch (error) {
    // Fallback: Navigate without SSO
    console.error('❌ SSO: Error during navigation:', error);
    window.location.href = targetUrl;
  }
}

/**
 * Sync session cookie to localStorage for development cross-port navigation
 * This allows different localhost ports to share authentication state
 */
function syncSessionForDev(): void {
  try {
    // Get session cookie
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies
      .find(cookie => cookie.trim().startsWith('__session='))
      ?.split('=')[1];

    if (sessionCookie) {
      // Store in localStorage for cross-port access
      localStorage.setItem('__cross_app_session', sessionCookie);
      localStorage.setItem('__cross_app_timestamp', Date.now().toString());
    }
  } catch (error) {
    console.warn('Failed to sync session for cross-app navigation:', error);
  }
}

/**
 * Check if there's a pending cross-app session in localStorage (for dev)
 * Returns the session cookie if found and not expired (< 5 minutes old)
 */
export function getDevCrossAppSession(): string | null {
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
    console.warn('Failed to retrieve cross-app session:', error);
    return null;
  }
}

/**
 * Clear cross-app session from localStorage
 */
export function clearDevCrossAppSession(): void {
  try {
    localStorage.removeItem('__cross_app_session');
    localStorage.removeItem('__cross_app_timestamp');
  } catch (error) {
    console.warn('Failed to clear cross-app session:', error);
  }
}

/**
 * Login status type for app authentication checks
 */
export type LoginStatus = 'checking' | 'logged-in' | 'logged-out' | 'error';

/**
 * Check login status for a specific app
 * Makes a request to the app's session endpoint to verify authentication
 *
 * @param appSlug - The app slug to check
 * @returns Promise resolving to the login status
 */
export async function checkAppLoginStatus(appSlug: AppSlug | string): Promise<LoginStatus> {
  const isDev = process.env.NODE_ENV === 'development';
  const baseUrl = getAppUrl(appSlug, isDev).replace('/workspace', '');

  try {
    const response = await fetch(`${baseUrl}/api/auth/session`, {
      method: 'GET',
      credentials: 'include',
      mode: 'cors',
    });

    if (response.ok) {
      const data = await response.json();
      return data.user ? 'logged-in' : 'logged-out';
    }
    return 'logged-out';
  } catch {
    // CORS or network error - can't determine status
    return 'error';
  }
}

/**
 * Check login status for all apps
 * Returns a map of app slugs to their login status
 *
 * @param appSlugs - Array of app slugs to check
 * @param currentAppSlug - Current app slug (will be marked based on isLoggedIn)
 * @param isLoggedIn - Whether user is logged into current app
 * @returns Promise resolving to a map of login statuses
 */
export async function checkAllAppsLoginStatus(
  appSlugs: (AppSlug | string)[],
  currentAppSlug?: string,
  isLoggedIn?: boolean
): Promise<Record<string, LoginStatus>> {
  const results: Record<string, LoginStatus> = {};

  // Set current app status immediately
  if (currentAppSlug) {
    results[currentAppSlug] = isLoggedIn ? 'logged-in' : 'logged-out';
  }

  // Check all other apps in parallel
  const promises = appSlugs
    .filter(slug => slug !== currentAppSlug)
    .map(async (slug) => {
      const status = await checkAppLoginStatus(slug);
      return { slug, status };
    });

  const statusResults = await Promise.all(promises);

  statusResults.forEach(({ slug, status }) => {
    results[slug] = status;
  });

  return results;
}

/**
 * Get current app slug from hostname or port
 */
export function getCurrentAppSlug(): AppSlug | 'main' | 'admin' | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const hostname = window.location.hostname;
  const port = window.location.port;

  // Production: Extract from subdomain (e.g., notes.ainexsuite.com -> notes)
  if (hostname.includes('ainexsuite.com')) {
    const subdomain = hostname.split('.')[0];
    if (subdomain === 'ainexsuite' || subdomain === 'www') {
      return 'main';
    }
    return subdomain as AppSlug | 'admin';
  }

  // Development: Map port to app
  const portMap: Record<string, AppSlug | 'main' | 'admin'> = {
    '3000': 'main',
    '3001': 'notes',
    '3002': 'journey',
    '3003': 'todo',
    '3004': 'health',
    '3005': 'moments',
    '3006': 'grow',
    '3007': 'pulse',
    '3008': 'fit',
    '3009': 'project',
    '3010': 'workflow',
    '3011': 'admin',
    '3015': 'track',
  };

  return portMap[port] || null;
}
