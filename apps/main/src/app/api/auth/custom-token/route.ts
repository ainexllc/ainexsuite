import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase/admin-app';

/**
 * POST /api/auth/custom-token
 *
 * Generates a Firebase custom token from a verified session cookie.
 * Used for SSO bootstrap - converts server-side session to client-side auth.
 *
 * Flow:
 * 1. Client sends __session cookie (httpOnly) OR sessionCookie in body (dev mode)
 * 2. Server verifies cookie with Firebase Admin SDK
 * 3. Server creates custom token for the user
 * 4. Client uses custom token with signInWithCustomToken()
 *
 * Security:
 * - Primary: reads httpOnly cookies (client can't read/modify)
 * - Dev fallback: accepts sessionCookie in body for cross-port auth
 * - Verifies session cookie hasn't expired
 * - Validates user exists in Firebase Auth
 */
export async function POST(request: NextRequest) {
  try {
    // Try to get session cookie from httpOnly cookie first
    const cookieStore = await cookies();
    let sessionCookie = cookieStore.get('__session')?.value;

    // Debug logging
    const allCookies = cookieStore.getAll();
    console.log('[SSO DEBUG custom-token] All cookies:', allCookies.map(c => c.name).join(', '));
    console.log('[SSO DEBUG custom-token] __session cookie found:', !!sessionCookie);

    // In development, also check request body (for cross-port auth)
    if (!sessionCookie && process.env.NODE_ENV === 'development') {
      try {
        const body = await request.json();
        sessionCookie = body.sessionCookie;
      } catch {
        // No body or invalid JSON - that's fine
      }
    }

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No session cookie found' },
        { status: 401 }
      );
    }

    const adminAuth = getAdminAuth();

    // Verify session cookie (checkRevoked = true)
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);

    // Create custom token for this user
    const customToken = await adminAuth.createCustomToken(decodedClaims.uid);

    return NextResponse.json({ customToken });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Provide more specific error messages
    let userMessage = 'Failed to generate authentication token';
    if (errorMessage.includes('expired')) {
      userMessage = 'Session expired';
    } else if (errorMessage.includes('revoked')) {
      userMessage = 'Session revoked';
    }

    return NextResponse.json(
      { error: userMessage },
      { status: 401 }
    );
  }
}
