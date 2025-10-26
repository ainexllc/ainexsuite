/**
 * Session cookie utilities for SSO across subdomains
 */

import Cookies from 'js-cookie';
import { SESSION_COOKIE_DOMAIN, SESSION_COOKIE_MAX_AGE } from '@ainexsuite/firebase/config';

const SESSION_COOKIE_NAME = '__session';

export interface SessionData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

/**
 * Set session cookie on .ainexsuite.com domain
 * This cookie will be accessible across all subdomains
 */
export function setSessionCookie(sessionCookie: string): void {
  Cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
    domain: SESSION_COOKIE_DOMAIN,
    expires: SESSION_COOKIE_MAX_AGE / (60 * 60 * 24), // Convert seconds to days
    secure: true,
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * Get session cookie
 */
export function getSessionCookie(): string | undefined {
  return Cookies.get(SESSION_COOKIE_NAME);
}

/**
 * Remove session cookie (logout)
 */
export function removeSessionCookie(): void {
  Cookies.remove(SESSION_COOKIE_NAME, {
    domain: SESSION_COOKIE_DOMAIN,
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
  const refreshThreshold = (SESSION_COOKIE_MAX_AGE * 1000) * 0.75; // 75% of max age

  return elapsed > refreshThreshold;
}

/**
 * Clear all session data
 */
export function clearSessionData(): void {
  removeSessionCookie();
  localStorage.removeItem(SESSION_TIMEOUT_KEY);
  localStorage.removeItem(SESSION_LAST_ACTIVITY_KEY);
}

/**
 * Initialize session with timeout
 */
export function initializeSession(sessionCookie: string): void {
  setSessionCookie(sessionCookie);
  const expiryTimestamp = Date.now() + (SESSION_COOKIE_MAX_AGE * 1000);
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
