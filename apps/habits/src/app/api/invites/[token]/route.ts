import { NextRequest, NextResponse } from 'next/server';
import { db as adminDb } from '@ainexsuite/firebase/admin';
import type { SpaceInvite } from '@/types/models';

export async function GET(
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
    const inviteData = inviteDoc.data() as Omit<SpaceInvite, 'id'>;
    const invite: SpaceInvite = { id: inviteDoc.id, ...inviteData };

    // Check if expired
    if (new Date(invite.expiresAt) < new Date()) {
      // Update status to expired
      await inviteDoc.ref.update({ status: 'expired' });
      return NextResponse.json(
        { error: 'This invite has expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({ invite });
  } catch (error) {
    console.error('Error fetching invite:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invite' },
      { status: 500 }
    );
  }
}
