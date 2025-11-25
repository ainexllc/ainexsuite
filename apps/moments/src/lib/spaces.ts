import { db, createActivity } from '@ainexsuite/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc
} from 'firebase/firestore';
import type { Space, SpaceType } from '@ainexsuite/types';

const SPACES_COLLECTION = 'moments_spaces';

/**
 * Get all spaces a user is a member of
 */
export async function getUserSpaces(userId: string): Promise<Space[]> {
  // Query spaces where user is in members array
  // Note: This requires a composite index on members.uid if checking specific fields
  // For now, we'll fetch all spaces where user is owner or we might need a better query structure
  // or store member IDs in a separate array field 'memberUids' for simpler querying
  
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
    app: 'moments',
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
