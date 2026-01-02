import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@ainexsuite/auth/server';
import type { SpaceInvitation } from '@ainexsuite/types';

/**
 * GET /api/spaces/invite/token?token=xxx
 *
 * Get invitation details by token (public, no auth required).
 * Used for email invitation links to display invitation info
 * before the user decides to accept/decline.
 *
 * Response:
 * { invitation: SpaceInvitation (with token redacted) }
 * or
 * { error: string }
 */

const INVITATIONS_COLLECTION = 'spaceInvitations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token parameter' },
        { status: 400 }
      );
    }

    // Validate token format (should be a 48-char hex string)
    if (!/^[a-f0-9]{48}$/i.test(token)) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 400 }
      );
    }

    const adminDb = getAdminFirestore();

    // Query for invitation by token
    const invitationsQuery = await adminDb
      .collection(INVITATIONS_COLLECTION)
      .where('token', '==', token)
      .limit(1)
      .get();

    if (invitationsQuery.empty) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    const invitationDoc = invitationsQuery.docs[0];
    const invitationData = invitationDoc.data() as Omit<SpaceInvitation, 'id'>;

    // Check if expired
    if (invitationData.expiresAt < Date.now()) {
      // Mark as expired if not already
      if (invitationData.status === 'pending') {
        await invitationDoc.ref.update({
          status: 'expired',
        });
      }

      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 } // Gone
      );
    }

    // Check if already responded
    if (invitationData.status !== 'pending') {
      return NextResponse.json(
        { error: `Invitation has already been ${invitationData.status}` },
        { status: 410 } // Gone
      );
    }

    // Return invitation details (redact token for security)
    const invitation: SpaceInvitation = {
      id: invitationDoc.id,
      ...invitationData,
      token: '', // Redact token from response
    };

    return NextResponse.json({
      invitation,
    });
  } catch (error) {
    console.error('Error fetching invitation by token:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch invitation',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
