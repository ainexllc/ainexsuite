/**
 * Session cookie utilities for SSO across subdomains
 * @version 1.1.2 - Fixed trailing newlines in env vars
 */

import Cookies from 'js-cookie';
import { SESSION_COOKIE_MAX_AGE_SECONDS } from '@ainexsuite/firebase/config';
import { getCookieDomain } from './utils/domain';

const SESSION_COOKIE_NAME = '__session';

export interface SessionData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

/**
 * Set session cookie with dynamic domain detection
 * NOTE: This is only used for NON-httpOnly cookies (client-readable).
 * The main session cookie is set by the server with httpOnly=true for security.
 * This client-side cookie is a secondary backup for cases where we need client-side access.
 *
 * @deprecated Server now handles the primary session cookie. This is kept for backward compatibility.
 */
export function setSessionCookie(_sessionCookie: string): void {
  // IMPORTANT: Do NOT set a client-side cookie here.
  // The server sets the __session cookie with httpOnly=true for security.
  // Setting a duplicate non-httpOnly cookie causes issues where the browser
  // sends the wrong cookie to the server.
  //
  // The session cookie is now managed entirely by the server via:
  // - /api/auth/session (creates cookie on login)
  // - /api/auth/custom-token (reads cookie for SSO)
}

/**
 * Get session cookie
 * NOTE: This only reads non-httpOnly cookies. The primary session cookie
 * is httpOnly and cannot be read by JavaScript (for security).
 * Use this only for checking if a backup cookie exists.
 */
export function getSessionCookie(): string | undefined {
  return Cookies.get(SESSION_COOKIE_NAME);
}

/**
 * Remove session cookie (logout)
 * NOTE: This removes any client-readable cookie. The httpOnly cookie
 * is cleared when the browser receives a Set-Cookie header with max-age=0
 * from the server logout endpoint.
 */
export function removeSessionCookie(): void {
  const cookieDomain = getCookieDomain();

  // Remove any client-side cookie (for cleanup)
  Cookies.remove(SESSION_COOKIE_NAME, {
    domain: cookieDomain,
    path: '/',
  });

  // Also try without domain for same-origin cookies
  Cookies.remove(SESSION_COOKIE_NAME, {
    path: '/',
  });
}

/**
 * Check if user has a session cookie
 */
export function hasSessionCookie(): boolean {
  return !!getSessionCookie();
}

/**
 * Session timeout management
 */
const SESSION_TIMEOUT_KEY = '__session_timeout';
const SESSION_LAST_ACTIVITY_KEY = '__session_last_activity';

/**
 * Set session timeout timestamp
 */
export function setSessionTimeout(expiryTimestamp: number): void {
  localStorage.setItem(SESSION_TIMEOUT_KEY, String(expiryTimestamp));
}

/**
 * Get session timeout timestamp
 */
export function getSessionTimeout(): number | null {
  const timeout = localStorage.getItem(SESSION_TIMEOUT_KEY);
  return timeout ? parseInt(timeout, 10) : null;
}

/**
 * Update last activity timestamp
 */
export function updateLastActivity(): void {
  localStorage.setItem(SESSION_LAST_ACTIVITY_KEY, String(Date.now()));
}

/**
 * Get last activity timestamp
 */
export function getLastActivity(): number | null {
  const activity = localStorage.getItem(SESSION_LAST_ACTIVITY_KEY);
  return activity ? parseInt(activity, 10) : null;
}

/**
 * Check if session has expired based on timeout
 */
export function isSessionExpired(): boolean {
  const timeout = getSessionTimeout();
  if (!timeout) return false;
  return Date.now() > timeout;
}

/**
 * Check if session needs refresh (75% of max age elapsed)
 */
export function shouldRefreshSession(): boolean {
  const lastActivity = getLastActivity();
  if (!lastActivity) return false;

  const elapsed = Date.now() - lastActivity;
  const refreshThreshold = (SESSION_COOKIE_MAX_AGE_SECONDS * 1000) * 0.75; // 75% of max age

  return elapsed > refreshThreshold;
}

/**
 * Clear all session data
 */
export function clearSessionData(): void {
  removeSessionCookie();
  localStorage.removeItem(SESSION_TIMEOUT_KEY);
  localStorage.removeItem(SESSION_LAST_ACTIVITY_KEY);
  // Also clear cross-app session for dev mode
  localStorage.removeItem('__cross_app_session');
  localStorage.removeItem('__cross_app_timestamp');
}

/**
 * Initialize session with timeout
 */
export function initializeSession(sessionCookie: string): void {
  setSessionCookie(sessionCookie);
  const expiryTimestamp = Date.now() + (SESSION_COOKIE_MAX_AGE_SECONDS * 1000);
  setSessionTimeout(expiryTimestamp);
  updateLastActivity();
}

/**
 * Validate session state
 */
export interface SessionValidation {
  valid: boolean;
  expired: boolean;
  needsRefresh: boolean;
  hasCookie: boolean;
}

/**
 * Validate current session state
 */
export function validateSession(): SessionValidation {
  const hasCookie = hasSessionCookie();
  const expired = isSessionExpired();
  const needsRefresh = shouldRefreshSession();

  return {
    valid: hasCookie && !expired,
    expired,
    needsRefresh,
    hasCookie,
  };
}

/**
 * Get remaining session time in seconds
 */
export function getRemainingSessionTime(): number | null {
  const timeout = getSessionTimeout();
  if (!timeout) return null;

  const remaining = Math.max(0, timeout - Date.now());
  return Math.floor(remaining / 1000);
}

/**
 * Check if session is about to expire (less than 5 minutes remaining)
 */
export function isSessionExpiringSoon(): boolean {
  const remaining = getRemainingSessionTime();
  if (remaining === null) return false;
  return remaining < 300; // 5 minutes in seconds
}
