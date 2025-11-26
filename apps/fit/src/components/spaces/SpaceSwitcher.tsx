'use client';

import { useState } from 'react';
import { SpaceSwitcher as SharedSpaceSwitcher, SpaceEditor as SharedSpaceEditor } from '@ainexsuite/ui';
import type { SpaceItem } from '@ainexsuite/ui';
import type { SpaceType as SharedSpaceType } from '@ainexsuite/types';
import type { SpaceType as FitSpaceType } from '../../types/models';
import { useFitStore } from '../../lib/store';
import { useAuth } from '@ainexsuite/auth';

/**
 * Fit app SpaceSwitcher - wraps shared UI component with app-specific data
 */
export function SpaceSwitcher() {
  const { user } = useAuth();
  const { spaces, currentSpaceId, setCurrentSpace, addSpace } = useFitStore();
  const [showSpaceEditor, setShowSpaceEditor] = useState(false);

  // Map FitSpace to SpaceItem for the shared component
  const spaceItems: SpaceItem[] = spaces.map((space) => ({
    id: space.id,
    name: space.name,
    type: space.type as SharedSpaceType,
  }));

  const handleCreateSpace = async (data: { name: string; type: SharedSpaceType }) => {
    if (!user) return;

    // Only allow types supported by fit app
    const fitType = data.type as FitSpaceType;

    await addSpace({
      id: `fit_space_${Date.now()}`,
      name: data.name,
      type: fitType,
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
        currentSpaceId={currentSpaceId}
        onSpaceChange={setCurrentSpace}
        onCreateSpace={() => setShowSpaceEditor(true)}
        spacesLabel="Workout Spaces"
        defaultSpaceName="My Workouts"
      />

      <SharedSpaceEditor
        isOpen={showSpaceEditor}
        onClose={() => setShowSpaceEditor(false)}
        onSubmit={handleCreateSpace}
        spaceTypes={[
          { value: 'personal', label: 'Personal', description: 'Your private workouts' },
          { value: 'buddy', label: 'Buddy', description: 'Partner workouts' },
          { value: 'squad', label: 'Squad', description: 'Team fitness challenges' },
        ]}
      />
    </>
  );
}

// Re-export as BuddySwitcher for backwards compatibility
export { SpaceSwitcher as BuddySwitcher };
