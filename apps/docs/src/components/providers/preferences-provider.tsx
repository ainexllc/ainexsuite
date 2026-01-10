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
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const [preferences, setPreferences] = useState<UserPreference>(INITIAL_PREFERENCES);
  const [loading, setLoading] = useState(true);

  // The shared auth package uses `uid`, not `id`
  const userId = user?.uid ?? null;
  // Wait for Firebase Auth to be signed in before subscribing to Firestore
  const isFirestoreReady = !authLoading && !!userId && !!firebaseUser;

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // No user or Firebase Auth not ready = don't subscribe to Firestore
    if (!isFirestoreReady) {
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
  }, [authLoading, userId, isFirestoreReady]);

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

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider.");
  }

  return context;
}
