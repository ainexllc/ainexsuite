"use client";

import { createSpacesProvider } from "@ainexsuite/ui";
import type { TableSpace } from "@/lib/types/table";

/**
 * Tables app spaces configuration
 * Uses the shared spaces factory from @ainexsuite/ui
 */
export const { SpacesProvider, useSpaces } = createSpacesProvider<TableSpace>({
  appId: "tables",
  collectionName: "spaces",
  storageKey: "tables-current-space",
  defaultSpace: {
    name: "My Tables",
    type: "personal",
  },
  allowedTypes: ["personal", "family", "work", "couple", "buddy", "squad", "project"],
});
