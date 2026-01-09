"use client";

import { createSpacesProvider } from "@ainexsuite/ui";
import type { Space } from "@/types/models";

/**
 * Habits app spaces configuration
 * Uses the shared spaces factory from @ainexsuite/ui
 */
export const { SpacesProvider, useSpaces } = createSpacesProvider<Space>({
  appId: "habits",
  collectionName: "spaces",
  storageKey: "habits-current-space", // Legacy key - will migrate to unified key
  defaultSpace: {
    name: "My Habits",
    type: "personal",
  },
  allowedTypes: ["personal", "family", "couple", "work"],
  syncAcrossApps: true, // Enable cross-app space sync
});
