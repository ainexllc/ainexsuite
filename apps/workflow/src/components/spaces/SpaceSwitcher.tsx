'use client';

import { useState } from 'react';
import { SpaceSwitcher as SharedSpaceSwitcher, SpaceEditor as SharedSpaceEditor } from '@ainexsuite/ui';
import type { SpaceItem } from '@ainexsuite/ui';
import type { SpaceType as SharedSpaceType } from '@ainexsuite/types';
import { useWorkflowStore } from '@/lib/store';
import { useAuth } from '@ainexsuite/auth';

/**
 * Workflow app SpaceSwitcher - wraps shared UI component with app-specific data
 */
export function SpaceSwitcher() {
  const { user } = useAuth();
  const { spaces, currentSpaceId, setCurrentSpace, addSpace } = useWorkflowStore();
  const [showSpaceEditor, setShowSpaceEditor] = useState(false);

  // Map Space to SpaceItem for the shared component
  const spaceItems: SpaceItem[] = spaces.map((space) => ({
    id: space.id,
    name: space.name,
    type: space.type as SharedSpaceType,
  }));

  const handleCreateSpace = async (data: { name: string; type: SharedSpaceType }) => {
    if (!user) return;

    await addSpace({
      id: `workflow_space_${Date.now()}`,
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
        spacesLabel="Workflow Spaces"
        defaultSpaceName="My Workflows"
      />

      <SharedSpaceEditor
        isOpen={showSpaceEditor}
        onClose={() => setShowSpaceEditor(false)}
        onSubmit={handleCreateSpace}
        spaceTypes={[
          { value: 'personal', label: 'Personal', description: 'Your private workflows' },
          { value: 'work', label: 'Work', description: 'Team automation' },
          { value: 'project', label: 'Project', description: 'Project-specific workflows' },
        ]}
      />
    </>
  );
}
