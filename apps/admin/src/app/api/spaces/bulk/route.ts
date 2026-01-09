import { NextRequest, NextResponse } from 'next/server';
import { db as adminDb } from '@ainexsuite/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { SpaceType } from '@ainexsuite/types';

type BulkAction = 'delete' | 'changeType';

interface BulkRequest {
  adminUid: string;
  action: BulkAction;
  spaceIds: string[];
  newType?: SpaceType;
}

interface BulkResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{ spaceId: string; error: string }>;
}

/**
 * Perform bulk operations on spaces.
 * POST /api/spaces/bulk
 *
 * Body: {
 *   adminUid: string,
 *   action: 'delete' | 'changeType',
 *   spaceIds: string[],
 *   newType?: SpaceType (required for changeType action)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: BulkRequest = await request.json();
    const { adminUid, action, spaceIds, newType } = body;

    // Validate request
    if (!adminUid) {
      return NextResponse.json({ error: 'Admin UID is required' }, { status: 401 });
    }

    // Verify the requester is an admin
    const adminDoc = await adminDb.collection('users').doc(adminUid).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    if (!action || !['delete', 'changeType'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "delete" or "changeType"' }, { status: 400 });
    }

    if (!spaceIds || !Array.isArray(spaceIds) || spaceIds.length === 0) {
      return NextResponse.json({ error: 'spaceIds must be a non-empty array' }, { status: 400 });
    }

    if (spaceIds.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 spaces can be processed at once' }, { status: 400 });
    }

    if (action === 'changeType') {
      const validTypes: SpaceType[] = ['personal', 'family', 'work', 'couple', 'buddy', 'squad', 'project'];
      if (!newType || !validTypes.includes(newType)) {
        return NextResponse.json({ error: 'Valid newType is required for changeType action' }, { status: 400 });
      }
    }

    const result: BulkResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: [],
    };

    // Process based on action
    if (action === 'delete') {
      await processBulkDelete(spaceIds, adminUid, result);
    } else if (action === 'changeType') {
      await processBulkChangeType(spaceIds, newType as SpaceType, adminUid, result);
    }

    result.success = result.failed === 0;

    // Log the bulk action
    await adminDb.collection('admin_logs').add({
      action: `bulk_${action}_spaces`,
      spaceIds,
      newType: action === 'changeType' ? newType : null,
      processed: result.processed,
      failed: result.failed,
      performedBy: adminUid,
      timestamp: new Date(),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}

/**
 * Process bulk delete operation
 */
async function processBulkDelete(spaceIds: string[], adminUid: string, result: BulkResult): Promise<void> {
  // Process in batches of 500 (Firestore batch limit)
  const batchSize = 500;

  for (const spaceId of spaceIds) {
    try {
      // Verify space exists
      const spaceRef = adminDb.collection('spaces').doc(spaceId);
      const spaceDoc = await spaceRef.get();

      if (!spaceDoc.exists) {
        result.failed++;
        result.errors.push({ spaceId, error: 'Space not found' });
        continue;
      }

      // Delete associated invitations
      const invitationsSnapshot = await adminDb
        .collection('spaceInvitations')
        .where('spaceId', '==', spaceId)
        .get();

      // Process invitation deletions in batches
      if (!invitationsSnapshot.empty) {
        const invitationDocs = invitationsSnapshot.docs;
        for (let i = 0; i < invitationDocs.length; i += batchSize) {
          const batch = adminDb.batch();
          const chunk = invitationDocs.slice(i, i + batchSize);
          chunk.forEach((doc) => batch.delete(doc.ref));
          await batch.commit();
        }
      }

      // Delete the space
      await spaceRef.delete();
      result.processed++;
    } catch (error) {
      result.failed++;
      result.errors.push({
        spaceId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

/**
 * Process bulk change type operation
 */
async function processBulkChangeType(
  spaceIds: string[],
  newType: SpaceType,
  adminUid: string,
  result: BulkResult
): Promise<void> {
  for (const spaceId of spaceIds) {
    try {
      // Verify space exists
      const spaceRef = adminDb.collection('spaces').doc(spaceId);
      const spaceDoc = await spaceRef.get();

      if (!spaceDoc.exists) {
        result.failed++;
        result.errors.push({ spaceId, error: 'Space not found' });
        continue;
      }

      const currentType = spaceDoc.data()?.type;

      // Skip if already the target type
      if (currentType === newType) {
        result.processed++;
        continue;
      }

      // Update the space type
      await spaceRef.update({
        type: newType,
        updatedAt: FieldValue.serverTimestamp(),
      });

      result.processed++;
    } catch (error) {
      result.failed++;
      result.errors.push({
        spaceId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
