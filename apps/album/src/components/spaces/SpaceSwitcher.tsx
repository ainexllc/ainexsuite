'use client';

import { useEffect } from 'react';
import { SpaceSwitcher as SharedSpaceSwitcher } from '@ainexsuite/ui';
import type { SpaceItem } from '@ainexsuite/ui';
import type { SpaceType as SharedSpaceType } from '@ainexsuite/types';
import { useMomentsStore } from '@/lib/store';
import { useAuth } from '@ainexsuite/auth';
import { subscribeToSpaces } from '@/lib/spaces';

/**
 * Moments app SpaceSwitcher - wraps shared UI component with app-specific data
 */
export function SpaceSwitcher() {
  const { user } = useAuth();
  const { spaces, currentSpaceId, setCurrentSpace, setSpaces } = useMomentsStore();

  // Subscribe to spaces from Firestore
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToSpaces(user.uid, (firestoreSpaces) => {
      setSpaces(firestoreSpaces);
    });

    return () => unsubscribe();
  }, [user, setSpaces]);

  // Map Space to SpaceItem for the shared component
  const spaceItems: SpaceItem[] = spaces.map((space: { id: string; name: string; type: string }) => ({
    id: space.id,
    name: space.name,
    type: (space.type || 'family') as SharedSpaceType,
  }));

  return (
    <SharedSpaceSwitcher
      spaces={spaceItems}
      currentSpaceId={currentSpaceId || 'personal'}
      onSpaceChange={setCurrentSpace}
      spacesLabel="Photo Spaces"
      defaultSpaceName="Personal"
    />
  );
}
