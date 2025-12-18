import { db } from '@ainexsuite/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import type { PulseSpace } from '../types/models';

const COLLECTION = 'pulse_spaces';

export const SpaceService = {
  /**
   * Subscribe to spaces where user is a member
   */
  subscribeToSpaces(userId: string, callback: (spaces: PulseSpace[]) => void) {
    const q = query(
      collection(db, COLLECTION),
      where('memberUids', 'array-contains', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const spaces = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PulseSpace[];

      // Sort by createdAt
      spaces.sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      callback(spaces);
    });
  },

  /**
   * Create a new space
   */
  async createSpace(space: PulseSpace): Promise<void> {
    const docRef = doc(db, COLLECTION, space.id);
    await setDoc(docRef, {
      ...space,
      createdAt: serverTimestamp(),
    });
  },

  /**
   * Update a space
   */
  async updateSpace(spaceId: string, data: Partial<PulseSpace>): Promise<void> {
    const docRef = doc(db, COLLECTION, spaceId);
    await setDoc(docRef, data, { merge: true });
  },

  /**
   * Delete a space
   */
  async deleteSpace(spaceId: string): Promise<void> {
    const docRef = doc(db, COLLECTION, spaceId);
    await deleteDoc(docRef);
  },
};
