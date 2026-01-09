'use client';

import { SpaceSwitcher as SharedSpaceSwitcher } from '@ainexsuite/ui';
import type { SpaceItem } from '@ainexsuite/ui';
import type { SpaceType as SharedSpaceType } from '@ainexsuite/types';
import { useSpaces } from '@/components/providers/spaces-provider';

/**
 * Calendar app SpaceSwitcher - wraps shared UI component with app-specific data
 */
export function SpaceSwitcher() {
  const { spaces, currentSpaceId, setCurrentSpace } = useSpaces();

  // Map CalendarSpace to SpaceItem for the shared component
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
      spacesLabel="Calendar Spaces"
      defaultSpaceName="Personal"
    />
  );
}
