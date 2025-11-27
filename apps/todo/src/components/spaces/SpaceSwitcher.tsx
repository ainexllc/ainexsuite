'use client';

import { useState } from 'react';
import { SpaceSwitcher as SharedSpaceSwitcher, SpaceEditor as SharedSpaceEditor } from '@ainexsuite/ui';
import type { SpaceItem } from '@ainexsuite/ui';
import type { SpaceType as SharedSpaceType } from '@ainexsuite/types';
import type { SpaceType as TaskSpaceType, TaskList } from '../../types/models';
import { useTodoStore } from '../../lib/store';
import { useAuth } from '@ainexsuite/auth';

/**
 * Todo app SpaceSwitcher - wraps shared UI component with app-specific data
 */
export function SpaceSwitcher() {
  const { user } = useAuth();
  const { spaces, currentSpaceId, setCurrentSpace, addSpace } = useTodoStore();
  const [showSpaceEditor, setShowSpaceEditor] = useState(false);

  // Map TaskSpace to SpaceItem for the shared component
  const spaceItems: SpaceItem[] = spaces.map((space: { id: string; name: string; type: string }) => ({
    id: space.id,
    name: space.name,
    type: space.type as SharedSpaceType,
  }));

  const handleCreateSpace = async (data: { name: string; type: SharedSpaceType }) => {
    if (!user) return;

    // Only allow types supported by todo app
    const taskType = data.type as TaskSpaceType;

    // Default lists for new space
    const defaultLists: TaskList[] = [
      { id: `list_${Date.now()}_1`, title: 'To Do', order: 0 },
      { id: `list_${Date.now()}_2`, title: 'In Progress', order: 1 },
      { id: `list_${Date.now()}_3`, title: 'Done', order: 2 },
    ];

    await addSpace({
      id: `todo_space_${Date.now()}`,
      name: data.name,
      type: taskType,
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
      lists: defaultLists,
    });
  };

  return (
    <>
      <SharedSpaceSwitcher
        spaces={spaceItems}
        currentSpaceId={currentSpaceId}
        onSpaceChange={setCurrentSpace}
        onCreateSpace={() => setShowSpaceEditor(true)}
        spacesLabel="Task Spaces"
        defaultSpaceName="Personal"
      />

      <SharedSpaceEditor
        isOpen={showSpaceEditor}
        onClose={() => setShowSpaceEditor(false)}
        onSubmit={handleCreateSpace}
        spaceTypes={[
          { value: 'personal', label: 'Personal', description: 'Your private tasks and goals' },
          { value: 'family', label: 'Family', description: 'Share with family members' },
          { value: 'work', label: 'Work', description: 'Team projects and tasks' },
        ]}
      />
    </>
  );
}
