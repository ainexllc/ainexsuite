"use client";

import { createSpacesProvider } from "@ainexsuite/ui";
import type { WorkflowSpace } from "@/lib/types/workflow";

/**
 * Workflow app spaces configuration
 * Uses the shared spaces factory from @ainexsuite/ui
 */
export const { SpacesProvider, useSpaces } = createSpacesProvider<WorkflowSpace>({
  appId: "workflow",
  collectionName: "spaces",
  storageKey: "workflow-current-space",
  defaultSpace: {
    name: "My Workflows",
    type: "personal",
  },
  allowedTypes: ["personal", "family", "work", "couple", "buddy", "squad", "project"],
});
