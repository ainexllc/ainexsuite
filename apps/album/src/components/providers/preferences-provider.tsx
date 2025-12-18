"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useWorkspaceAuth } from "@ainexsuite/auth";
import type { MomentsPreferences } from "@/lib/types/settings";
import {
  subscribeToPreferences,
  updatePreferences as updatePreferencesMutation,
} from "@/lib/firebase/preferences-service";
import { DEFAULT_MOMENTS_PREFERENCES } from "@/lib/types/settings";

type PreferencesContextValue = {
  preferences: MomentsPreferences;
  loading: boolean;
  updatePreferences: (
    updates: Partial<Omit<MomentsPreferences, "id" | "userId" | "createdAt" | "updatedAt">>,
  ) => Promise<void>;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

type PreferencesProviderProps = {
  children: React.ReactNode;
};

const INITIAL_PREFERENCES: MomentsPreferences = {
  id: "anonymous",
  userId: "anonymous",
  ...DEFAULT_MOMENTS_PREFERENCES,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const { user } = useWorkspaceAuth();
  const [preferences, setPreferences] = useState<MomentsPreferences>(INITIAL_PREFERENCES);
  const [loading, setLoading] = useState(true);

  const userId = user?.uid ?? null;

  useEffect(() => {
    if (!userId) {
      setPreferences(INITIAL_PREFERENCES);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToPreferences(userId, (incoming) => {
      setPreferences(incoming);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleUpdate = useCallback(
    async (updates: Partial<Omit<MomentsPreferences, "id" | "userId" | "createdAt" | "updatedAt">>) => {
      // Optimistic update
      setPreferences((prev) => ({ ...prev, ...updates }));

      if (!userId) {
        return;
      }

      await updatePreferencesMutation(userId, updates);
    },
    [userId],
  );

  const value = useMemo<PreferencesContextValue>(
    () => ({
      preferences,
      loading,
      updatePreferences: handleUpdate,
    }),
    [preferences, loading, handleUpdate],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider.");
  }

  return context;
}
