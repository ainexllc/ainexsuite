import { createSpacesProvider } from "@ainexsuite/ui";

export const { SpacesProvider, useSpaces } = createSpacesProvider({
  appId: "main",
  collectionName: "spaces",
  storageKey: "main-current-space", // Legacy key - will migrate to unified key
  defaultSpace: { name: "My Workspace", type: "personal" },
  allowedTypes: ["personal", "family", "work", "couple", "buddy", "squad", "project"],
  syncAcrossApps: true, // Enable cross-app space sync
});
