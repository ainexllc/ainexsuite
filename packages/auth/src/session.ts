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
