/**
 * Session Sync Handler
 *
 * This endpoint allows apps to sync their session with the Auth Hub (main app).
 * When a user logs into any app, that app can call this endpoint to ensure
 * the main app also has the session, enabling cross-app SSO.
 *
 * Flow:
 * 1. User logs into notes app (port 3001)
 * 2. Notes app calls main app's /api/auth/session-sync with the session cookie
 * 3. Main app stores the session in memory (for dev) or sets cookie (for prod)
 * 4. Later, when user visits journey (port 3002), SSOBridge can get auth from main
 *
 * Note: In development, we use an in-memory store because cross-origin cookies
 * don't work across different ports. In production, shared cookies work fine.
 */

import { NextRequest, NextResponse } from 'next/server';
import { storeSession } from './sso-session-store';

/**
 * Cookie options for production
 */
const PROD_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
  domain: '.ainexspace.com', // Share across all subdomains
  maxAge: 60 * 60 * 24 * 5, // 5 days
};

/**
 * Helper to determine if origin is allowed
 */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;

  // Production domains
  if (origin.includes('ainexspace.com')) return true;

  // Local development
  if (origin.includes('localhost')) return true;
  if (origin.includes('127.0.0.1')) return true;

  // Local network IPs for development testing (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  const localNetworkPattern = /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?/;
  if (localNetworkPattern.test(origin)) return true;

  return false;
}

/**
 * Helper to get CORS headers
 */
function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin');
  const isAllowed = isAllowedOrigin(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : '',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

/**
 * POST /api/auth/session-sync
 *
 * Receive a session cookie from another app and set it locally.
 * This allows the auth hub to have the session even if the user logged in elsewhere.
 *
 * Body: { sessionCookie: string }
 */
export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  const isDev = process.env.NODE_ENV === 'development';

  try {
    const body = await request.json();
    const { sessionCookie } = body;

    if (!sessionCookie || typeof sessionCookie !== 'string') {
      return NextResponse.json(
        { error: 'Missing sessionCookie' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate the session cookie format (basic check)
    try {
      // In dev, it's base64 encoded JSON
      if (isDev) {
        const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString());
        if (!decoded.uid) {
          throw new Error('Invalid session cookie: missing uid');
        }
      }
      // In production, it would be a Firebase session cookie that we could verify
      // For now, we trust it came from a valid origin
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid session cookie format' },
        { status: 400, headers: corsHeaders }
      );
    }

    // In development, store in memory (cookies don't work cross-origin)
    if (isDev) {
      // Log who is calling session-sync (to debug re-syncing after logout)
      const origin = request.headers.get('origin');
      // eslint-disable-next-line no-console
      console.log(`[Session Sync] Storing session from origin: ${origin}`);

      const stored = storeSession(sessionCookie);
      if (!stored) {
        return NextResponse.json(
          { error: 'Failed to store session' },
          { status: 500, headers: corsHeaders }
        );
      }
      // eslint-disable-next-line no-console
      console.log(`[Session Sync] Session stored successfully`);
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // In production, set the cookie (shared domain works)
    const response = NextResponse.json(
      { success: true },
      { headers: corsHeaders }
    );

    const cookieOptions = PROD_COOKIE_OPTIONS;
    response.cookies.set('__session', sessionCookie, cookieOptions);

    return response;
  } catch (error) {
    console.error('[Session Sync] Error:', error);
    return NextResponse.json(
      { error: 'Failed to sync session' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * OPTIONS /api/auth/session-sync
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const isAllowed = isAllowedOrigin(origin);

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': isAllowed && origin ? origin : '',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
