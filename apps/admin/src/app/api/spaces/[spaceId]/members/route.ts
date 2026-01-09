import { NextRequest, NextResponse } from 'next/server';
import { db as adminDb } from '@ainexsuite/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { SpaceMember, SpaceRole } from '@ainexsuite/types';

interface RouteContext {
  params: Promise<{ spaceId: string }>;
}

/**
 * Verify admin authentication
 */
async function verifyAdmin(adminUid: string | null): Promise<{ valid: boolean; error?: NextResponse }> {
  if (!adminUid) {
    return {
      valid: false,
      error: NextResponse.json({ error: 'Admin UID is required' }, { status: 401 }),
    };
  }

  const adminDoc = await adminDb.collection('users').doc(adminUid).get();
  if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
    return {
      valid: false,
      error: NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 }),
    };
  }

  return { valid: true };
}

/**
 * List members of a space.
 * GET /api/spaces/[spaceId]/members
 *
 * Query params:
 * - adminUid: string (required for auth)
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { spaceId } = await context.params;
    const { searchParams } = new URL(request.url);

    // Auth check
    const adminUid = searchParams.get('adminUid');
    const authResult = await verifyAdmin(adminUid);
    if (!authResult.valid) {
      return authResult.error;
    }

    // Get the space
    const spaceDoc = await adminDb.collection('spaces').doc(spaceId).get();

    if (!spaceDoc.exists) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    const spaceData = spaceDoc.data();
    const members: SpaceMember[] = spaceData?.members || [];
    const childMembers = spaceData?.childMembers || [];

    // Enrich member data with user details
    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        const userDoc = await adminDb.collection('users').doc(member.uid).get();
        const userData = userDoc.exists ? userDoc.data() : null;

        return {
          ...member,
          displayName: userData?.displayName || member.displayName || 'Unknown',
          email: userData?.email || member.email,
          photoURL: userData?.photoURL || member.photoURL,
        };
      })
    );

    return NextResponse.json({
      members: enrichedMembers,
      childMembers,
      total: enrichedMembers.length + childMembers.length,
      ownerId: spaceData?.ownerId,
    });
  } catch (error) {
    console.error('List members error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list members' },
      { status: 500 }
    );
  }
}

/**
 * Add a member to a space.
 * POST /api/spaces/[spaceId]/members
 *
 * Body: { adminUid, userUid, role? }
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { spaceId } = await context.params;
    const body = await request.json();
    const { adminUid, userUid, role = 'member' } = body;

    // Auth check
    const authResult = await verifyAdmin(adminUid);
    if (!authResult.valid) {
      return authResult.error;
    }

    if (!userUid) {
      return NextResponse.json({ error: 'User UID is required' }, { status: 400 });
    }

    // Validate role
    const validRoles: SpaceRole[] = ['admin', 'member', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Get the space
    const spaceRef = adminDb.collection('spaces').doc(spaceId);
    const spaceDoc = await spaceRef.get();

    if (!spaceDoc.exists) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    const spaceData = spaceDoc.data();
    const existingMembers: SpaceMember[] = spaceData?.members || [];
    const memberUids: string[] = spaceData?.memberUids || [];

    // Check if user is already a member
    if (memberUids.includes(userUid)) {
      return NextResponse.json({ error: 'User is already a member of this space' }, { status: 409 });
    }

    // Get user details
    const userDoc = await adminDb.collection('users').doc(userUid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();

    // Create new member
    const newMember: SpaceMember = {
      uid: userUid,
      displayName: userData?.displayName,
      email: userData?.email,
      photoURL: userData?.photoURL,
      role: role as SpaceRole,
      joinedAt: Date.now(),
      addedBy: adminUid,
      isChild: false,
    };

    // Update space
    await spaceRef.update({
      members: [...existingMembers, newMember],
      memberUids: FieldValue.arrayUnion(userUid),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Log the action
    await adminDb.collection('admin_logs').add({
      action: 'member_added_to_space',
      spaceId,
      spaceName: spaceData?.name,
      memberUid: userUid,
      memberEmail: userData?.email,
      memberRole: role,
      performedBy: adminUid,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      member: newMember,
      message: `User ${userData?.email || userUid} added to space`,
    });
  } catch (error) {
    console.error('Add member error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add member' },
      { status: 500 }
    );
  }
}

/**
 * Remove a member from a space.
 * DELETE /api/spaces/[spaceId]/members
 *
 * Query params:
 * - adminUid: string (required for auth)
 * - memberId: string (required - the UID of the member to remove)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { spaceId } = await context.params;
    const { searchParams } = new URL(request.url);

    // Auth check
    const adminUid = searchParams.get('adminUid');
    const authResult = await verifyAdmin(adminUid);
    if (!authResult.valid) {
      return authResult.error;
    }

    const memberId = searchParams.get('memberId');
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // Get the space
    const spaceRef = adminDb.collection('spaces').doc(spaceId);
    const spaceDoc = await spaceRef.get();

    if (!spaceDoc.exists) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    const spaceData = spaceDoc.data();
    const existingMembers: SpaceMember[] = spaceData?.members || [];
    const memberUids: string[] = spaceData?.memberUids || [];

    // Check if user is a member
    if (!memberUids.includes(memberId)) {
      return NextResponse.json({ error: 'User is not a member of this space' }, { status: 404 });
    }

    // Cannot remove the owner
    if (spaceData?.ownerId === memberId) {
      return NextResponse.json(
        { error: 'Cannot remove the space owner. Transfer ownership first.' },
        { status: 400 }
      );
    }

    // Find the member being removed (for logging)
    const removedMember = existingMembers.find((m) => m.uid === memberId);

    // Update space
    const updatedMembers = existingMembers.filter((m) => m.uid !== memberId);
    const updatedMemberUids = memberUids.filter((uid) => uid !== memberId);

    await spaceRef.update({
      members: updatedMembers,
      memberUids: updatedMemberUids,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Log the action
    await adminDb.collection('admin_logs').add({
      action: 'member_removed_from_space',
      spaceId,
      spaceName: spaceData?.name,
      memberUid: memberId,
      memberEmail: removedMember?.email,
      performedBy: adminUid,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Member ${removedMember?.email || memberId} removed from space`,
    });
  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove member' },
      { status: 500 }
    );
  }
}
