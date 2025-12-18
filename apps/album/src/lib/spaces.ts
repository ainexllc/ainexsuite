import { db, createActivity } from '@ainexsuite/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  onSnapshot
} from 'firebase/firestore';
import type { Space, SpaceType } from '@ainexsuite/types';

const SPACES_COLLECTION = 'moments_spaces';

/**
 * Subscribe to real-time updates for spaces where user is a member
 */
export function subscribeToSpaces(
  userId: string,
  callback: (spaces: Space[]) => void
): () => void {
  const q = query(
    collection(db, SPACES_COLLECTION),
    where('memberUids', 'array-contains', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const spaces = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Space[];

    // Sort by createdAt
    spaces.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

    callback(spaces);
  });
}

/**
 * Get all spaces a user is a member of (one-time fetch)
 */
export async function getUserSpaces(userId: string): Promise<Space[]> {
  const q = query(
    collection(db, SPACES_COLLECTION),
    where('memberUids', 'array-contains', userId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Space));
}

/**
 * Get a space by its 4-digit access code
 */
export async function getSpaceByAccessCode(code: string): Promise<Space | null> {
  const q = query(
    collection(db, SPACES_COLLECTION),
    where('accessCode', '==', code)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Space;
}

export async function createSpace(
  userId: string, 
  name: string, 
  type: SpaceType,
  accessCode?: string
): Promise<string> {
  const spaceData: Omit<Space, 'id'> = {
    name,
    type,
    ownerId: userId,
    members: [{
      uid: userId,
      role: 'admin',
      joinedAt: Date.now()
    }],
    memberUids: [userId], // Helper field for querying
    accessCode,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const docRef = await addDoc(collection(db, SPACES_COLLECTION), spaceData);

  await createActivity({
    app: 'album',
    action: 'created',
    itemType: 'space',
    itemId: docRef.id,
    itemTitle: name,
  });

  return docRef.id;
}

export async function joinSpace(spaceId: string, userId: string): Promise<void> {
  const spaceRef = doc(db, SPACES_COLLECTION, spaceId);
  const spaceDoc = await getDoc(spaceRef);
  
  if (!spaceDoc.exists()) throw new Error('Space not found');
  
  const space = spaceDoc.data() as Space;
  if (space.memberUids.includes(userId)) return; // Already a member

  await updateDoc(spaceRef, {
    members: [...space.members, {
      uid: userId,
      role: 'member',
      joinedAt: Date.now()
    }],
    memberUids: [...space.memberUids, userId],
    updatedAt: Date.now()
  });
}
