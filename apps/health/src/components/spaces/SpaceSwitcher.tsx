"use client";

import { useState } from "react";
import { SpaceSwitcher as SharedSpaceSwitcher, SpaceEditor as SharedSpaceEditor } from "@ainexsuite/ui";
import type { SpaceItem } from "@ainexsuite/ui";
import type { SpaceType } from "@ainexsuite/types";
import { useSpaces } from "@/components/providers/spaces-provider";
import { useAuth } from "@ainexsuite/auth";

/**
 * Health app SpaceSwitcher - wraps shared UI component with app-specific data
 */
export function SpaceSwitcher() {
  const { user } = useAuth();
  const { spaces, currentSpaceId, setCurrentSpace, createSpace } = useSpaces();
  const [showSpaceEditor, setShowSpaceEditor] = useState(false);

  // Map HealthSpace to SpaceItem for the shared component
  const spaceItems: SpaceItem[] = spaces.map((space: { id: string; name: string; type: string }) => ({
    id: space.id,
    name: space.name,
    type: space.type as SpaceType,
  }));

  const handleCreateSpace = async (data: { name: string; type: SpaceType }) => {
    if (!user) return;
    await createSpace({ name: data.name, type: data.type });
  };

  return (
    <>
      <SharedSpaceSwitcher
        spaces={spaceItems}
        currentSpaceId={currentSpaceId}
        onSpaceChange={setCurrentSpace}
        onCreateSpace={() => setShowSpaceEditor(true)}
        spacesLabel="Health Spaces"
        defaultSpaceName="Personal"
      />

      <SharedSpaceEditor
        isOpen={showSpaceEditor}
        onClose={() => setShowSpaceEditor(false)}
        onSubmit={handleCreateSpace}
        spaceTypes={[
          { value: "family", label: "Family", description: "Track health with family members" },
        ]}
      />
    </>
  );
}
