/**
 * Simplified Auth Handlers for SSO/SLO
 *
 * Three essential endpoints:
 * - POST /api/auth/login   - Create session from ID token
 * - POST /api/auth/logout  - Clear session cookie
 * - GET  /api/auth/session - Verify session and return user data
 *
 * These replace the complex previous system with a straightforward cookie-based approach.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createSessionCookie,
  verifySessionCookie,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
  getDevSessionData,
  type SessionUser,
} from './session-core';

// ============================================================================
// CORS Helpers
// ============================================================================

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;

  // Production domains
  if (origin.includes('ainexspace.com')) return true;

  // Local development
  if (origin.includes('localhost')) return true;
  if (origin.includes('127.0.0.1')) return true;

  // Local network IPs for dev testing
  const localNetworkPattern = /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?/;
  if (localNetworkPattern.test(origin)) return true;

  return false;
}

function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin');
  const isAllowed = isAllowedOrigin(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : '',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// ============================================================================
// POST /api/auth/login
// ============================================================================

/**
 * Create session cookie from Firebase ID token.
 *
 * Request body: { idToken: string }
 * Response: { success: true, user: SessionUser, devSession?: string }
 *
 * The devSession is returned for client-side localStorage sync in dev mode.
 */
export async function LoginPOST(request: NextRequest): Promise<NextResponse> {
  const corsHeaders = getCorsHeaders(request);

  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create session cookie
    const { sessionCookie, user } = await createSessionCookie(idToken);

    // Prepare response
    const responseData: {
      success: boolean;
      user: SessionUser;
      devSession?: string;
    } = {
      success: true,
      user,
    };

    // In dev mode, include session data for localStorage sync
    if (process.env.NODE_ENV === 'development') {
      responseData.devSession = getDevSessionData(user);
    }

    const response = NextResponse.json(responseData, { headers: corsHeaders });

    // Set the session cookie
    const cookieOptions = getSessionCookieOptions();
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, cookieOptions);

    return response;
  } catch (error) {
    console.error('[LoginPOST] Error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create session', message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ============================================================================
// POST /api/auth/logout
// ============================================================================

/**
 * Clear session cookie (global sign-out across all apps).
 *
 * Because the cookie is scoped to .ainexspace.com, clearing it
 * effectively logs the user out of all 16 subdomains simultaneously.
 */
export async function LogoutPOST(request: NextRequest): Promise<NextResponse> {
  const corsHeaders = getCorsHeaders(request);

  try {
    const response = NextResponse.json(
      { success: true, message: 'Signed out successfully' },
      { headers: corsHeaders }
    );

    // Clear the session cookie
    const cookieOptions = getSessionCookieOptions(true); // forClear = true
    response.cookies.set(SESSION_COOKIE_NAME, '', cookieOptions);

    return response;
  } catch (error) {
    console.error('[LogoutPOST] Error:', error);

    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ============================================================================
// GET /api/auth/session
// ============================================================================

/**
 * Verify session cookie and return user data.
 *
 * Response: { authenticated: boolean, user: SessionUser | null }
 */
export async function SessionGET(request: NextRequest): Promise<NextResponse> {
  const corsHeaders = getCorsHeaders(request);

  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { headers: corsHeaders }
      );
    }

    const user = await verifySessionCookie(sessionCookie);

    if (!user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { authenticated: true, user },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[SessionGET] Error:', error);

    return NextResponse.json(
      { authenticated: false, user: null },
      { headers: corsHeaders }
    );
  }
}

// ============================================================================
// POST /api/auth/custom-token
// ============================================================================

/**
 * Exchange session cookie for Firebase custom token.
 *
 * This is needed because Firestore security rules require request.auth.uid,
 * which only exists when Firebase Auth is signed in on the client.
 *
 * Response: { customToken: string }
 */
export async function CustomTokenPOST(request: NextRequest): Promise<NextResponse> {
  const corsHeaders = getCorsHeaders(request);

  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No session cookie' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Verify session and get user
    const user = await verifySessionCookie(sessionCookie);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Create Firebase custom token using Admin SDK
    const { getAdminAuth } = await import('./admin');
    const customToken = await getAdminAuth().createCustomToken(user.uid);

    return NextResponse.json(
      { customToken },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[CustomTokenPOST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create custom token' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ============================================================================
// OPTIONS Handlers (CORS preflight)
// ============================================================================

export async function CustomTokenOPTIONS(request: NextRequest): Promise<NextResponse> {
  const corsHeaders = getCorsHeaders(request);
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function LoginOPTIONS(request: NextRequest): Promise<NextResponse> {
  const corsHeaders = getCorsHeaders(request);
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function LogoutOPTIONS(request: NextRequest): Promise<NextResponse> {
  const corsHeaders = getCorsHeaders(request);
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function SessionOPTIONS(request: NextRequest): Promise<NextResponse> {
  const corsHeaders = getCorsHeaders(request);
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// ============================================================================
// Re-export for convenience
// ============================================================================

export type { SessionUser };
