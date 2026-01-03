import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminFirestore } from '@ainexsuite/auth/server';
import type { SpaceInvitation } from '@ainexsuite/types';

/**
 * GET /api/spaces/invite/pending
 *
 * Fetches all pending invitations for the current user.
 * Queries by both email and UID to catch invitations sent before
 * the user had an account.
 *
 * Response:
 * { invitations: SpaceInvitation[] }
 * or
 * { error: string }
 */

const INVITATIONS_COLLECTION = 'spaceInvitations';

export async function GET() {
  try {
    // Get session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized - Not logged in' },
        { status: 401 }
      );
    }

    // Verify session and get user
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userUid = decodedClaims.uid;

    if (!userUid) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get user details
    const userRecord = await adminAuth.getUser(userUid);
    const userEmail = userRecord.email?.toLowerCase();

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    const adminDb = getAdminFirestore();
    const now = Date.now();

    // Query pending invitations by email
    const emailQuery = adminDb
      .collection(INVITATIONS_COLLECTION)
      .where('email', '==', userEmail)
      .where('status', '==', 'pending')
      .where('expiresAt', '>', now);

    // Query pending invitations by UID
    const uidQuery = adminDb
      .collection(INVITATIONS_COLLECTION)
      .where('inviteeUid', '==', userUid)
      .where('status', '==', 'pending')
      .where('expiresAt', '>', now);

    // Execute both queries in parallel
    const [emailSnapshot, uidSnapshot] = await Promise.all([
      emailQuery.get(),
      uidQuery.get(),
    ]);

    // Combine results and deduplicate by invitation ID
    const invitationsMap = new Map<string, SpaceInvitation>();

    emailSnapshot.docs.forEach((doc) => {
      invitationsMap.set(doc.id, {
        id: doc.id,
        ...doc.data(),
      } as SpaceInvitation);
    });

    uidSnapshot.docs.forEach((doc) => {
      if (!invitationsMap.has(doc.id)) {
        invitationsMap.set(doc.id, {
          id: doc.id,
          ...doc.data(),
        } as SpaceInvitation);
      }
    });

    // Convert to array and sort by invitation date (newest first)
    const invitations = Array.from(invitationsMap.values()).sort(
      (a, b) => b.invitedAt - a.invitedAt
    );

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Error fetching pending invitations:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch invitations',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
