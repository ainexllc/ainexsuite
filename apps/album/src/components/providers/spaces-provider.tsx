"use client";

import { createSpacesProvider } from "@ainexsuite/ui";
import type { SpaceType } from "@ainexsuite/types";

/**
 * Moments space type definition
 */
export interface MomentsSpace {
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
  ownerId: string;
  accessCode?: string;
  createdAt: Date;
  updatedAt?: Date;
  createdBy: string;
}

/**
 * Moments app spaces configuration
 * Uses the shared spaces factory from @ainexsuite/ui
 */
export const { SpacesProvider, useSpaces } = createSpacesProvider<MomentsSpace>({
  appId: "album",
  collectionName: "spaces",
  storageKey: "moments-current-space",
  defaultSpace: {
    name: "My Memories",
    type: "personal",
  },
  allowedTypes: ["personal", "family", "work", "couple", "buddy", "squad", "project"],
});
