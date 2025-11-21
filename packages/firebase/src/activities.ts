/**
 * Activity Management Functions
 * For tracking user actions across all apps
 */

import { auth, db } from './client';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  startAfter as firestoreStartAfter,
  Query,
  DocumentData,
} from 'firebase/firestore';
import type {
  Activity,
  CreateActivityInput,
  ActivityQuery,
  ActivityFeedResponse,
} from '@ainexsuite/types';

const ACTIVITIES_COLLECTION = 'activities';

/**
 * Get current user ID from Firebase Auth
 */
function getCurrentUserId(): string {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.uid;
}

/**
 * Create a new activity record
 */
export async function createActivity(
  input: CreateActivityInput
): Promise<string> {
  const userId = getCurrentUserId();

  const activityData = {
    ...input,
    ownerId: userId,
    timestamp: Date.now(),
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(
    collection(db, ACTIVITIES_COLLECTION),
    activityData
  );

  return docRef.id;
}

/**
 * Get activity feed for current user
 */
export async function getActivityFeed(
  params: ActivityQuery = {}
): Promise<ActivityFeedResponse> {
  const userId = getCurrentUserId();
  const { limit = 50, apps, actions, startAfter } = params;

  let q: Query<DocumentData> = query(
    collection(db, ACTIVITIES_COLLECTION),
    where('ownerId', '==', userId),
    orderBy('timestamp', 'desc'),
    firestoreLimit(limit + 1) // Get one extra to check if there's more
  );

  // Filter by apps if specified
  if (apps && apps.length > 0) {
    q = query(q, where('app', 'in', apps));
  }

  // Filter by actions if specified
  if (actions && actions.length > 0) {
    q = query(q, where('action', 'in', actions));
  }

  // Pagination
  if (startAfter) {
    q = query(q, firestoreStartAfter(startAfter));
  }

  const snapshot = await getDocs(q);
  const activities: Activity[] = [];

  snapshot.docs.forEach((doc, index) => {
    if (index < limit) {
      activities.push({
        id: doc.id,
        ...doc.data(),
      } as Activity);
    }
  });

  return {
    activities,
    hasMore: snapshot.size > limit,
    lastTimestamp:
      activities.length > 0
        ? activities[activities.length - 1].timestamp
        : undefined,
  };
}

/**
 * Subscribe to real-time activity updates
 */
export function subscribeToActivityFeed(
  params: ActivityQuery = {},
  onUpdate: (response: ActivityFeedResponse) => void,
  onError?: (error: Error) => void
): () => void {
  const userId = getCurrentUserId();
  const { limit = 50, apps, actions } = params;

  let q: Query<DocumentData> = query(
    collection(db, ACTIVITIES_COLLECTION),
    where('ownerId', '==', userId),
    orderBy('timestamp', 'desc'),
    firestoreLimit(limit)
  );

  // Filter by apps if specified
  if (apps && apps.length > 0) {
    q = query(q, where('app', 'in', apps));
  }

  // Filter by actions if specified
  if (actions && actions.length > 0) {
    q = query(q, where('action', 'in', actions));
  }

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const activities: Activity[] = [];

      snapshot.forEach((doc) => {
        activities.push({
          id: doc.id,
          ...doc.data(),
        } as Activity);
      });

      onUpdate({
        activities,
        hasMore: false, // Real-time doesn't support pagination check
      });
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );

  return unsubscribe;
}
