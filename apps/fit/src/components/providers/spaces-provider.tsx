"use client";

import { createSpacesProvider } from "@ainexsuite/ui";
import type { Space } from "@ainexsuite/types";

/**
 * Fit app spaces configuration
 * Uses the shared spaces factory from @ainexsuite/ui
 */
export const { SpacesProvider, useSpaces } = createSpacesProvider<Space>({
  appId: "fit",
  collectionName: "spaces",
  storageKey: "fit-current-space", // Legacy key - will migrate to unified key
  defaultSpace: {
    name: "My Fitness",
    type: "personal",
  },
  allowedTypes: ["personal", "family", "work", "couple", "buddy", "squad", "project"],
  syncAcrossApps: true, // Enable cross-app space sync
});
