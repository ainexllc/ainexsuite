import { db, storage, createActivity } from '@ainexsuite/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, getDoc, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Moment, CreateMomentInput, UpdateMomentInput } from '@ainexsuite/types';
import { getCurrentUserId } from './utils';

const MOMENTS_COLLECTION = 'moments';

export async function getMoments(): Promise<Moment[]> {
  const userId = getCurrentUserId();
  const q = query(
    collection(db, MOMENTS_COLLECTION),
    where('ownerId', '==', userId),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Moment));
}

export async function createMoment(input: Omit<CreateMomentInput, 'ownerId'>): Promise<string> {
  const userId = getCurrentUserId();
  const momentData = {
    ...input,
    ownerId: userId,
    thumbnailUrl: input.photoUrl, // Use full photo as thumbnail for now
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const docRef = await addDoc(collection(db, MOMENTS_COLLECTION), momentData);

  // Log activity
  try {
    await createActivity({
      app: 'moments',
      action: 'created',
      itemType: 'moment',
      itemId: docRef.id,
      itemTitle: input.title,
      metadata: { location: input.location, tags: input.tags },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }

  return docRef.id;
}

export async function updateMoment(
  id: string,
  updates: UpdateMomentInput
): Promise<void> {
  const docRef = doc(db, MOMENTS_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Date.now(),
  });

  // Log activity
  try {
    await createActivity({
      app: 'moments',
      action: 'updated',
      itemType: 'moment',
      itemId: id,
      itemTitle: updates.title || 'Moment',
      metadata: { location: updates.location, tags: updates.tags },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function deleteMoment(id: string): Promise<void> {
  const docRef = doc(db, MOMENTS_COLLECTION, id);

  // Get moment details before deleting
  const momentDoc = await getDoc(docRef);
  const moment = momentDoc.exists() ? momentDoc.data() as Moment : null;

  await deleteDoc(docRef);

  // Log activity
  if (moment) {
    try {
      await createActivity({
        app: 'moments',
        action: 'deleted',
        itemType: 'moment',
        itemId: id,
        itemTitle: moment.title,
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}

export async function uploadPhoto(file: File): Promise<string> {
  const userId = getCurrentUserId();
  const timestamp = Date.now();
  const fileName = `${userId}/${timestamp}_${file.name}`;
  const storageRef = ref(storage, `moments/${fileName}`);

  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}
