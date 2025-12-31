import { NextRequest, NextResponse } from 'next/server';
import { db as adminDb } from '@ainexsuite/firebase/admin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

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

    // Update invite status
    await inviteDoc.ref.update({
      status: 'declined',
      respondedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error declining invite:', error);
    return NextResponse.json(
      { error: 'Failed to decline invite' },
      { status: 500 }
    );
  }
}
