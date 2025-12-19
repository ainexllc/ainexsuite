"use client";

import { createSpacesProvider } from "@ainexsuite/ui";
import type { NoteSpace } from "@/lib/types/note";

/**
 * Notes app spaces configuration
 * Uses the shared spaces factory from @ainexsuite/ui
 */
export const { SpacesProvider, useSpaces } = createSpacesProvider<NoteSpace>({
  collectionName: "noteSpaces",
  storageKey: "notes-current-space",
  defaultSpace: {
    name: "My Notes",
    type: "personal",
  },
  allowedTypes: ["personal", "family", "work", "couple", "buddy", "squad", "project"],
});
