'use client';

import { useState, useEffect } from 'react';
import { SpaceSwitcher as SharedSpaceSwitcher, SpaceEditor as SharedSpaceEditor } from '@ainexsuite/ui';
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
  const { spaces, currentSpaceId, setCurrentSpace, setSpaces, addSpace } = usePulseStore();
  const [showSpaceEditor, setShowSpaceEditor] = useState(false);

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

  const handleCreateSpace = async (data: { name: string; type: SharedSpaceType }) => {
    if (!user) return;

    await addSpace({
      id: `pulse_space_${Date.now()}`,
      name: data.name,
      type: data.type,
      members: [{
        uid: user.uid,
        displayName: user.displayName || 'Me',
        photoURL: user.photoURL || undefined,
        role: 'admin',
        joinedAt: new Date().toISOString()
      }],
      memberUids: [user.uid],
      createdAt: new Date().toISOString(),
      createdBy: user.uid,
    });
  };

  return (
    <>
      <SharedSpaceSwitcher
        spaces={spaceItems}
        currentSpaceId={currentSpaceId || 'personal'}
        onSpaceChange={setCurrentSpace}
        onCreateSpace={() => setShowSpaceEditor(true)}
        spacesLabel="Health Spaces"
        defaultSpaceName="Personal"
      />

      <SharedSpaceEditor
        isOpen={showSpaceEditor}
        onClose={() => setShowSpaceEditor(false)}
        onSubmit={handleCreateSpace}
        spaceTypes={[
          { value: 'personal', label: 'Personal', description: 'Your private health data' },
          { value: 'family', label: 'Family', description: 'Share with family members' },
          { value: 'couple', label: 'Couple', description: 'Share with your partner' },
        ]}
      />
    </>
  );
}
