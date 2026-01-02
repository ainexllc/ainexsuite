"use client";

import { createSpacesProvider } from "@ainexsuite/ui";
import type { Space } from "@ainexsuite/types";

/**
 * Projects app spaces configuration
 * Uses the shared spaces factory from @ainexsuite/ui
 */
export const { SpacesProvider, useSpaces } = createSpacesProvider<Space>({
  appId: "projects",
  collectionName: "spaces",
  storageKey: "projects-current-space",
  defaultSpace: {
    name: "My Projects",
    type: "personal",
  },
  allowedTypes: ["personal", "family", "work", "couple", "buddy", "squad", "project"],
});
