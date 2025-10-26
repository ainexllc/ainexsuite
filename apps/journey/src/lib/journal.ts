import { db, createActivity } from '@ainexsuite/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { auth } from '@ainexsuite/firebase';
import type { JournalEntry, CreateJournalEntryInput } from '@ainexsuite/types';

const JOURNAL_COLLECTION = 'journalEntries';

function getCurrentUserId(): string {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
}

export async function createJournalEntry(
  input: Omit<CreateJournalEntryInput, 'ownerId'>
): Promise<string> {
  const userId = getCurrentUserId();
  const entryData = {
    ...input,
    ownerId: userId,
    date: typeof input.date === 'number' ? input.date : input.date.getTime(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, JOURNAL_COLLECTION), entryData);

  // Log activity
  try {
    const dateStr = new Date(entryData.date).toLocaleDateString();
    await createActivity({
      app: 'journal',
      action: 'created',
      itemType: 'entry',
      itemId: docRef.id,
      itemTitle: `Journal Entry - ${dateStr}`,
      metadata: { mood: input.mood },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }

  return docRef.id;
}

type JournalUpdate = Partial<
  Omit<JournalEntry, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
> & { updatedAt: ReturnType<typeof serverTimestamp> };

export async function updateJournalEntry(
  entryId: string,
  updates: Partial<Omit<JournalEntry, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const entryRef = doc(db, JOURNAL_COLLECTION, entryId);
  const updateData: JournalUpdate = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  if (updates.date && typeof updates.date !== 'number') {
    updateData.date = updates.date.getTime();
  }

  await updateDoc(entryRef, updateData as Record<string, unknown>);

  // Log activity
  try {
    const dateStr = updates.date
      ? new Date(typeof updates.date === 'number' ? updates.date : updates.date.getTime()).toLocaleDateString()
      : 'Journal Entry';
    await createActivity({
      app: 'journal',
      action: 'updated',
      itemType: 'entry',
      itemId: entryId,
      itemTitle: `Journal Entry - ${dateStr}`,
      metadata: { mood: updates.mood },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
  const entryRef = doc(db, JOURNAL_COLLECTION, entryId);

  // Get entry details before deleting
  const entryDoc = await getDoc(entryRef);
  const entry = entryDoc.exists() ? entryDoc.data() as JournalEntry : null;

  await deleteDoc(entryRef);

  // Log activity
  if (entry) {
    try {
      const dateStr = new Date(entry.date).toLocaleDateString();
      await createActivity({
        app: 'journal',
        action: 'deleted',
        itemType: 'entry',
        itemId: entryId,
        itemTitle: `Journal Entry - ${dateStr}`,
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}

export async function getJournalEntries(
  startDate?: Date,
  endDate?: Date
): Promise<JournalEntry[]> {
  const userId = getCurrentUserId();
  const constraints = [
    where('ownerId', '==', userId),
    orderBy('date', 'desc'),
  ];

  if (startDate) {
    constraints.push(where('date', '>=', startDate.getTime()));
  }
  if (endDate) {
    constraints.push(where('date', '<=', endDate.getTime()));
  }

  const q = query(collection(db, JOURNAL_COLLECTION), ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date,
    createdAt: doc.data().createdAt?.toMillis() || Date.now(),
    updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
  })) as JournalEntry[];
}
