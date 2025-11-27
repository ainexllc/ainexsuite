"use client";

import { useState } from "react";
import { SpaceSwitcher as SharedSpaceSwitcher, SpaceEditor as SharedSpaceEditor } from "@ainexsuite/ui";
import type { SpaceItem } from "@ainexsuite/ui";
import type { SpaceType as SharedSpaceType } from "@ainexsuite/types";
import type { SpaceType as JournalSpaceType } from "@/lib/types/space";
import { useSpaces } from "@/components/providers/spaces-provider";
import { useAuth } from "@ainexsuite/auth";

/**
 * Journey app SpaceSwitcher - wraps shared UI component with app-specific data
 */
export function SpaceSwitcher() {
  const { user } = useAuth();
  const { spaces, currentSpaceId, setCurrentSpace, createSpace } = useSpaces();
  const [showSpaceEditor, setShowSpaceEditor] = useState(false);

  // Map JournalSpace to SpaceItem for the shared component
  const spaceItems: SpaceItem[] = spaces.map((space: { id: string; name: string; type: string }) => ({
    id: space.id,
    name: space.name,
    type: space.type as SharedSpaceType,
  }));

  const handleCreateSpace = async (data: { name: string; type: SharedSpaceType }) => {
    if (!user) return;
    // Only allow types supported by journey app
    const journalType = data.type as JournalSpaceType;
    await createSpace({ name: data.name, type: journalType });
  };

  return (
    <>
      <SharedSpaceSwitcher
        spaces={spaceItems}
        currentSpaceId={currentSpaceId}
        onSpaceChange={setCurrentSpace}
        onCreateSpace={() => setShowSpaceEditor(true)}
        spacesLabel="Journal Spaces"
        defaultSpaceName="Personal"
      />

      <SharedSpaceEditor
        isOpen={showSpaceEditor}
        onClose={() => setShowSpaceEditor(false)}
        onSubmit={handleCreateSpace}
        spaceTypes={[
          { value: "personal", label: "Personal", description: "Your private journal" },
          { value: "family", label: "Family", description: "Share memories with family" },
          { value: "couple", label: "Couple", description: "Journal together with your partner" },
        ]}
      />
    </>
  );
}
