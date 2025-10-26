import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin-app';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * POST /api/apps/activate
 *
 * Activates an app for the authenticated user.
 *
 * Flow:
 * 1. Verify user from session cookie
 * 2. Update Firestore: add app to appsEligible array
 * 3. Update legacy fields: apps.{app} = true, appsUsed.{app} = timestamp
 * 4. Check if redirect needed (2+ apps && not on main)
 *
 * Security:
 * - Only authenticated users can activate
 * - Users can only activate apps for themselves
 * - Session cookie verified server-side
 *
 * Request Body:
 * {
 *   "app": "notes" | "journey" | "todo" | "track" | "moments" | "grow" | "pulse" | "fit"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "redirect"?: "https://www.ainexsuite.com/workspace?activated=notes"
 * }
 */

const VALID_APPS = ['notes', 'journey', 'todo', 'track', 'moments', 'grow', 'pulse', 'fit'];

export async function POST(request: NextRequest) {
  try {
    const { app } = await request.json();

    // Validate app name
    if (!app || !VALID_APPS.includes(app)) {
      return NextResponse.json(
        { error: 'Invalid app name' },
        { status: 400 }
      );
    }

    // Get session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized - No session cookie' },
        { status: 401 }
      );
    }

    // Verify session and get user ID
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;

    if (!uid) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Update user document
    const adminDb = getAdminFirestore();
    const userRef = adminDb.collection('users').doc(uid);

    await userRef.update({
      appsEligible: FieldValue.arrayUnion(app),
      [`apps.${app}`]: true,
      [`appsUsed.${app}`]: Date.now(),
    });

    // Get updated user data
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const appsEligible = userData?.appsEligible || [];

    // Check if redirect needed
    const hostname = request.headers.get('host') || '';
    const isMainApp = hostname.includes('localhost:3000') || hostname === 'www.ainexsuite.com';

    if (appsEligible.length >= 2 && !isMainApp) {
      // Redirect to Main for multi-app users
      const isDev = process.env.NODE_ENV === 'development';
      const mainUrl = isDev
        ? 'http://localhost:3000'
        : 'https://www.ainexsuite.com';

      return NextResponse.json({
        success: true,
        redirect: `${mainUrl}/workspace?activated=${app}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('App activation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to activate app',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
