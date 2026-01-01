"use client";

import { createSpacesProvider } from "@ainexsuite/ui";
import type { SpaceType } from "@ainexsuite/types";

/**
 * Health space type definition
 */
export interface HealthSpace {
  id: string;
  name: string;
  type: SpaceType;
  members: Array<{
    uid: string;
    displayName: string;
    photoURL?: string;
    role: "admin" | "member" | "viewer";
    joinedAt: string;
  }>;
  memberUids: string[];
  createdAt: Date;
  createdBy: string;
}

/**
 * Health app spaces configuration
 * Uses the shared spaces factory from @ainexsuite/ui
 */
export const { SpacesProvider, useSpaces } = createSpacesProvider<HealthSpace>({
  appId: "health",
  collectionName: "spaces",
  storageKey: "health-current-space",
  defaultSpace: {
    name: "My Health",
    type: "personal",
  },
  allowedTypes: ["personal", "family", "work", "couple", "buddy", "squad", "project"],
});
