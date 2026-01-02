"use client";

import { SpaceSwitcher as SharedSpaceSwitcher } from "@ainexsuite/ui";
import type { SpaceItem } from "@ainexsuite/ui";
import type { SpaceType } from "@ainexsuite/types";
import { useSpaces } from "@/components/providers/spaces-provider";

interface SpaceSwitcherProps {
  /** Callback when user wants to manage spaces */
  onManageSpaces?: () => void;
  /** Callback when user wants to invite people to current space */
  onManagePeople?: () => void;
}

/**
 * Health app SpaceSwitcher - wraps shared UI component with app-specific data
 */
export function SpaceSwitcher({ onManageSpaces, onManagePeople }: SpaceSwitcherProps) {
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
      onManageSpaces={onManageSpaces}
      onManagePeople={onManagePeople}
      spacesLabel="Health Spaces"
      defaultSpaceName="Personal"
    />
  );
}
