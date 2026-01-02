import { NextResponse } from 'next/server';
import { db as adminDb, auth as adminAuth } from '@ainexsuite/firebase/admin';

/**
 * Delete a user account and all their data across all collections.
 * This is an admin-only operation.
 *
 * POST /api/users/delete
 * Body: { uid: string, adminUid: string }
 */

// Collections that store user data (indexed by userId, ownerId, or similar)
const USER_DATA_COLLECTIONS = [
  // Core user data
  { name: 'users', field: null }, // Direct document by uid
  { name: 'activities', field: 'ownerId' },
  { name: 'feedback', field: 'userId' },

  // Todo app
  { name: 'tasks', field: 'ownerId' },
  { name: 'todo_spaces', field: 'createdBy' },

  // Fit app
  { name: 'workouts', field: 'userId' },
  { name: 'challenges', field: 'userId' },
  { name: 'fit_spaces', field: 'createdBy' },

  // Habits app
  { name: 'habits', field: 'userId' },
  { name: 'completions', field: 'userId' },
  { name: 'habitReminders', field: 'userId' },

  // Album/Moments app
  { name: 'moments', field: 'userId' },

  // Journal app
  { name: 'journal_entries', field: 'userId' },

  // Notes app
  { name: 'notes', field: 'userId' },

  // Health app
  { name: 'health_metrics', field: 'userId' },

  // Calendar app
  { name: 'calendar_events', field: 'userId' },

  // Learning/Grow app
  { name: 'learning_goals', field: 'userId' },
  { name: 'quests', field: 'userId' },

  // Spaces (unified)
  { name: 'spaces', field: 'createdBy' },

  // Notifications
  { name: 'notifications', field: 'userId' },
];

async function deleteCollection(collectionName: string, field: string | null, uid: string): Promise<number> {
  let deletedCount = 0;
  const batchSize = 500; // Firestore batch limit

  if (field === null) {
    // Direct document deletion (e.g., users/{uid})
    const docRef = adminDb.collection(collectionName).doc(uid);
    const doc = await docRef.get();
    if (doc.exists) {
      await docRef.delete();
      deletedCount = 1;
    }
  } else {
    // Query-based deletion
    let hasMore = true;
    while (hasMore) {
      const snapshot = await adminDb
        .collection(collectionName)
        .where(field, '==', uid)
        .limit(batchSize)
        .get();

      if (snapshot.empty) {
        hasMore = false;
        break;
      }

      const batch = adminDb.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        deletedCount++;
      });
      await batch.commit();

      // If we got fewer than batchSize, we're done
      if (snapshot.size < batchSize) {
        hasMore = false;
      }
    }
  }

  return deletedCount;
}

async function deleteSubcollections(uid: string): Promise<number> {
  let deletedCount = 0;
  const subcollections = ['notes', 'calendar_events', 'preferences', 'settings'];

  for (const subcollection of subcollections) {
    const path = `users/${uid}/${subcollection}`;
    try {
      const snapshot = await adminDb.collection(path).get();
      if (!snapshot.empty) {
        const batch = adminDb.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
          deletedCount++;
        });
        await batch.commit();
      }
    } catch {
      // Subcollection might not exist, that's fine
    }
  }

  return deletedCount;
}

export async function POST(request: Request) {
  try {
    const { uid, adminUid } = await request.json();

    if (!uid) {
      return NextResponse.json({ error: 'User UID is required' }, { status: 400 });
    }

    if (!adminUid) {
      return NextResponse.json({ error: 'Admin UID is required' }, { status: 400 });
    }

    // Verify the requester is an admin
    const adminDoc = await adminDb.collection('users').doc(adminUid).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    // Prevent self-deletion
    if (uid === adminUid) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Get user info before deletion for logging
    const userDoc = await adminDb.collection('users').doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    const userEmail = userData?.email || 'unknown';

    // Track deletion stats
    const stats: Record<string, number> = {};

    // Delete data from all collections
    for (const collection of USER_DATA_COLLECTIONS) {
      const count = await deleteCollection(collection.name, collection.field, uid);
      if (count > 0) {
        stats[collection.name] = count;
      }
    }

    // Delete subcollections under users/{uid}
    const subcollectionCount = await deleteSubcollections(uid);
    if (subcollectionCount > 0) {
      stats['subcollections'] = subcollectionCount;
    }

    // Also check for memberUids arrays in spaces (user might be a member, not creator)
    try {
      const spacesWithMember = await adminDb
        .collection('spaces')
        .where('memberUids', 'array-contains', uid)
        .get();

      for (const doc of spacesWithMember.docs) {
        const data = doc.data();
        const updatedMemberUids = (data.memberUids || []).filter((id: string) => id !== uid);
        const updatedMembers = (data.members || []).filter((m: { uid: string }) => m.uid !== uid);

        await doc.ref.update({
          memberUids: updatedMemberUids,
          members: updatedMembers,
        });
      }
      if (spacesWithMember.size > 0) {
        stats['space_memberships_removed'] = spacesWithMember.size;
      }
    } catch {
      // Spaces might not have this field
    }

    // Delete from Firebase Authentication
    try {
      await adminAuth.deleteUser(uid);
      stats['auth_deleted'] = 1;
    } catch (authError) {
      console.error('Failed to delete from Firebase Auth:', authError);
      // Continue even if auth deletion fails - user might already be deleted
    }

    // Log the deletion
    await adminDb.collection('admin_logs').add({
      action: 'user_deleted',
      targetUid: uid,
      targetEmail: userEmail,
      performedBy: adminUid,
      stats,
      timestamp: new Date(),
    });

    const totalDeleted = Object.values(stats).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      success: true,
      message: `User ${userEmail} (${uid}) deleted successfully`,
      stats,
      totalDeleted,
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete user' },
      { status: 500 }
    );
  }
}
