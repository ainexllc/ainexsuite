"use client";

import { createSpacesProvider } from "@ainexsuite/ui";
import type { Space } from "@ainexsuite/types";

export const { SpacesProvider, useSpaces } = createSpacesProvider<Space>({
  appId: "track",
  collectionName: "spaces",
  storageKey: "track-current-space",
  defaultSpace: {
    name: "My Finances",
    type: "personal",
  },
  allowedTypes: ["personal", "family", "work", "couple", "buddy", "squad", "project"],
});
