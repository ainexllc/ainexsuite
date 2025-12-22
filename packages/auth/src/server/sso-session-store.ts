/**
 * SSO Session Store
 *
 * In-memory store for SSO sessions in development.
 * This solves the problem where cross-origin cookies don't work in development
 * (different ports are treated as different origins).
 *
 * In production, we rely on shared cookies on the .ainexsuite.com domain,
 * so this store is only used as a backup.
 *
 * Note: This store is per-process, so it only works for single-server setups.
 * In production with multiple servers, use Redis or similar.
 */

interface StoredSession {
  sessionCookie: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory store for sessions
// Key is the session ID (derived from the session cookie)
const sessionStore = new Map<string, StoredSession>();

// Session expiry time (5 days in milliseconds)
const SESSION_TTL = 5 * 24 * 60 * 60 * 1000;

// Cleanup interval (every hour)
const CLEANUP_INTERVAL = 60 * 60 * 1000;

/**
 * Get a unique ID from a session cookie
 * We use the uid from the session as the key
 */
function getSessionId(sessionCookie: string): string | null {
  try {
    const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString());
    return decoded.uid || null;
  } catch {
    return null;
  }
}

/**
 * Store a session cookie
 */
export function storeSession(sessionCookie: string): boolean {
  const sessionId = getSessionId(sessionCookie);
  if (!sessionId) {
    console.error('[SSO Store] Invalid session cookie - no uid found');
    return false;
  }

  const now = Date.now();
  sessionStore.set(sessionId, {
    sessionCookie,
    createdAt: now,
    expiresAt: now + SESSION_TTL,
  });

  return true;
}

/**
 * Get the most recent valid session
 * Returns null if no valid session exists
 */
export function getLatestSession(): string | null {
  const now = Date.now();
  let latestSession: StoredSession | null = null;

  // Find the most recently created valid session
  for (const [sessionId, session] of sessionStore.entries()) {
    // Skip expired sessions
    if (session.expiresAt < now) {
      sessionStore.delete(sessionId);
      continue;
    }

    // Track the latest
    if (!latestSession || session.createdAt > latestSession.createdAt) {
      latestSession = session;
    }
  }

  if (latestSession) {
    return latestSession.sessionCookie;
  }

  return null;
}

/**
 * Get session by uid
 */
export function getSessionByUid(uid: string): string | null {
  const session = sessionStore.get(uid);
  if (!session) {
    return null;
  }

  // Check expiry
  if (session.expiresAt < Date.now()) {
    sessionStore.delete(uid);
    return null;
  }

  return session.sessionCookie;
}

/**
 * Remove a session (on logout)
 */
export function removeSession(sessionCookie: string): boolean {
  const sessionId = getSessionId(sessionCookie);
  if (!sessionId) {
    return false;
  }

  return sessionStore.delete(sessionId);
}

/**
 * Clear all sessions (for testing)
 */
export function clearAllSessions(): void {
  sessionStore.clear();
}

/**
 * Get session count (for debugging)
 */
export function getSessionCount(): number {
  return sessionStore.size;
}

// Periodic cleanup of expired sessions
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [sessionId, session] of sessionStore.entries()) {
      if (session.expiresAt < now) {
        sessionStore.delete(sessionId);
      }
    }

  }, CLEANUP_INTERVAL);
}
