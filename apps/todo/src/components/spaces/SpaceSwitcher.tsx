'use client';

import { SpaceSwitcher as SharedSpaceSwitcher } from '@ainexsuite/ui';
import type { SpaceItem } from '@ainexsuite/ui';
import type { SpaceType as SharedSpaceType } from '@ainexsuite/types';
import { useTodoStore } from '../../lib/store';

interface SpaceSwitcherProps {
  /** Callback when user wants to manage spaces */
  onManageSpaces?: () => void;
  /** Callback when user wants to invite people to current space */
  onManagePeople?: () => void;
}

/**
 * Todo app SpaceSwitcher - wraps shared UI component with app-specific data
 */
export function SpaceSwitcher({ onManageSpaces, onManagePeople }: SpaceSwitcherProps) {
  const { spaces, currentSpaceId, setCurrentSpace } = useTodoStore();

  // Map TaskSpace to SpaceItem for the shared component
  // Add virtual "My Todos" personal space, then custom spaces
  const spaceItems: SpaceItem[] = [
    { id: 'all', name: 'All Spaces', type: 'personal' },
    { id: 'personal', name: 'My Todos', type: 'personal' },
    ...spaces
      .filter((space: { id: string; name: string }) => space.id !== 'personal') // Exclude if there's a stored personal space
      .map((space: { id: string; name: string; type: string }) => ({
        id: space.id,
        name: space.name,
        type: space.type as SharedSpaceType,
      }))
  ];

  return (
    <SharedSpaceSwitcher
      spaces={spaceItems}
      currentSpaceId={currentSpaceId}
      onSpaceChange={setCurrentSpace}
      onManageSpaces={onManageSpaces}
      onManagePeople={onManagePeople}
      spacesLabel="Task Spaces"
      defaultSpaceName="My Todos"
    />
  );
}
