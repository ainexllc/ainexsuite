"use client";

import { createSpacesProvider } from "@ainexsuite/ui";
import type { NoteSpace } from "@/lib/types/note";

/**
 * Notes app spaces configuration
 * Uses the shared spaces factory from @ainexsuite/ui
 */
export const { SpacesProvider, useSpaces } = createSpacesProvider<NoteSpace>({
  appId: "notes",
  collectionName: "spaces",
  storageKey: "notes-current-space", // Legacy key - will migrate to unified key
  defaultSpace: {
    name: "My Notes",
    type: "personal",
  },
  allowedTypes: ["personal", "family", "work", "couple", "buddy", "squad", "project"],
  syncAcrossApps: true, // Enable cross-app space sync
});
