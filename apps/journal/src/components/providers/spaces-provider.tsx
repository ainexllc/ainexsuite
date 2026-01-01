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
  storageKey: "journey-current-space",
  defaultSpace: {
    name: "My Journal",
    type: "personal",
  },
  allowedTypes: ["personal", "family", "work", "couple", "buddy", "squad", "project"],
});
