import { NextRequest, NextResponse } from 'next/server';
import { db as adminDb } from '@ainexsuite/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Find invite by token
    const invitesSnapshot = await adminDb
      .collection('invites')
      .where('token', '==', token)
      .limit(1)
      .get();

    if (invitesSnapshot.empty) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
      );
    }

    const inviteDoc = invitesSnapshot.docs[0];
    const invite = inviteDoc.data();

    // Check status
    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: `Invite has already been ${invite.status}` },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date(invite.expiresAt) < new Date()) {
      await inviteDoc.ref.update({ status: 'expired' });
      return NextResponse.json(
        { error: 'This invite has expired' },
        { status: 410 }
      );
    }

    // Get user details
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    const userData = userDoc.data();

    // Get space
    const spaceDoc = await adminDb.collection('spaces').doc(invite.spaceId).get();
    if (!spaceDoc.exists) {
      return NextResponse.json(
        { error: 'Space no longer exists' },
        { status: 404 }
      );
    }

    // Check if already a member
    const spaceData = spaceDoc.data();
    if (spaceData?.memberUids?.includes(userId)) {
      // Update invite status anyway
      await inviteDoc.ref.update({
        status: 'accepted',
        respondedAt: new Date().toISOString(),
      });
      return NextResponse.json({ success: true, alreadyMember: true });
    }

    // Create member object
    const newMember = {
      uid: userId,
      displayName: userData?.displayName || userData?.email?.split('@')[0] || 'User',
      photoURL: userData?.photoURL || null,
      role: invite.role || 'member',
      joinedAt: new Date().toISOString(),
      ...(invite.ageGroup ? { ageGroup: invite.ageGroup } : {}),
    };

    // Add user to space
    await spaceDoc.ref.update({
      members: FieldValue.arrayUnion(newMember),
      memberUids: FieldValue.arrayUnion(userId),
    });

    // Update invite status
    await inviteDoc.ref.update({
      status: 'accepted',
      respondedAt: new Date().toISOString(),
      inviteeUserId: userId,
    });

    // Notify inviter
    await adminDb.collection('notifications').add({
      recipientId: invite.invitedBy,
      senderId: userId,
      spaceId: invite.spaceId,
      type: 'system',
      title: 'Invite Accepted',
      message: `${newMember.displayName} joined "${invite.spaceName}"`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      spaceId: invite.spaceId,
    });
  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json(
      { error: 'Failed to accept invite' },
      { status: 500 }
    );
  }
}
