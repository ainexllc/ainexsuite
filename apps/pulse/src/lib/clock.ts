import { db, createActivity } from '@ainexsuite/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
} from 'firebase/firestore';
import { getCurrentUserId } from './utils';

export interface Clock {
  id: string;
  ownerId: string;
  city: string;
  timezone: string; // e.g., 'America/New_York'
  label?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateClockInput {
  city: string;
  timezone: string;
  label?: string;
}

export interface UpdateClockInput {
  city?: string;
  timezone?: string;
  label?: string;
}

const CLOCKS_COLLECTION = 'clocks';

export async function getClocks(): Promise<Clock[]> {
  const userId = getCurrentUserId();
  const q = query(
    collection(db, CLOCKS_COLLECTION),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Clock));
}

export async function createClock(input: CreateClockInput): Promise<string> {
  const userId = getCurrentUserId();
  const clockData = {
    ...input,
    ownerId: userId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const docRef = await addDoc(collection(db, CLOCKS_COLLECTION), clockData);

  // Log activity
  try {
    await createActivity({
      app: 'pulse',
      action: 'created',
      itemType: 'clock',
      itemId: docRef.id,
      itemTitle: `Clock - ${input.city}`,
      metadata: { timezone: input.timezone },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }

  return docRef.id;
}

export async function updateClock(id: string, updates: UpdateClockInput): Promise<void> {
  const docRef = doc(db, CLOCKS_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Date.now(),
  });

  // Log activity
  try {
    await createActivity({
      app: 'pulse',
      action: 'updated',
      itemType: 'clock',
      itemId: id,
      itemTitle: updates.city || 'Clock',
      metadata: updates,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function deleteClock(id: string): Promise<void> {
  const docRef = doc(db, CLOCKS_COLLECTION, id);

  // Get clock details before deleting
  const clockDoc = await getDoc(docRef);
  const clock = clockDoc.exists() ? clockDoc.data() as Clock : null;

  await deleteDoc(docRef);

  // Log activity
  if (clock) {
    try {
      await createActivity({
        app: 'pulse',
        action: 'deleted',
        itemType: 'clock',
        itemId: id,
        itemTitle: `Clock - ${clock.city}`,
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}
