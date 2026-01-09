'use client';

import { useEffect } from 'react';
import { SpaceSwitcher as SharedSpaceSwitcher } from '@ainexsuite/ui';
import type { SpaceItem } from '@ainexsuite/ui';
import type { SpaceType as SharedSpaceType } from '@ainexsuite/types';
import { usePulseStore } from '@/lib/store';
import { useAuth } from '@ainexsuite/auth';
import { SpaceService } from '@/lib/space-service';

/**
 * Pulse app SpaceSwitcher - wraps shared UI component with app-specific data
 */
export function SpaceSwitcher() {
  const { user } = useAuth();
  const { spaces, currentSpaceId, setCurrentSpace, setSpaces } = usePulseStore();

  // Subscribe to spaces from Firestore
  useEffect(() => {
    if (!user) return;

    const unsubscribe = SpaceService.subscribeToSpaces(user.uid, (firestoreSpaces) => {
      setSpaces(firestoreSpaces);
    });

    return () => unsubscribe();
  }, [user, setSpaces]);

  // Map Space to SpaceItem for the shared component
  const spaceItems: SpaceItem[] = spaces.map((space: { id: string; name: string; type: string }) => ({
    id: space.id,
    name: space.name,
    type: space.type as SharedSpaceType,
  }));

  return (
    <SharedSpaceSwitcher
      spaces={spaceItems}
      currentSpaceId={currentSpaceId || 'personal'}
      onSpaceChange={setCurrentSpace}
      spacesLabel="Health Spaces"
      defaultSpaceName="Personal"
    />
  );
}
