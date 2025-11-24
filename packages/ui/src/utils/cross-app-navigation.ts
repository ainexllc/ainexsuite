/**
 * Cross-app navigation utilities
 * Handles navigation between different apps in the AinexSuite with automatic authentication
 */

import { getAppUrl } from '../config/apps';
import type { AppSlug } from '../config/apps';

/**
 * Navigate to another app's workspace with automatic authentication
 *
 * In production:
 * - Relies on shared session cookie across subdomains (.ainexsuite.com)
 * - User will be automatically authenticated via AuthBootstrap
 *
 * In development:
 * - Uses localStorage to pass session info between localhost ports
 * - Target app will pick up the session and auto-login
 *
 * @param appSlug - The target app slug (e.g., 'notes', 'journey', 'pulse')
 * @param currentAppSlug - Optional current app slug to avoid navigating to same app
 */
export function navigateToApp(appSlug: AppSlug | string, currentAppSlug?: string): void {
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

  // Navigate to target app's workspace
  window.location.href = targetUrl;
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
    '3004': 'track',
    '3005': 'moments',
    '3006': 'grow',
    '3007': 'pulse',
    '3008': 'fit',
    '3009': 'projects',
    '3010': 'workflow',
    '3011': 'admin',
  };

  return portMap[port] || null;
}
