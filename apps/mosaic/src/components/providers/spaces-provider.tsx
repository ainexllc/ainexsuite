import { createSpacesProvider } from "@ainexsuite/ui";

export const { SpacesProvider, useSpaces } = createSpacesProvider({
  appId: "mosaic",
  collectionName: "spaces",
  storageKey: "mosaic-current-space", // Legacy key - will migrate to unified key
  defaultSpace: { name: "My Display", type: "personal" },
  allowedTypes: ["personal", "family", "work", "couple", "buddy", "squad", "project"],
  syncAcrossApps: true, // Enable cross-app space sync
});
