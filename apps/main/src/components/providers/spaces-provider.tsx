import { createSpacesProvider } from "@ainexsuite/ui";

export const { SpacesProvider, useSpaces } = createSpacesProvider({
  appId: "main",
  collectionName: "spaces",
  storageKey: "main-current-space",
  defaultSpace: { name: "My Workspace", type: "personal" },
  allowedTypes: ["personal", "family", "work", "couple", "buddy", "squad", "project"],
});
