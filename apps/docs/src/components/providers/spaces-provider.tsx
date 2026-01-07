"use client";

import { createSpacesProvider } from "@ainexsuite/ui";
import type { DocSpace } from "@/lib/types/doc";

/**
 * Notes app spaces configuration
 * Uses the shared spaces factory from @ainexsuite/ui
 */
export const { SpacesProvider, useSpaces } = createSpacesProvider<DocSpace>({
  appId: "docs",
  collectionName: "spaces",
  storageKey: "docs-current-space",
  defaultSpace: {
    name: "My Notes",
    type: "personal",
  },
  allowedTypes: ["personal", "family", "work", "couple", "buddy", "squad", "project"],
});
