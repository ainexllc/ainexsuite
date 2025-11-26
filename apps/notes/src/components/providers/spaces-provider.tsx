"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useAuth } from "@ainexsuite/auth";
import type { NoteSpace, NoteSpaceDraft, SpaceType } from "@/lib/types/note";
import {
  subscribeToSpaces,
  createSpace as createSpaceMutation,
  updateSpace as updateSpaceMutation,
  deleteSpace as deleteSpaceMutation,
} from "@/lib/firebase/space-service";

// Default personal space (virtual - not stored in Firestore)
const DEFAULT_PERSONAL_SPACE: NoteSpace = {
  id: "personal",
  name: "My Notes",
  type: "personal",
  members: [],
  memberUids: [],
  createdAt: new Date(),
  createdBy: "",
};

type SpacesContextValue = {
  spaces: NoteSpace[];
  currentSpace: NoteSpace;
  currentSpaceId: string;
  loading: boolean;
  setCurrentSpace: (spaceId: string) => void;
  createSpace: (input: { name: string; type: SpaceType }) => Promise<string>;
  updateSpace: (spaceId: string, updates: NoteSpaceDraft) => Promise<void>;
  deleteSpace: (spaceId: string) => Promise<void>;
};

const SpacesContext = createContext<SpacesContextValue | null>(null);

type SpacesProviderProps = {
  children: React.ReactNode;
};

export function SpacesProvider({ children }: SpacesProviderProps) {
  const { user } = useAuth();
  const [userSpaces, setUserSpaces] = useState<NoteSpace[]>([]);
  const [currentSpaceId, setCurrentSpaceId] = useState<string>("personal");
  const [loading, setLoading] = useState(true);

  const userId = user?.uid ?? null;

  // Subscribe to user's spaces
  useEffect(() => {
    if (!userId) {
      setUserSpaces([]);
      setCurrentSpaceId("personal");
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToSpaces(
      userId,
      (spaces) => {
        setUserSpaces(spaces);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // All spaces including virtual personal space
  const spaces = useMemo(() => {
    const personalSpace: NoteSpace = {
      ...DEFAULT_PERSONAL_SPACE,
      createdBy: userId || "",
      memberUids: userId ? [userId] : [],
    };
    return [personalSpace, ...userSpaces];
  }, [userSpaces, userId]);

  // Get current space object
  const currentSpace = useMemo(() => {
    return spaces.find((s) => s.id === currentSpaceId) || spaces[0];
  }, [spaces, currentSpaceId]);

  const handleSetCurrentSpace = useCallback((spaceId: string) => {
    setCurrentSpaceId(spaceId);
    // Persist to localStorage for session persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("notes-current-space", spaceId);
    }
  }, []);

  // Restore current space from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSpaceId = localStorage.getItem("notes-current-space");
      if (savedSpaceId) {
        setCurrentSpaceId(savedSpaceId);
      }
    }
  }, []);

  const handleCreateSpace = useCallback(
    async (input: { name: string; type: SpaceType }) => {
      if (!userId || !user) {
        throw new Error("Must be authenticated to create a space");
      }

      const spaceId = await createSpaceMutation(
        userId,
        user.displayName || "Me",
        user.photoURL || undefined,
        input
      );

      // Auto-switch to the new space
      handleSetCurrentSpace(spaceId);

      return spaceId;
    },
    [userId, user, handleSetCurrentSpace]
  );

  const handleUpdateSpace = useCallback(
    async (spaceId: string, updates: NoteSpaceDraft) => {
      await updateSpaceMutation(spaceId, updates);
    },
    []
  );

  const handleDeleteSpace = useCallback(
    async (spaceId: string) => {
      await deleteSpaceMutation(spaceId);
      // Switch back to personal space if deleting current
      if (currentSpaceId === spaceId) {
        handleSetCurrentSpace("personal");
      }
    },
    [currentSpaceId, handleSetCurrentSpace]
  );

  const value = useMemo<SpacesContextValue>(
    () => ({
      spaces,
      currentSpace,
      currentSpaceId,
      loading,
      setCurrentSpace: handleSetCurrentSpace,
      createSpace: handleCreateSpace,
      updateSpace: handleUpdateSpace,
      deleteSpace: handleDeleteSpace,
    }),
    [
      spaces,
      currentSpace,
      currentSpaceId,
      loading,
      handleSetCurrentSpace,
      handleCreateSpace,
      handleUpdateSpace,
      handleDeleteSpace,
    ]
  );

  return (
    <SpacesContext.Provider value={value}>{children}</SpacesContext.Provider>
  );
}

export function useSpaces() {
  const context = useContext(SpacesContext);

  if (!context) {
    throw new Error("useSpaces must be used within a SpacesProvider.");
  }

  return context;
}
