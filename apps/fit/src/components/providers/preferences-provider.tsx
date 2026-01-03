"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

// Simple preferences for Fit app
interface FitPreferences {
  defaultView: 'dashboard' | 'workouts' | 'nutrition' | 'recipes' | 'supplements';
  defaultUnit: 'kg' | 'lbs';
  waterGoal: number;
  showPersonalRecords: boolean;
}

type PreferencesContextValue = {
  preferences: FitPreferences;
  loading: boolean;
  updatePreferences: (updates: Partial<FitPreferences>) => Promise<void>;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

const DEFAULT_PREFERENCES: FitPreferences = {
  defaultView: 'dashboard',
  defaultUnit: 'lbs',
  waterGoal: 8,
  showPersonalRecords: true,
};

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<FitPreferences>(DEFAULT_PREFERENCES);
  const [loading] = useState(false);

  const handleUpdate = useCallback(async (updates: Partial<FitPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
    // TODO: Persist to Firestore when preferences service is implemented
  }, []);

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
