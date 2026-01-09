"use client";

import { createSpacesProvider } from "@ainexsuite/ui";
import type { Space } from "@ainexsuite/types";

export const { SpacesProvider, useSpaces } = createSpacesProvider<Space>({
  appId: "subs",
  collectionName: "spaces",
  storageKey: "subs-current-space", // Legacy key - will migrate to unified key
  defaultSpace: {
    name: "My Finances",
    type: "personal",
  },
  allowedTypes: ["personal", "family", "work", "couple", "buddy", "squad", "project"],
  syncAcrossApps: true, // Enable cross-app space sync
});
