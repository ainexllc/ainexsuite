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
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { auth } from '@ainexsuite/firebase';
import type { Note, CreateNoteInput } from '@ainexsuite/types';

const NOTES_COLLECTION = 'notes';

function getCurrentUserId(): string {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.uid;
}

export async function createNote(input: Omit<CreateNoteInput, 'ownerId'>): Promise<string> {
  const userId = getCurrentUserId();

  const noteData = {
    ...input,
    ownerId: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, NOTES_COLLECTION), noteData);

  // Log activity
  try {
    await createActivity({
      app: 'notes',
      action: 'created',
      itemType: 'note',
      itemId: docRef.id,
      itemTitle: input.title || 'Untitled',
      metadata: {
        color: input.color,
        labels: input.labels,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }

  return docRef.id;
}

export async function updateNote(
  noteId: string,
  updates: Partial<Omit<Note, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  getCurrentUserId();
  const noteRef = doc(db, NOTES_COLLECTION, noteId);

  await updateDoc(noteRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  // Log activity
  try {
    const title = updates.title || 'Note';
    const action = updates.isPinned !== undefined ? 'pinned' :
                   updates.isArchived !== undefined ? 'archived' : 'updated';

    await createActivity({
      app: 'notes',
      action,
      itemType: 'note',
      itemId: noteId,
      itemTitle: title,
      metadata: {
        color: updates.color,
        labels: updates.labels,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function deleteNote(noteId: string): Promise<void> {
  getCurrentUserId();
  const noteRef = doc(db, NOTES_COLLECTION, noteId);

  // Get note details before deleting
  const note = await getNoteById(noteId);

  // Soft delete by marking as deleted
  await updateDoc(noteRef, {
    deleted: true,
    updatedAt: serverTimestamp(),
  });

  // Log activity
  if (note) {
    try {
      await createActivity({
        app: 'notes',
        action: 'deleted',
        itemType: 'note',
        itemId: noteId,
        itemTitle: note.title || 'Untitled',
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}

export async function hardDeleteNote(noteId: string): Promise<void> {
  getCurrentUserId();
  const noteRef = doc(db, NOTES_COLLECTION, noteId);

  await deleteDoc(noteRef);
}

export async function getNotes(options?: {
  includeArchived?: boolean;
  includeDeleted?: boolean;
  limitCount?: number;
}): Promise<Note[]> {
  const userId = getCurrentUserId();

  const constraints = [
    where('ownerId', '==', userId),
    orderBy('updatedAt', 'desc'),
  ];

  if (!options?.includeDeleted) {
    constraints.push(where('deleted', '==', false));
  }

  if (options?.limitCount) {
    constraints.push(limit(options.limitCount));
  }

  const q = query(collection(db, NOTES_COLLECTION), ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toMillis() || Date.now(),
    updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
  })) as Note[];
}

export async function getNoteById(noteId: string): Promise<Note | null> {
  const userId = getCurrentUserId();

  const q = query(
    collection(db, NOTES_COLLECTION),
    where('__name__', '==', noteId),
    where('ownerId', '==', userId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toMillis() || Date.now(),
    updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
  } as Note;
}
