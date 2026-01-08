/**
 * Auth Token Cache for Navigation
 *
 * Caches auth tokens to enable instant navigation between apps.
 * Pre-fetches tokens in the background so navigation doesn't require
 * a synchronous fetch that blocks the UI.
 *
 * Flow:
 * 1. After successful auth, prefetch and cache a token
 * 2. When navigating, use cached token (instant) or fetch new one
 * 3. Fire-and-forget refresh to keep cache warm
 *
 * Savings: ~150ms per navigation (eliminates blocking fetch)
 */

interface CachedToken {
  token: string;
  sessionCookie?: string;
  devMode?: boolean;
  expiresAt: number;
  uid: string;
}

const TOKEN_CACHE_KEY = '__ainex_token_cache';
const TOKEN_TTL_MS = 4 * 60 * 1000; // 4 minutes (tokens valid for 5 min, refresh early)

// In-memory cache for fastest access
let memoryCache: CachedToken | null = null;

/**
 * Get cached token if valid
 */
export function getCachedToken(): CachedToken | null {
  // Try memory cache first (fastest)
  if (memoryCache && Date.now() < memoryCache.expiresAt) {
    return memoryCache;
  }

  // Try sessionStorage
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const cached = sessionStorage.getItem(TOKEN_CACHE_KEY);
    if (!cached) {
      return null;
    }

    const data = JSON.parse(cached) as CachedToken;

    // Check expiry
    if (Date.now() >= data.expiresAt) {
      sessionStorage.removeItem(TOKEN_CACHE_KEY);
      memoryCache = null;
      return null;
    }

    // Update memory cache
    memoryCache = data;
    return data;
  } catch {
    return null;
  }
}

/**
 * Cache a token
 */
function setCachedToken(
  token: string,
  uid: string,
  options?: { sessionCookie?: string; devMode?: boolean }
): void {
  const data: CachedToken = {
    token,
    sessionCookie: options?.sessionCookie,
    devMode: options?.devMode,
    expiresAt: Date.now() + TOKEN_TTL_MS,
    uid,
  };

  // Update memory cache
  memoryCache = data;

  // Persist to sessionStorage
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(TOKEN_CACHE_KEY, JSON.stringify(data));
    } catch {
      // sessionStorage full or disabled
    }
  }
}

/**
 * Invalidate the token cache
 * Called on logout
 */
export function invalidateTokenCache(): void {
  memoryCache = null;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(TOKEN_CACHE_KEY);
    } catch {
      // Ignore
    }
  }
}

/**
 * Prefetch and cache a token
 * Called after successful auth to warm the cache
 */
export async function prefetchToken(): Promise<void> {
  try {
    const response = await fetch('/api/auth/custom-token', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    // Dev mode with session cookie
    if (data.devMode && data.sessionCookie) {
      try {
        const decoded = JSON.parse(Buffer.from(data.sessionCookie, 'base64').toString());
        setCachedToken(data.sessionCookie, decoded.uid, {
          sessionCookie: data.sessionCookie,
          devMode: true,
        });
      } catch {
        // Invalid session cookie
      }
      return;
    }

    // Production mode with custom token
    if (data.customToken) {
      // Extract uid from token (JWT payload)
      try {
        const parts = data.customToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          setCachedToken(data.customToken, payload.uid || payload.sub);
        }
      } catch {
        // Invalid token format
      }
    }
  } catch {
    // Prefetch failed - not critical
  }
}

/**
 * Get token for navigation (uses cache or fetches new)
 * Returns immediately from cache if available
 */
export async function getTokenForNavigation(): Promise<{
  token?: string;
  sessionCookie?: string;
  devMode?: boolean;
} | null> {
  // Try cache first
  const cached = getCachedToken();
  if (cached) {
    // Fire-and-forget refresh to keep cache warm
    prefetchToken().catch(() => {});

    if (cached.devMode) {
      return {
        sessionCookie: cached.sessionCookie,
        devMode: true,
      };
    }
    return { token: cached.token };
  }

  // Cache miss - fetch synchronously
  try {
    const response = await fetch('/api/auth/custom-token', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Cache for next time
    if (data.devMode && data.sessionCookie) {
      try {
        const decoded = JSON.parse(Buffer.from(data.sessionCookie, 'base64').toString());
        setCachedToken(data.sessionCookie, decoded.uid, {
          sessionCookie: data.sessionCookie,
          devMode: true,
        });
      } catch {
        // Invalid session cookie
      }
      return {
        sessionCookie: data.sessionCookie,
        devMode: true,
      };
    }

    if (data.customToken) {
      try {
        const parts = data.customToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          setCachedToken(data.customToken, payload.uid || payload.sub);
        }
      } catch {
        // Invalid token format
      }
      return { token: data.customToken };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if token is cached
 */
export function isTokenCached(): boolean {
  return getCachedToken() !== null;
}
