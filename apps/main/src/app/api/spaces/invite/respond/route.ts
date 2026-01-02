import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminFirestore } from '@ainexsuite/auth/server';
import { FieldValue } from 'firebase-admin/firestore';
import type { SpaceInvitation, Space, SpaceMember } from '@ainexsuite/types';

/**
 * POST /api/spaces/invite/respond
 *
 * Accept or decline an invitation.
 *
 * Request Body:
 * {
 *   invitationId: string;
 *   spaceCollection: string; // e.g., 'noteSpaces', 'journalSpaces'
 *   action: 'accept' | 'decline';
 * }
 *
 * Response:
 * { success: true, spaceId?: string }
 * or
 * { error: string }
 */

const INVITATIONS_COLLECTION = 'spaceInvitations';

export async function POST(request: NextRequest) {
  try {
    const { invitationId, spaceCollection, action } = await request.json();

    // Validate required fields
    if (!invitationId || !spaceCollection || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: invitationId, spaceCollection, action' },
        { status: 400 }
      );
    }

    // Validate action
    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be accept or decline' },
        { status: 400 }
      );
    }

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

    // Get the invitation
    const invitationRef = adminDb.collection(INVITATIONS_COLLECTION).doc(invitationId);
    const invitationDoc = await invitationRef.get();

    if (!invitationDoc.exists) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    const invitation = invitationDoc.data() as SpaceInvitation;

    // Verify invitation is pending
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: `Invitation has already been ${invitation.status}` },
        { status: 400 }
      );
    }

    // Verify invitation hasn't expired
    if (invitation.expiresAt < Date.now()) {
      await invitationRef.update({
        status: 'expired',
      });
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    // Verify the user is the intended recipient
    if (invitation.email !== userEmail && invitation.inviteeUid !== userUid) {
      return NextResponse.json(
        { error: 'This invitation is not for you' },
        { status: 403 }
      );
    }

    const now = Date.now();

    if (action === 'decline') {
      // Update invitation status
      await invitationRef.update({
        status: 'declined',
        respondedAt: now,
      });

      // Decrement pending invite count on space
      const spaceRef = adminDb.collection(spaceCollection).doc(invitation.spaceId);
      await spaceRef.update({
        pendingInviteCount: FieldValue.increment(-1),
      });

      return NextResponse.json({ success: true });
    }

    // Accept invitation
    const spaceRef = adminDb.collection(spaceCollection).doc(invitation.spaceId);
    const spaceDoc = await spaceRef.get();

    if (!spaceDoc.exists) {
      return NextResponse.json(
        { error: 'Space no longer exists' },
        { status: 404 }
      );
    }

    const spaceData = spaceDoc.data() as Space;

    // Check if user is already a member
    const existingMember = spaceData.members?.find((m) => m.uid === userUid);
    if (existingMember) {
      // Mark invitation as accepted anyway
      await invitationRef.update({
        status: 'accepted',
        respondedAt: now,
      });

      return NextResponse.json({
        success: true,
        spaceId: invitation.spaceId,
        alreadyMember: true,
      });
    }

    // Create new member
    const newMember: SpaceMember = {
      uid: userUid,
      displayName: userRecord.displayName || undefined,
      email: userEmail,
      photoURL: userRecord.photoURL || undefined,
      role: invitation.role,
      joinedAt: now,
      addedBy: invitation.invitedBy,
    };

    // Add user to space
    await spaceRef.update({
      members: FieldValue.arrayUnion(newMember),
      memberUids: FieldValue.arrayUnion(userUid),
      pendingInviteCount: FieldValue.increment(-1),
    });

    // Update invitation status
    await invitationRef.update({
      status: 'accepted',
      respondedAt: now,
      inviteeUid: userUid,
    });

    // Notify the inviter that their invitation was accepted
    const inviterNotification = {
      type: 'space_accepted',
      title: `${userRecord.displayName || userEmail} joined ${spaceData.name}`,
      message: 'Your invitation was accepted',
      timestamp: now,
      read: false,
      icon: 'UserCheck',
      actionUrl: `/spaces/${invitation.spaceId}/members`,
      actionLabel: 'View Members',
      metadata: {
        spaceId: invitation.spaceId,
        spaceName: spaceData.name,
        acceptedByName: userRecord.displayName || userEmail,
        acceptedByPhoto: userRecord.photoURL,
      },
    };

    await adminDb
      .collection('users')
      .doc(invitation.invitedBy)
      .collection('notifications')
      .add(inviterNotification);

    // Notify other members about the new member
    const otherMembers = spaceData.members?.filter(
      (m) => m.uid !== userUid && m.uid !== invitation.invitedBy
    );

    if (otherMembers && otherMembers.length > 0) {
      const batch = adminDb.batch();

      for (const member of otherMembers) {
        const memberNotifRef = adminDb
          .collection('users')
          .doc(member.uid)
          .collection('notifications')
          .doc();

        batch.set(memberNotifRef, {
          type: 'space_joined',
          title: `${userRecord.displayName || userEmail} joined ${spaceData.name}`,
          message: 'A new member has joined your space',
          timestamp: now,
          read: false,
          icon: 'Users',
          actionUrl: `/spaces/${invitation.spaceId}/members`,
          actionLabel: 'View Members',
          metadata: {
            spaceId: invitation.spaceId,
            spaceName: spaceData.name,
            newMemberName: userRecord.displayName || userEmail,
            newMemberPhoto: userRecord.photoURL,
          },
        });
      }

      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      spaceId: invitation.spaceId,
      spaceName: spaceData.name,
    });
  } catch (error) {
    console.error('Error responding to invitation:', error);
    return NextResponse.json(
      {
        error: 'Failed to respond to invitation',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
