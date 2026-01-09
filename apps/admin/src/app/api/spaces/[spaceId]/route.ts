import { NextRequest, NextResponse } from 'next/server';
import { db as adminDb } from '@ainexsuite/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Space, SpaceType } from '@ainexsuite/types';

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
 * Get a single space with its members.
 * GET /api/spaces/[spaceId]
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

    const space: Space = {
      id: spaceDoc.id,
      ...spaceDoc.data(),
    } as Space;

    // Optionally fetch owner details
    let ownerDetails = null;
    if (space.ownerId) {
      const ownerDoc = await adminDb.collection('users').doc(space.ownerId).get();
      if (ownerDoc.exists) {
        const ownerData = ownerDoc.data();
        ownerDetails = {
          uid: ownerDoc.id,
          displayName: ownerData?.displayName,
          email: ownerData?.email,
          photoURL: ownerData?.photoURL,
        };
      }
    }

    return NextResponse.json({
      space,
      owner: ownerDetails,
    });
  } catch (error) {
    console.error('Get space error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get space' },
      { status: 500 }
    );
  }
}

/**
 * Update a space.
 * PUT /api/spaces/[spaceId]
 *
 * Body: { name?, type?, description?, settings?, adminUid }
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { spaceId } = await context.params;
    const body = await request.json();
    const { adminUid, name, type, description, settings, color, icon, isGlobal, isPublic, hiddenInApps } = body;

    // Auth check
    const authResult = await verifyAdmin(adminUid);
    if (!authResult.valid) {
      return authResult.error;
    }

    // Verify space exists
    const spaceRef = adminDb.collection('spaces').doc(spaceId);
    const spaceDoc = await spaceRef.get();

    if (!spaceDoc.exists) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (type !== undefined) {
      const validTypes: SpaceType[] = ['personal', 'family', 'work', 'couple', 'buddy', 'squad', 'project'];
      if (!validTypes.includes(type)) {
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
      }
      updateData.type = type;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (settings !== undefined) {
      updateData.settings = settings;
    }

    if (color !== undefined) {
      updateData.color = color;
    }

    if (icon !== undefined) {
      updateData.icon = icon;
    }

    if (isGlobal !== undefined) {
      updateData.isGlobal = isGlobal;
    }

    if (isPublic !== undefined) {
      updateData.isPublic = isPublic;
    }

    if (hiddenInApps !== undefined) {
      updateData.hiddenInApps = hiddenInApps;
    }

    // Perform update
    await spaceRef.update(updateData);

    // Log the action
    await adminDb.collection('admin_logs').add({
      action: 'space_updated',
      spaceId,
      changes: Object.keys(updateData).filter((k) => k !== 'updatedAt'),
      performedBy: adminUid,
      timestamp: new Date(),
    });

    // Fetch updated space
    const updatedDoc = await spaceRef.get();
    const updatedSpace: Space = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    } as Space;

    return NextResponse.json({
      success: true,
      space: updatedSpace,
    });
  } catch (error) {
    console.error('Update space error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update space' },
      { status: 500 }
    );
  }
}

/**
 * Delete a space.
 * DELETE /api/spaces/[spaceId]
 *
 * Query params:
 * - adminUid: string (required for auth)
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

    // Verify space exists
    const spaceRef = adminDb.collection('spaces').doc(spaceId);
    const spaceDoc = await spaceRef.get();

    if (!spaceDoc.exists) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    const spaceData = spaceDoc.data();
    const spaceName = spaceData?.name || 'Unknown';

    // Delete associated invitations
    const invitationsSnapshot = await adminDb
      .collection('spaceInvitations')
      .where('spaceId', '==', spaceId)
      .get();

    const batch = adminDb.batch();
    invitationsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete the space
    batch.delete(spaceRef);

    await batch.commit();

    // Log the action
    await adminDb.collection('admin_logs').add({
      action: 'space_deleted',
      spaceId,
      spaceName,
      memberCount: spaceData?.members?.length || 0,
      performedBy: adminUid,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Space "${spaceName}" deleted successfully`,
      deletedInvitations: invitationsSnapshot.size,
    });
  } catch (error) {
    console.error('Delete space error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete space' },
      { status: 500 }
    );
  }
}
