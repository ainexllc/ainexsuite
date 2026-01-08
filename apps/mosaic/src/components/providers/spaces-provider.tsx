import { createSpacesProvider } from "@ainexsuite/ui";

export const { SpacesProvider, useSpaces } = createSpacesProvider({
  appId: "mosaic",
  collectionName: "spaces",
  storageKey: "mosaic-current-space",
  defaultSpace: { name: "My Display", type: "personal" },
  allowedTypes: ["personal", "family", "work", "couple", "buddy", "squad", "project"],
});
