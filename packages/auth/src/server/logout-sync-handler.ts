/**
 * Logout Sync Handler
 *
 * This endpoint allows apps to sync logout with the Auth Hub (main app).
 * When a user logs out of any app, that app calls this endpoint to ensure
 * the main app's in-memory session store is also cleared.
 *
 * This fixes the issue where logging out of one app doesn't log out of others
 * because the in-memory session store still has the session.
 *
 * Note: In development, we use an in-memory store because cross-origin cookies
 * don't work across different ports. In production, shared cookies work fine,
 * but this provides an extra layer of consistency.
 */

import { NextRequest, NextResponse } from 'next/server';
import { removeSession, removeSessionByUid } from './sso-session-store';

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
 * POST /api/auth/logout-sync
 *
 * Clear a session from the in-memory store.
 * Accepts either uid or sessionCookie to identify the session.
 *
 * Body: { uid?: string, sessionCookie?: string }
 */
export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  try {
    const body = await request.json();
    const { uid, sessionCookie } = body;

    if (!uid && !sessionCookie) {
      return NextResponse.json(
        { error: 'Missing uid or sessionCookie' },
        { status: 400, headers: corsHeaders }
      );
    }

    let removed = false;

    // Prefer uid if provided (more direct)
    if (uid) {
      removed = removeSessionByUid(uid);
      // eslint-disable-next-line no-console
      console.log(`[Logout Sync] Removed session for uid ${uid}: ${removed}`);
    } else if (sessionCookie) {
      removed = removeSession(sessionCookie);
      // eslint-disable-next-line no-console
      console.log(`[Logout Sync] Removed session by cookie: ${removed}`);
    }

    return NextResponse.json({ success: true, removed }, { headers: corsHeaders });
  } catch (error) {
    console.error('[Logout Sync] Error:', error);
    return NextResponse.json(
      { error: 'Failed to sync logout' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * OPTIONS /api/auth/logout-sync
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
