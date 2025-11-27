'use client';

import { useState } from 'react';
import { SpaceSwitcher as SharedSpaceSwitcher, SpaceEditor as SharedSpaceEditor } from '@ainexsuite/ui';
import type { SpaceItem } from '@ainexsuite/ui';
import type { SpaceType as SharedSpaceType } from '@ainexsuite/types';
import type { SpaceType as GrowSpaceType } from '../../types/models';
import { useGrowStore } from '../../lib/store';
import { useAuth } from '@ainexsuite/auth';

/**
 * Grow app SpaceSwitcher - wraps shared UI component with app-specific data
 */
export function SpaceSwitcher() {
  const { user } = useAuth();
  const { spaces, currentSpaceId, setCurrentSpace, addSpace } = useGrowStore();
  const [showSpaceEditor, setShowSpaceEditor] = useState(false);

  // Map Space to SpaceItem for the shared component
  const spaceItems: SpaceItem[] = spaces.map((space: { id: string; name: string; type: string }) => ({
    id: space.id,
    name: space.name,
    type: space.type as SharedSpaceType,
  }));

  const handleCreateSpace = async (data: { name: string; type: SharedSpaceType }) => {
    if (!user) return;

    // Only allow types supported by grow app
    const growType = data.type as GrowSpaceType;

    await addSpace({
      id: `grow_space_${Date.now()}`,
      name: data.name,
      type: growType,
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
        spacesLabel="Growth Spaces"
        defaultSpaceName="Personal"
      />

      <SharedSpaceEditor
        isOpen={showSpaceEditor}
        onClose={() => setShowSpaceEditor(false)}
        onSubmit={handleCreateSpace}
        spaceTypes={[
          { value: 'personal', label: 'Personal', description: 'Your private growth' },
          { value: 'couple', label: 'Couple', description: 'Share with your partner' },
          { value: 'family', label: 'Family', description: 'Share with family members' },
          { value: 'squad', label: 'Squad', description: 'Team accountability' },
        ]}
      />
    </>
  );
}
