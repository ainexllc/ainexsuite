import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminFirestore } from '@ainexsuite/auth/server';
import { FieldValue } from 'firebase-admin/firestore';
import type { SpaceInvitation, Space, SpaceMember } from '@ainexsuite/types';

const INVITATIONS_COLLECTION = 'spaceInvitations';

async function getUserIdFromSession(sessionCookie: string): Promise<string | null> {
  const adminAuth = getAdminAuth();

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims.uid;
  } catch {
    try {
      const decodedToken = await adminAuth.verifyIdToken(sessionCookie);
      return decodedToken.uid;
    } catch {
      try {
        const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'));
        return decoded.uid || null;
      } catch {
        return null;
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { invitationId, spaceCollection, action, confirmReplacement } = await request.json();

    if (!invitationId || !spaceCollection || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: invitationId, spaceCollection, action' },
        { status: 400 }
      );
    }

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be accept or decline' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized - Not logged in' },
        { status: 401 }
      );
    }

    const userUid = await getUserIdFromSession(sessionCookie);
    if (!userUid) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const adminAuth = getAdminAuth();
    const userRecord = await adminAuth.getUser(userUid);
    const userEmail = userRecord.email?.toLowerCase();

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    const adminDb = getAdminFirestore();
    const invitationRef = adminDb.collection(INVITATIONS_COLLECTION).doc(invitationId);
    const invitationDoc = await invitationRef.get();

    if (!invitationDoc.exists) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    const invitation = invitationDoc.data() as SpaceInvitation;

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: `Invitation has already been ${invitation.status}` },
        { status: 400 }
      );
    }

    if (invitation.expiresAt < Date.now()) {
      await invitationRef.update({ status: 'expired' });
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    if (invitation.email !== userEmail && invitation.inviteeUid !== userUid) {
      return NextResponse.json(
        { error: 'This invitation is not for you' },
        { status: 403 }
      );
    }

    const now = Date.now();

    if (action === 'decline') {
      await invitationRef.update({
        status: 'declined',
        respondedAt: now,
      });

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

    const existingMember = spaceData.members?.find((m) => m.uid === userUid);
    if (existingMember) {
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

    // Check for existing space of same type
    if (invitation.spaceType !== 'personal') {
      const existingSpacesQuery = await adminDb
        .collection(spaceCollection)
        .where('ownerId', '==', userUid)
        .where('type', '==', invitation.spaceType)
        .limit(1)
        .get();

      if (!existingSpacesQuery.empty) {
        const existingSpace = existingSpacesQuery.docs[0];
        const existingSpaceData = existingSpace.data() as Space;

        if (!confirmReplacement) {
          return NextResponse.json({
            requiresConfirmation: true,
            existingSpaceId: existingSpace.id,
            existingSpaceName: existingSpaceData.name,
            spaceType: invitation.spaceType,
          });
        }

        await adminDb.collection(spaceCollection).doc(existingSpace.id).delete();
      }
    }

    const newMember: SpaceMember = {
      uid: userUid,
      displayName: userRecord.displayName || undefined,
      email: userEmail,
      photoURL: userRecord.photoURL || undefined,
      role: invitation.role,
      joinedAt: now,
      addedBy: invitation.invitedBy,
    };

    await spaceRef.update({
      members: FieldValue.arrayUnion(newMember),
      memberUids: FieldValue.arrayUnion(userUid),
      pendingInviteCount: FieldValue.increment(-1),
    });

    await invitationRef.update({
      status: 'accepted',
      respondedAt: now,
      inviteeUid: userUid,
    });

    // Notify inviter
    await adminDb
      .collection('users')
      .doc(invitation.invitedBy)
      .collection('notifications')
      .add({
        type: 'space_accepted',
        title: `${userRecord.displayName || userEmail} joined ${spaceData.name}`,
        message: 'Your invitation was accepted',
        timestamp: now,
        read: false,
        icon: 'UserCheck',
        metadata: {
          spaceId: invitation.spaceId,
          spaceName: spaceData.name,
          acceptedByName: userRecord.displayName || userEmail,
          acceptedByPhoto: userRecord.photoURL,
        },
      });

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
