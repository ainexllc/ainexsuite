/**
 * Middleware Utilities for Next.js App Router
 *
 * Provides server-side route protection using session cookies.
 * Used in middleware.ts files across all 16 apps.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  DEV_SESSION_KEY,
  verifySessionCookie,
  type SessionUser,
} from './session-core';

// ============================================================================
// Types
// ============================================================================

export interface MiddlewareConfig {
  /**
   * URL to redirect to when unauthenticated.
   * Defaults to '/' (root of current subdomain)
   */
  loginUrl?: string;

  /**
   * Paths that require authentication.
   * Defaults to ['/workspace']
   */
  protectedPaths?: string[];

  /**
   * Paths that are always public (skip auth check).
   * Defaults to ['/', '/api', '/_next', '/favicon.ico']
   */
  publicPaths?: string[];
}

// ============================================================================
// Session Verification from Request
// ============================================================================

/**
 * Verify session from a Next.js middleware request.
 * Checks the httpOnly session cookie.
 *
 * Note: In middleware, we can only read cookies, not localStorage.
 * For dev mode cross-port SSO, the client handles localStorage → cookie sync.
 *
 * @returns SessionUser if authenticated, null otherwise
 */
export async function verifySessionFromRequest(
  request: NextRequest
): Promise<SessionUser | null> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  return verifySessionCookie(sessionCookie);
}

/**
 * Quick check if session cookie exists (no verification).
 * Use for fast path when you just need to know if a cookie is present.
 */
export function hasSessionCookie(request: NextRequest): boolean {
  return !!request.cookies.get(SESSION_COOKIE_NAME)?.value;
}

// ============================================================================
// Response Helpers
// ============================================================================

/**
 * Create a redirect response to the login page.
 * Preserves the original URL as a 'redirect' query param for post-login redirect.
 */
export function createLoginRedirect(
  request: NextRequest,
  loginUrl = '/'
): NextResponse {
  const url = new URL(loginUrl, request.url);

  // Add redirect param so login page can redirect back after auth
  const originalPath = request.nextUrl.pathname + request.nextUrl.search;
  if (originalPath !== '/' && originalPath !== loginUrl) {
    url.searchParams.set('redirect', originalPath);
  }

  return NextResponse.redirect(url);
}

/**
 * Create a 401 Unauthorized JSON response.
 * Use for API routes that require authentication.
 */
export function createUnauthorizedResponse(message = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { error: message, authenticated: false },
    { status: 401 }
  );
}

// ============================================================================
// Path Matching Helpers
// ============================================================================

/**
 * Check if a path matches any of the given patterns.
 * Supports exact matches and prefix matches (path starts with pattern).
 */
export function pathMatches(path: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    // Exact match
    if (path === pattern) return true;

    // Prefix match (pattern ends with *)
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      return path.startsWith(prefix);
    }

    // Path starts with pattern (implicit prefix)
    return path.startsWith(pattern + '/') || path === pattern;
  });
}

/**
 * Check if a path should be protected (requires auth).
 */
export function isProtectedPath(
  path: string,
  config: MiddlewareConfig = {}
): boolean {
  const protectedPaths = config.protectedPaths || ['/workspace'];
  const publicPaths = config.publicPaths || ['/', '/api', '/_next', '/favicon.ico', '/static'];

  // Check public paths first (they're never protected)
  if (publicPaths.some(p => path === p || path.startsWith(p + '/'))) {
    // Exception: /api/auth routes that need protection
    if (path.startsWith('/api/auth/') && !path.includes('/login') && !path.includes('/logout')) {
      // Most auth routes should be accessible
    }
    return false;
  }

  // Check if path matches protected patterns
  return pathMatches(path, protectedPaths);
}

// ============================================================================
// Main Middleware Handler
// ============================================================================

/**
 * Create a middleware handler for route protection.
 *
 * Usage in apps/[app]/middleware.ts:
 * ```ts
 * import { createAuthMiddleware } from '@ainexsuite/auth/server';
 *
 * export const middleware = createAuthMiddleware();
 * export const config = { matcher: ['/workspace/:path*'] };
 * ```
 */
export function createAuthMiddleware(config: MiddlewareConfig = {}) {
  const { loginUrl = '/' } = config;

  return async function middleware(request: NextRequest): Promise<NextResponse> {
    const path = request.nextUrl.pathname;

    // Skip non-protected paths
    if (!isProtectedPath(path, config)) {
      return NextResponse.next();
    }

    // Check if session cookie exists (Edge-compatible - no Firebase Admin)
    // Full verification happens in API routes and client-side auth context
    // This is a gatekeeper check - if no cookie, redirect to login
    if (!hasSessionCookie(request)) {
      return createLoginRedirect(request, loginUrl);
    }

    // Cookie exists - allow request to proceed
    // Full session verification happens in the auth context
    return NextResponse.next();
  };
}

// ============================================================================
// API Route Protection
// ============================================================================

/**
 * Protect an API route handler.
 * Returns 401 if not authenticated, otherwise calls the handler with user info.
 *
 * Usage:
 * ```ts
 * import { withAuth } from '@ainexsuite/auth/server';
 *
 * export const GET = withAuth(async (request, user) => {
 *   return NextResponse.json({ userId: user.uid });
 * });
 * ```
 */
export function withAuth<T>(
  handler: (request: NextRequest, user: SessionUser) => Promise<T>
) {
  return async (request: NextRequest): Promise<T | NextResponse> => {
    const session = await verifySessionFromRequest(request);

    if (!session) {
      return createUnauthorizedResponse();
    }

    return handler(request, session);
  };
}

// ============================================================================
// Exports for convenience
// ============================================================================

export { SESSION_COOKIE_NAME, DEV_SESSION_KEY };
export type { SessionUser };
