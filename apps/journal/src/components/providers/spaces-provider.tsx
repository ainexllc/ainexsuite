"use client";

import { createSpacesProvider } from "@ainexsuite/ui";
import type { JournalSpace } from "@/lib/types/space";

/**
 * Journey app spaces configuration
 * Uses the shared spaces factory from @ainexsuite/ui
 */
export const { SpacesProvider, useSpaces } = createSpacesProvider<JournalSpace>({
  appId: "journal",
  collectionName: "spaces",
  storageKey: "journey-current-space", // Legacy key - will migrate to unified key
  defaultSpace: {
    name: "My Journal",
    type: "personal",
  },
  allowedTypes: ["personal", "family", "work", "couple", "buddy", "squad", "project"],
  syncAcrossApps: true, // Enable cross-app space sync
});
