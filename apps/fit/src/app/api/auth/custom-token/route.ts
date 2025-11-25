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

    console.log('[SSO DEBUG] custom-token: httpOnly cookie exists:', !!sessionCookie);

    // In development, also check request body (for cross-port auth)
    if (!sessionCookie && process.env.NODE_ENV === 'development') {
      try {
        const body = await request.json();
        sessionCookie = body.sessionCookie;
        console.log('[SSO DEBUG] custom-token: body sessionCookie exists:', !!sessionCookie);
      } catch {
        // No body or invalid JSON - that's fine
      }
    }

    if (!sessionCookie) {
      console.log('[SSO DEBUG] custom-token: No session cookie found');
      return NextResponse.json(
        { error: 'No session cookie found. Please log in first.' },
        { status: 401 }
      );
    }

    const adminAuth = getAdminAuth();

    // Verify session cookie (checkRevoked = true)
    console.log('[SSO DEBUG] custom-token: Verifying session cookie...');
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    console.log('[SSO DEBUG] custom-token: Session verified for user:', decodedClaims.uid);

    // Create custom token for this user
    const customToken = await adminAuth.createCustomToken(decodedClaims.uid);
    console.log('[SSO DEBUG] custom-token: Custom token created');

    return NextResponse.json({ customToken });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[SSO DEBUG] custom-token: Error:', errorMessage);

    // Provide more specific error messages
    let userMessage = 'Failed to generate authentication token';
    if (errorMessage.includes('expired')) {
      userMessage = 'Your session has expired. Please log in again.';
    } else if (errorMessage.includes('revoked')) {
      userMessage = 'Your session has been revoked. Please log in again.';
    }

    return NextResponse.json(
      {
        error: userMessage,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 401 }
    );
  }
}
