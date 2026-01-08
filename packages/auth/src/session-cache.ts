/**
 * Session Cache for Instant Auth Hydration
 *
 * Uses sessionStorage (per-tab, survives refresh) to cache authenticated user data.
 * Enables instant hydration on page refresh without waiting for API calls.
 *
 * Flow:
 * 1. On successful auth, cache user data in sessionStorage
 * 2. On page load, immediately hydrate from cache (instant UI)
 * 3. Validate cache in background, refresh if invalid
 *
 * TTL: 5 minutes - short enough to catch revoked sessions, long enough for page refreshes
 */

import type { User } from '@ainexsuite/types';

const CACHE_KEY = '__ainex_session_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedSession {
  user: User;
  timestamp: number;
  uid: string;
}

/**
 * Get cached session if valid
 * Returns null if no cache, expired, or invalid
 */
export function getCachedSession(): CachedSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) {
      return null;
    }

    const data = JSON.parse(cached) as CachedSession;

    // Check TTL
    const age = Date.now() - data.timestamp;
    if (age > CACHE_TTL_MS) {
      // Expired - clear cache
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Validate structure
    if (!data.user || !data.uid) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch {
    // Invalid JSON or other error
    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch {
      // Ignore
    }
    return null;
  }
}

/**
 * Cache the current user session
 * Called after successful authentication
 */
export function setCachedSession(user: User): void {
  if (typeof window === 'undefined' || !user) {
    return;
  }

  try {
    const data: CachedSession = {
      user,
      timestamp: Date.now(),
      uid: user.uid,
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage full or disabled - ignore
  }
}

/**
 * Update the timestamp on existing cache
 * Called after successful background validation
 */
export function refreshCacheTimestamp(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const cached = getCachedSession();
    if (cached) {
      cached.timestamp = Date.now();
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    }
  } catch {
    // Ignore
  }
}

/**
 * Update cached user data
 * Called when user profile or preferences change
 */
export function updateCachedUser(updates: Partial<User>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const cached = getCachedSession();
    if (cached) {
      cached.user = { ...cached.user, ...updates };
      cached.timestamp = Date.now();
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    }
  } catch {
    // Ignore
  }
}

/**
 * Clear the session cache
 * Called on logout or when session is invalidated
 */
export function invalidateCache(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Check if cache is still fresh (within half of TTL)
 * Used to determine if background validation is needed
 */
export function isCacheFresh(): boolean {
  const cached = getCachedSession();
  if (!cached) {
    return false;
  }

  const age = Date.now() - cached.timestamp;
  return age < CACHE_TTL_MS / 2; // Fresh if less than 2.5 minutes old
}
