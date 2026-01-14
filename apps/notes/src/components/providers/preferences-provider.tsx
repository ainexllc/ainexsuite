"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@ainexsuite/auth";
import type { UserPreference } from "@/lib/types/settings";
import {
  DEFAULT_PREFERENCES,
  subscribeToPreferences,
  updatePreferences as updatePreferencesMutation,
} from "@/lib/firebase/preferences-service";

type PreferencesContextValue = {
  preferences: UserPreference;
  loading: boolean;
  updatePreferences: (
    updates: Partial<Omit<UserPreference, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<void>;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

type PreferencesProviderProps = {
  children: React.ReactNode;
};

const INITIAL_PREFERENCES: UserPreference = {
  id: "anonymous",
  ...DEFAULT_PREFERENCES,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const { user, loading: authLoading } = useAuth();
  const [preferences, setPreferences] = useState<UserPreference>(INITIAL_PREFERENCES);
  const [loading, setLoading] = useState(true);

  // The shared auth package uses `uid`, not `id`
  const userId = user?.uid ?? null;

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // No user = not authenticated
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
  }, [authLoading, userId]);

  const handleUpdate = useCallback(
    async (updates: Partial<Omit<UserPreference, "id" | "createdAt" | "updatedAt">>) => {
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

// Default context value for SSG/SSR when no provider is present
const defaultPreferencesValue: PreferencesContextValue = {
  preferences: INITIAL_PREFERENCES,
  loading: true,
  updatePreferences: async () => {},
};

export function usePreferences() {
  const context = useContext(PreferencesContext);

  // Return default values during SSG/SSR instead of throwing
  if (!context) {
    return defaultPreferencesValue;
  }

  return context;
}
