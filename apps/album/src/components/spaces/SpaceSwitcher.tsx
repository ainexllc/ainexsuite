'use client';

import { useState, useEffect } from 'react';
import { SpaceSwitcher as SharedSpaceSwitcher, SpaceEditor as SharedSpaceEditor } from '@ainexsuite/ui';
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
  const { spaces, currentSpaceId, setCurrentSpace, setSpaces, addSpace } = useMomentsStore();
  const [showSpaceEditor, setShowSpaceEditor] = useState(false);

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

  const handleCreateSpace = async (data: { name: string; type: SharedSpaceType }) => {
    if (!user) return;
    await addSpace(user.uid, data.name, data.type);
  };

  return (
    <>
      <SharedSpaceSwitcher
        spaces={spaceItems}
        currentSpaceId={currentSpaceId || 'personal'}
        onSpaceChange={setCurrentSpace}
        onCreateSpace={() => setShowSpaceEditor(true)}
        spacesLabel="Photo Spaces"
        defaultSpaceName="Personal"
      />

      <SharedSpaceEditor
        isOpen={showSpaceEditor}
        onClose={() => setShowSpaceEditor(false)}
        onSubmit={handleCreateSpace}
        spaceTypes={[
          { value: 'personal', label: 'Personal', description: 'Your private photos' },
          { value: 'family', label: 'Family', description: 'Share with family members' },
          { value: 'couple', label: 'Couple', description: 'Share with your partner' },
        ]}
      />
    </>
  );
}
