import { NextRequest, NextResponse } from 'next/server';
import { db as adminDb } from '@ainexsuite/firebase/admin';
import { SpaceInvite, SpaceType, MemberAgeGroup } from '@/types/models';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      spaceId,
      spaceName,
      spaceType,
      inviteeEmail,
      inviterName,
      inviterId,
      ageGroup,
    } = body as {
      spaceId: string;
      spaceName: string;
      spaceType: SpaceType;
      inviteeEmail: string;
      inviterName: string;
      inviterId: string;
      ageGroup?: MemberAgeGroup;
    };

    // Validate required fields
    if (!spaceId || !inviteeEmail || !inviterId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already has a pending invite for this space
    const existingInvites = await adminDb
      .collection('invites')
      .where('spaceId', '==', spaceId)
      .where('inviteeEmail', '==', inviteeEmail.toLowerCase())
      .where('status', '==', 'pending')
      .get();

    if (!existingInvites.empty) {
      return NextResponse.json(
        { error: 'An invite has already been sent to this email' },
        { status: 409 }
      );
    }

    // Check if user is already a member (by checking users collection for email)
    const existingUsers = await adminDb
      .collection('users')
      .where('email', '==', inviteeEmail.toLowerCase())
      .limit(1)
      .get();

    let inviteeUserId: string | undefined;
    if (!existingUsers.empty) {
      inviteeUserId = existingUsers.docs[0].id;

      // Check if they're already a member of this space
      const space = await adminDb.collection('spaces').doc(spaceId).get();
      if (space.exists) {
        const spaceData = space.data();
        if (spaceData?.memberUids?.includes(inviteeUserId)) {
          return NextResponse.json(
            { error: 'This user is already a member of this space' },
            { status: 409 }
          );
        }
      }
    }

    // Generate unique token
    const token = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 11)}_${Math.random().toString(36).slice(2, 11)}`;

    // Create invite document
    const invite: Omit<SpaceInvite, 'id'> = {
      spaceId,
      spaceName,
      spaceType,
      invitedBy: inviterId,
      inviterName,
      inviteeEmail: inviteeEmail.toLowerCase(),
      inviteeUserId,
      role: 'member',
      ageGroup,
      status: 'pending',
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    const docRef = await adminDb.collection('invites').add(invite);

    // Get the base URL for the invite link
    const baseUrl = request.headers.get('origin') || 'https://habits.ainex.app';
    const inviteUrl = `${baseUrl}/invite/${token}`;

    // TODO: Send email using email service (Resend, SendGrid, etc.)
    // For now, we'll just log and return success
    // eslint-disable-next-line no-console
    console.log(`Invite created for ${inviteeEmail}: ${inviteUrl}`);

    // If the invitee is an existing user, create a notification
    if (inviteeUserId) {
      await adminDb.collection('notifications').add({
        recipientId: inviteeUserId,
        senderId: inviterId,
        spaceId,
        type: 'system',
        title: 'Space Invitation',
        message: `${inviterName} invited you to join "${spaceName}"`,
        isRead: false,
        createdAt: new Date().toISOString(),
        data: {
          inviteId: docRef.id,
          inviteToken: token,
          action: 'join_space',
        },
      });
    }

    return NextResponse.json({
      success: true,
      inviteId: docRef.id,
      inviteUrl,
      isExistingUser: !!inviteeUserId,
    });
  } catch (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json(
      { error: 'Failed to create invite' },
      { status: 500 }
    );
  }
}
