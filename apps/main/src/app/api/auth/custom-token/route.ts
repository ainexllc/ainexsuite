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

    console.log('🔐 Custom token request - Session cookie exists:', !!sessionCookie);

    if (!sessionCookie) {
      console.error('❌ No session cookie found for custom token generation');
      return NextResponse.json(
        { error: 'No session cookie found. Please log in first.' },
        { status: 401 }
      );
    }

    const adminAuth = getAdminAuth();

    // Verify session cookie (checkRevoked = true)
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    console.log('✅ Session cookie verified for user:', decodedClaims.uid);

    // Create custom token for this user
    const customToken = await adminAuth.createCustomToken(decodedClaims.uid);
    console.log('✅ Custom token generated for SSO app switching');

    return NextResponse.json({ customToken });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Custom token generation failed:', errorMessage);

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
