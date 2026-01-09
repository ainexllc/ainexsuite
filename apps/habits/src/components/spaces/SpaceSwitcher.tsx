'use client';

import { SpaceSwitcher as SharedSpaceSwitcher } from '@ainexsuite/ui';
import type { SpaceItem } from '@ainexsuite/ui';
import type { SpaceType as SharedSpaceType } from '@ainexsuite/types';
import { useSpaces } from '../providers/spaces-provider';
import { Hint, HINTS } from '../hints';

/**
 * Habits app SpaceSwitcher - wraps shared UI component with app-specific data
 */
export function SpaceSwitcher() {
  const { spaces, currentSpaceId, setCurrentSpace } = useSpaces();

  // Map Space to SpaceItem for the shared component
  const spaceItems: SpaceItem[] = spaces.map((space: { id: string; name: string; type: string }) => ({
    id: space.id,
    name: space.name,
    type: space.type as SharedSpaceType,
  }));

  // Show family space hint when user only has personal space
  const hasOnlyPersonalSpace = spaces.length === 1 && spaces[0].type === 'personal';

  return (
    <Hint hint={HINTS.FAMILY_SPACE} showWhen={hasOnlyPersonalSpace}>
      <SharedSpaceSwitcher
        spaces={spaceItems}
        currentSpaceId={currentSpaceId}
        onSpaceChange={setCurrentSpace}
        spacesLabel="Habit Spaces"
        defaultSpaceName="My Habits"
      />
    </Hint>
  );
}
