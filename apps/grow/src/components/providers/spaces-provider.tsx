"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useGrowStore } from "@/lib/store";
import type { Space } from "@/types/models";

/**
 * Context value provided by SpacesProvider
 */
interface SpacesContextValue {
  spaces: Space[];
  currentSpace: Space | null;
  currentSpaceId: string;
  loading: boolean;
  setCurrentSpace: (spaceId: string) => void;
}

const SpacesContext = createContext<SpacesContextValue | null>(null);

interface SpacesProviderProps {
  children: ReactNode;
}

/**
 * Grow app SpacesProvider
 * Wraps the Zustand store to provide spaces through React context
 */
export function SpacesProvider({ children }: SpacesProviderProps) {
  const {
    spaces,
    currentSpaceId,
    setCurrentSpace,
    getCurrentSpace,
  } = useGrowStore();

  const currentSpace = getCurrentSpace() || null;

  const value = useMemo<SpacesContextValue>(
    () => ({
      spaces,
      currentSpace,
      currentSpaceId,
      loading: false, // Data comes from Zustand store synced via FirestoreSync
      setCurrentSpace,
    }),
    [spaces, currentSpace, currentSpaceId, setCurrentSpace]
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
