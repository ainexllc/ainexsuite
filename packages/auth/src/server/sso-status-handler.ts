/**
 * SSO Status Handler
 *
 * This endpoint is used by the SSOBridge to check if a user is authenticated
 * on the Auth Hub (main app) and return the session cookie for cross-app SSO.
 *
 * Simplified Flow (no iframe):
 * 1. SSOBridge on another app calls this endpoint directly via fetch()
 * 2. This endpoint reads the __session cookie and returns it if valid
 * 3. The calling app uses the session cookie to bootstrap authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from './admin';
import { getLatestSession } from './sso-session-store';

/**
 * Helper to determine if origin is allowed for CORS
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
 * Helper to get CORS headers - more permissive for SSO
 */
function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin');
  const isAllowed = isAllowedOrigin(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : '',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

/**
 * GET /api/auth/sso-status
 *
 * Check if user has a valid session and return the session cookie for cross-app SSO.
 * The calling app will use this cookie to bootstrap authentication locally.
 *
 * Returns:
 * - { authenticated: true, sessionCookie: string } if session is valid
 * - { authenticated: false } if no session or invalid session
 */
export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  const isDev = process.env.NODE_ENV === 'development';

  try {
    // First check the cookie (works in production with shared domain)
    let sessionCookie = request.cookies.get('__session')?.value;

    // In development, also check the in-memory store (cross-origin cookies don't work)
    if (!sessionCookie && isDev) {
      sessionCookie = getLatestSession() ?? undefined;
    }

    if (!sessionCookie) {
      return NextResponse.json(
        { authenticated: false },
        { headers: corsHeaders }
      );
    }

    // For local development, validate the simple base64 session
    if (isDev) {
      try {
        const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString());
        const uid = decoded.uid;

        if (!uid) {
          return NextResponse.json(
            { authenticated: false },
            { headers: corsHeaders }
          );
        }

        // Return the session cookie so the calling app can use it
        return NextResponse.json(
          {
            authenticated: true,
            sessionCookie: sessionCookie,
          },
          { headers: corsHeaders }
        );
      } catch {
        return NextResponse.json(
          { authenticated: false },
          { headers: corsHeaders }
        );
      }
    }

    // Production: Verify session cookie before returning it (throws if invalid)
    const adminAuth = getAdminAuth();
    await adminAuth.verifySessionCookie(sessionCookie, true);

    return NextResponse.json(
      {
        authenticated: true,
        sessionCookie: sessionCookie,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    // Session cookie is invalid or expired
    console.error('[SSO Status] Session verification failed:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { authenticated: false },
      { headers: corsHeaders }
    );
  }
}

/**
 * OPTIONS /api/auth/sso-status
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
