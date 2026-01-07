'use client';

import { SpaceSwitcher as SharedSpaceSwitcher } from '@ainexsuite/ui';
import type { SpaceItem } from '@ainexsuite/ui';
import type { SpaceType as SharedSpaceType } from '@ainexsuite/types';
import { useWorkflowStore } from '@/lib/store';

interface SpaceSwitcherProps {
  /** Callback when user wants to manage spaces */
  onManageSpaces?: () => void;
  /** Callback when user wants to invite people to current space */
  onManagePeople?: () => void;
}

/**
 * Workflow app SpaceSwitcher - wraps shared UI component with app-specific data
 */
export function SpaceSwitcher({ onManageSpaces, onManagePeople }: SpaceSwitcherProps) {
  const { spaces, currentSpaceId, setCurrentSpace } = useWorkflowStore();

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
      onManageSpaces={onManageSpaces}
      onManagePeople={onManagePeople}
      spacesLabel="Workflow Spaces"
      defaultSpaceName="My Workflows"
    />
  );
}
