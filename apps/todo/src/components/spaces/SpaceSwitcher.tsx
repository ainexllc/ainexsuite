'use client';

import { SpaceSwitcher as SharedSpaceSwitcher } from '@ainexsuite/ui';
import type { SpaceItem } from '@ainexsuite/ui';
import type { SpaceType as SharedSpaceType } from '@ainexsuite/types';
import { useSpaces } from '@/components/providers/spaces-provider';
import { useTodoStore } from '../../lib/store';

/**
 * Todo app SpaceSwitcher - wraps shared UI component with app-specific data
 * Gets spaces from unified SpacesProvider (same as notes app)
 */
export function SpaceSwitcher() {
  const { spaces } = useSpaces();
  const { currentSpaceId, setCurrentSpace } = useTodoStore();

  // Map Space to SpaceItem for the shared component
  const spaceItems: SpaceItem[] = spaces.map((space) => ({
    id: space.id,
    name: space.name,
    type: space.type as SharedSpaceType,
  }));

  return (
    <SharedSpaceSwitcher
      spaces={spaceItems}
      currentSpaceId={currentSpaceId}
      onSpaceChange={setCurrentSpace}
      spacesLabel="Task Spaces"
      defaultSpaceName="My Todos"
    />
  );
}
