'use client';

import { SpaceSwitcher as SharedSpaceSwitcher } from '@ainexsuite/ui';
import type { SpaceItem } from '@ainexsuite/ui';
import type { SpaceType as SharedSpaceType } from '@ainexsuite/types';
import { useProjectsStore } from '@/lib/store';

/**
 * Projects app SpaceSwitcher - wraps shared UI component with app-specific data
 */
export function SpaceSwitcher() {
  const { spaces, currentSpaceId, setCurrentSpace } = useProjectsStore();

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
      spacesLabel="Project Spaces"
      defaultSpaceName="Personal"
    />
  );
}
