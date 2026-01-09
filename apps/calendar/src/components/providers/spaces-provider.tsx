"use client";

import { createSpacesProvider } from "@ainexsuite/ui";
import type { SpaceType } from "@ainexsuite/types";

/**
 * Calendar space type definition
 */
export interface CalendarSpace {
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
  createdAt: Date | number;
  ownerId: string;
}

/**
 * Calendar app spaces configuration
 * Uses the shared spaces factory from @ainexsuite/ui
 */
export const { SpacesProvider, useSpaces } = createSpacesProvider<CalendarSpace>({
  appId: "calendar",
  collectionName: "spaces",
  storageKey: "calendar-current-space", // Legacy key - will migrate to unified key
  defaultSpace: {
    name: "My Calendar",
    type: "personal",
  },
  allowedTypes: ["personal", "family", "work", "couple", "buddy", "squad", "project"],
  syncAcrossApps: true, // Enable cross-app space sync
});
