/**
 * Cross-app navigation utilities
 * Handles navigation between different apps in the AinexSuite with automatic authentication
 */

import { getAppUrl } from '../config/apps';
import type { AppSlug } from '../config/apps';
import { getTokenForNavigation } from './auth-token-cache';

export interface NavigateOptions {
  /** Action to trigger in the target app (e.g., 'create' to open create mode) */
  action?: 'create';
}

/**
 * Navigate to another app's workspace with automatic authentication via SSO
 *
 * Production flow:
 * 1. Navigate directly to target app (no auth_token in URL)
 * 2. Browser automatically sends shared __session cookie (domain=.ainexspace.com)
 * 3. Target app's AuthProvider verifies session and initializes Firebase Auth
 * 4. User is fully authenticated - clean URLs, no token exposure
 *
 * Development flow:
 * 1. Sync session to localStorage (cookies don't share across ports)
 * 2. Navigate to target app
 * 3. Target app reads localStorage session
 *
 * @param appSlug - The target app slug (e.g., 'notes', 'journal', 'hub')
 * @param currentAppSlug - Optional current app slug to avoid navigating to same app
 * @param options - Optional navigation options (e.g., action to trigger)
 */
export async function navigateToApp(
  appSlug: AppSlug | string,
  currentAppSlug?: string,
  options?: NavigateOptions
): Promise<void> {
  // Don't navigate if clicking on current app
  if (currentAppSlug && appSlug === currentAppSlug) {
    return;
  }

  const isDev = process.env.NODE_ENV === 'development';
  const baseTargetUrl = getAppUrl(appSlug, isDev);

  // Helper to add action param if needed
  const appendActionParam = (url: string): string => {
    if (options?.action) {
      const urlObj = new URL(url);
      urlObj.searchParams.set('action', options.action);
      return urlObj.toString();
    }
    return url;
  };

  try {
    // Get token from cache or fetch (only needed for dev mode localStorage sync)
    const tokenData = await getTokenForNavigation();

    // Dev mode: store session in localStorage for cross-port auth
    // (cookies don't share across different localhost ports)
    if (tokenData?.devMode && tokenData.sessionCookie) {
      localStorage.setItem('__cross_app_session', tokenData.sessionCookie);
      localStorage.setItem('__cross_app_timestamp', String(Date.now()));
    }

    // Navigate directly - the shared __session cookie (domain=.ainexspace.com)
    // is automatically sent by the browser, so no auth_token needed in URL
    window.location.href = appendActionParam(baseTargetUrl);
  } catch (error) {
    // Fallback: Navigate without SSO
    console.error('❌ SSO: Error during navigation:', error);
    window.location.href = appendActionParam(baseTargetUrl);
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

  // Production: Extract from subdomain (e.g., notes.ainexspace.com -> notes)
  if (hostname.includes('ainexspace.com')) {
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
    '3002': 'journal',
    '3003': 'todo',
    '3004': 'health',
    '3005': 'album',
    '3006': 'habits',
    '3007': 'mosaic',
    '3008': 'fit',
    '3009': 'projects',
    '3010': 'flow',
    '3011': 'subs',
    '3012': 'docs',
    '3013': 'tables',
    '3014': 'calendar',
    '3020': 'admin',
  };

  return portMap[port] || null;
}
