import { db } from '@ainexsuite/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { MomentsPreferences } from '@/lib/types/settings';
import { DEFAULT_MOMENTS_PREFERENCES } from '@/lib/types/settings';

const COLLECTION_NAME = 'moments_preferences';

/**
 * Convert Firestore data to MomentsPreferences
 */
function firestoreToPreferences(userId: string, data: Record<string, unknown>): MomentsPreferences {
  const defaultView = data.defaultView as MomentsPreferences['defaultView'] | undefined;
  const defaultSort = data.defaultSort as MomentsPreferences['defaultSort'] | undefined;
  const showCaptions = data.showCaptions as boolean | undefined;

  return {
    id: userId,
    userId,
    defaultView: defaultView || DEFAULT_MOMENTS_PREFERENCES.defaultView,
    defaultSort: defaultSort || DEFAULT_MOMENTS_PREFERENCES.defaultSort,
    showCaptions: showCaptions ?? DEFAULT_MOMENTS_PREFERENCES.showCaptions,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
  };
}

/**
 * Subscribe to user preferences in real-time
 */
export function subscribeToPreferences(
  userId: string,
  callback: (preferences: MomentsPreferences) => void
): () => void {
  const docRef = doc(db, COLLECTION_NAME, userId);

  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (!snapshot.exists()) {
        // Create default preferences
        const defaults = {
          ...DEFAULT_MOMENTS_PREFERENCES,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(docRef, defaults);
        callback(firestoreToPreferences(userId, defaults));
      } else {
        callback(firestoreToPreferences(userId, snapshot.data()));
      }
    },
    (error) => {
      console.error('Error subscribing to preferences:', error);
      // Return default preferences on error
      callback({
        id: userId,
        userId,
        ...DEFAULT_MOMENTS_PREFERENCES,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  );
}

/**
 * Update user preferences
 */
export async function updatePreferences(
  userId: string,
  updates: Partial<Omit<MomentsPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, userId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    // Create new preferences
    await setDoc(docRef, {
      ...DEFAULT_MOMENTS_PREFERENCES,
      ...updates,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    // Update existing preferences
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }
}
