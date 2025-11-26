"use client";

import { useState } from "react";
import { SpaceSwitcher as SharedSpaceSwitcher, SpaceEditor as SharedSpaceEditor } from "@ainexsuite/ui";
import type { SpaceItem } from "@ainexsuite/ui";
import type { SpaceType as SharedSpaceType } from "@ainexsuite/types";
import type { SpaceType as NoteSpaceType } from "@/lib/types/note";
import { useSpaces } from "@/components/providers/spaces-provider";
import { useAuth } from "@ainexsuite/auth";

/**
 * Notes app SpaceSwitcher - wraps shared UI component with app-specific data
 */
export function SpaceSwitcher() {
  const { user } = useAuth();
  const { spaces, currentSpaceId, setCurrentSpace, createSpace } = useSpaces();
  const [showSpaceEditor, setShowSpaceEditor] = useState(false);

  // Map NoteSpace to SpaceItem for the shared component
  const spaceItems: SpaceItem[] = spaces.map((space) => ({
    id: space.id,
    name: space.name,
    type: space.type as SharedSpaceType,
  }));

  const handleCreateSpace = async (data: { name: string; type: SharedSpaceType }) => {
    if (!user) return;
    // Only allow types supported by notes app
    const noteType = data.type as NoteSpaceType;
    await createSpace({ name: data.name, type: noteType });
  };

  return (
    <>
      <SharedSpaceSwitcher
        spaces={spaceItems}
        currentSpaceId={currentSpaceId}
        onSpaceChange={setCurrentSpace}
        onCreateSpace={() => setShowSpaceEditor(true)}
        spacesLabel="Note Spaces"
        defaultSpaceName="My Notes"
      />

      <SharedSpaceEditor
        isOpen={showSpaceEditor}
        onClose={() => setShowSpaceEditor(false)}
        onSubmit={handleCreateSpace}
        spaceTypes={[
          { value: "personal", label: "Personal", description: "Your private notes" },
          { value: "family", label: "Family", description: "Share with family members" },
          { value: "work", label: "Work", description: "Team notes and projects" },
        ]}
      />
    </>
  );
}
