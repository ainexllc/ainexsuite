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
 * 1. Client sends __session cookie
 * 2. Server verifies cookie with Firebase Admin SDK
 * 3. Server creates custom token for the user
 * 4. Client uses custom token with signInWithCustomToken()
 *
 * Security:
 * - Only accepts HttpOnly cookies (client can't read/modify)
 * - Verifies session cookie hasn't expired
 * - Validates user exists in Firebase Auth
 */
export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    // Debug: Log all cookies received
    const allCookies = cookieStore.getAll();
    console.log('🔐 custom-token: All cookies received:', allCookies.map(c => c.name));
    console.log('🔐 custom-token: __session cookie exists:', !!sessionCookie);

    if (!sessionCookie) {
      console.log('🔐 custom-token: No __session cookie found in request');
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

    return NextResponse.json(
      {
        error: 'Failed to generate custom token',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 401 }
    );
  }
}
