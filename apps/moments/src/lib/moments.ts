import { db, storage, createActivity } from '@ainexsuite/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, getDoc, orderBy, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Moment, CreateMomentInput, UpdateMomentInput, Reaction, Comment } from '@ainexsuite/types';

const MOMENTS_COLLECTION = 'moments';

export async function getMoments(userId: string, spaceId?: string): Promise<Moment[]> {
  // If spaceId provided, we fetch moments for that space (public/shared view)
  if (spaceId) {
    const q = query(
      collection(db, MOMENTS_COLLECTION),
      where('spaceId', '==', spaceId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Moment));
  }

  // Otherwise fetch personal moments (ownerId = user, spaceId = null)
  const q = query(
    collection(db, MOMENTS_COLLECTION),
    where('ownerId', '==', userId),
    where('spaceId', '==', null),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Moment));
}

export async function createMoment(userId: string, input: Omit<CreateMomentInput, 'ownerId'>): Promise<string> {
  // Build moment data, excluding undefined values (Firestore doesn't accept undefined)
  const momentData: Record<string, unknown> = {
    title: input.title,
    caption: input.caption,
    location: input.location,
    date: input.date,
    tags: input.tags,
    collectionId: input.collectionId,
    ownerId: userId,
    spaceId: input.spaceId || null,
    reactions: [],
    comments: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Only add optional fields if they have values
  if (input.photoUrl) {
    momentData.photoUrl = input.photoUrl;
    momentData.thumbnailUrl = input.photoUrl; // Use full photo as thumbnail
  }
  if (input.people?.length) momentData.people = input.people;
  if (input.mood) momentData.mood = input.mood;
  if (input.weather) momentData.weather = input.weather;

  const docRef = await addDoc(collection(db, MOMENTS_COLLECTION), momentData);

  // Log activity
  try {
    const metadata: Record<string, string | number | boolean | string[]> = {};
    if (input.location) metadata.location = input.location;
    if (input.tags?.length) metadata.tags = input.tags;
    if (input.spaceId) metadata.spaceId = input.spaceId;
    if (input.mood) metadata.mood = input.mood;
    if (input.people?.length) metadata.people = input.people;
    
    await createActivity({
      app: 'moments',
      action: 'created',
      itemType: 'moment',
      itemId: docRef.id,
      itemTitle: input.title,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
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
    const metadata: Record<string, string | number | boolean | string[]> = {};
    if (updates.location) metadata.location = updates.location;
    if (updates.tags?.length) metadata.tags = updates.tags;
    if (updates.mood) metadata.mood = updates.mood;

    await createActivity({
      app: 'moments',
      action: 'updated',
      itemType: 'moment',
      itemId: id,
      itemTitle: updates.title || 'Moment',
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
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

export async function uploadPhoto(userId: string, file: File): Promise<string> {
  const timestamp = Date.now();
  const fileName = `${userId}/${timestamp}_${file.name}`;
  const storageRef = ref(storage, `moments/${fileName}`);

  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

// --- Interaction Features ---

export async function toggleReaction(momentId: string, userId: string, emoji: string): Promise<void> {
  const docRef = doc(db, MOMENTS_COLLECTION, momentId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return;

  const moment = snapshot.data() as Moment;
  const reactions = moment.reactions || [];
  
  // Check if user already reacted with this emoji
  const existingIndex = reactions.findIndex(r => r.uid === userId && r.type === emoji);

  if (existingIndex >= 0) {
    // Remove reaction
    const reactionToRemove = reactions[existingIndex];
    await updateDoc(docRef, {
      reactions: arrayRemove(reactionToRemove)
    });
  } else {
    // Add reaction
    const newReaction: Reaction = {
      uid: userId,
      type: emoji,
      timestamp: Date.now()
    };
    await updateDoc(docRef, {
      reactions: arrayUnion(newReaction)
    });
  }
}

export async function addComment(momentId: string, userId: string, text: string): Promise<void> {
  const docRef = doc(db, MOMENTS_COLLECTION, momentId);
  const newComment: Comment = {
    id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    uid: userId,
    text,
    timestamp: Date.now()
  };

  await updateDoc(docRef, {
    comments: arrayUnion(newComment)
  });
}

export async function deleteComment(momentId: string, comment: Comment): Promise<void> {
  const docRef = doc(db, MOMENTS_COLLECTION, momentId);
  await updateDoc(docRef, {
    comments: arrayRemove(comment)
  });
}
