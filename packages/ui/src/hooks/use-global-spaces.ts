'use client';

import { useState, useEffect } from 'react';
import { db } from '@ainexsuite/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';
import type { GlobalSpaceItem } from '../components/settings/settings-modal';
import type { SpaceType } from '@ainexsuite/types';

interface SpaceDocData {
  name: string;
  type: SpaceType;
  members: Array<{
    uid: string;
    displayName?: string;
    photoURL?: string;
    role: string;
    joinedAt: string | number;
  }>;
  memberUids: string[];
  isGlobal?: boolean;
  ownerId?: string;
  description?: string;
}

interface UseGlobalSpacesOptions {
  /** Collection name for spaces (default: 'spaces') */
  collectionName?: string;
  /** Current user ID to filter out spaces they're already in */
  userId?: string | null;
}

interface UseGlobalSpacesReturn {
  /** List of global spaces the user can join */
  globalSpaces: GlobalSpaceItem[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Join a global space */
  joinSpace: (spaceId: string, user: { uid: string; displayName?: string | null; photoURL?: string | null }) => Promise<void>;
}

/**
 * Hook to fetch and manage global spaces that users can join
 */
export function useGlobalSpaces({
  collectionName = 'spaces',
  userId,
}: UseGlobalSpacesOptions = {}): UseGlobalSpacesReturn {
  const [globalSpaces, setGlobalSpaces] = useState<GlobalSpaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setGlobalSpaces([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const spacesRef = collection(db, collectionName);
    const q = query(
      spacesRef,
      where('isGlobal', '==', true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const spaces: GlobalSpaceItem[] = [];

        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data() as SpaceDocData;

          // Skip spaces the user is already a member of
          if (data.memberUids?.includes(userId)) {
            return;
          }

          // Find owner name from members
          const owner = data.members?.find((m) => m.uid === data.ownerId);
          const ownerName = owner?.displayName || undefined;

          spaces.push({
            id: docSnap.id,
            name: data.name,
            type: data.type,
            memberCount: data.memberUids?.length || data.members?.length || 0,
            description: data.description,
            ownerName,
          });
        });

        setGlobalSpaces(spaces);
        setLoading(false);
        setError(null);
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error('[GlobalSpaces] Error fetching global spaces:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, userId]);

  const joinSpace = async (
    spaceId: string,
    user: { uid: string; displayName?: string | null; photoURL?: string | null }
  ) => {
    if (!user.uid) {
      throw new Error('Must be authenticated to join a space');
    }

    const spaceRef = doc(db, collectionName, spaceId);

    const newMember = {
      uid: user.uid,
      displayName: user.displayName || 'User',
      photoURL: user.photoURL || undefined,
      role: 'member',
      joinedAt: Timestamp.now(),
    };

    await updateDoc(spaceRef, {
      members: arrayUnion(newMember),
      memberUids: arrayUnion(user.uid),
    });
  };

  return {
    globalSpaces,
    loading,
    error,
    joinSpace,
  };
}
