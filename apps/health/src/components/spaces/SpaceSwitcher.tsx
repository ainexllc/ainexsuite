"use client";

import { SpaceSwitcher as SharedSpaceSwitcher } from "@ainexsuite/ui";
import type { SpaceItem } from "@ainexsuite/ui";
import type { SpaceType } from "@ainexsuite/types";
import { useSpaces } from "@/components/providers/spaces-provider";

/**
 * Health app SpaceSwitcher - wraps shared UI component with app-specific data
 */
export function SpaceSwitcher() {
  const { spaces, currentSpaceId, setCurrentSpace } = useSpaces();

  // Map HealthSpace to SpaceItem for the shared component
  const spaceItems: SpaceItem[] = spaces.map((space: { id: string; name: string; type: string }) => ({
    id: space.id,
    name: space.name,
    type: space.type as SpaceType,
  }));

  return (
    <SharedSpaceSwitcher
      spaces={spaceItems}
      currentSpaceId={currentSpaceId}
      onSpaceChange={setCurrentSpace}
      spacesLabel="Health Spaces"
      defaultSpaceName="Personal"
    />
  );
}
