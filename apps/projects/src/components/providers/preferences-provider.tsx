"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ProjectFilterValue,
  ProjectsPreferences,
  SortConfig,
  ViewMode,
} from "@/lib/types/project";

const STORAGE_KEY = "projects-preferences";
const DEBOUNCE_MS = 500;

const DEFAULT_PREFERENCES: ProjectsPreferences = {
  viewMode: "board",
  focusColumns: 2,
  libraryColumns: 2,
  sortConfig: { field: "updatedAt", direction: "desc" },
  filter: {},
  showArchived: false,
  showCompleted: true,
};

type PreferencesContextValue = {
  preferences: ProjectsPreferences;
  setViewMode: (mode: ViewMode) => void;
  setFocusColumns: (count: number) => void;
  setLibraryColumns: (count: number) => void;
  setSortConfig: (config: SortConfig) => void;
  setFilter: (filter: ProjectFilterValue) => void;
  toggleShowArchived: () => void;
  toggleShowCompleted: () => void;
  resetFilters: () => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

type PreferencesProviderProps = {
  children: React.ReactNode;
};

function loadPreferences(): ProjectsPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PREFERENCES;
    }

    const parsed = JSON.parse(stored) as Partial<ProjectsPreferences>;

    // Merge with defaults to ensure all fields exist
    return {
      viewMode: parsed.viewMode ?? DEFAULT_PREFERENCES.viewMode,
      focusColumns: parsed.focusColumns ?? DEFAULT_PREFERENCES.focusColumns,
      libraryColumns: parsed.libraryColumns ?? DEFAULT_PREFERENCES.libraryColumns,
      sortConfig: parsed.sortConfig ?? DEFAULT_PREFERENCES.sortConfig,
      filter: parsed.filter ?? DEFAULT_PREFERENCES.filter,
      showArchived: parsed.showArchived ?? DEFAULT_PREFERENCES.showArchived,
      showCompleted: parsed.showCompleted ?? DEFAULT_PREFERENCES.showCompleted,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function savePreferences(preferences: ProjectsPreferences): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const [preferences, setPreferences] = useState<ProjectsPreferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = loadPreferences();
    setPreferences(stored);
    setHydrated(true);
  }, []);

  // Debounced persistence to localStorage
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      savePreferences(preferences);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [preferences, hydrated]);

  const setViewMode = useCallback((mode: ViewMode) => {
    setPreferences((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  const setFocusColumns = useCallback((count: number) => {
    setPreferences((prev) => ({ ...prev, focusColumns: count }));
  }, []);

  const setLibraryColumns = useCallback((count: number) => {
    setPreferences((prev) => ({ ...prev, libraryColumns: count }));
  }, []);

  const setSortConfig = useCallback((config: SortConfig) => {
    setPreferences((prev) => ({ ...prev, sortConfig: config }));
  }, []);

  const setFilter = useCallback((filter: ProjectFilterValue) => {
    setPreferences((prev) => ({ ...prev, filter }));
  }, []);

  const toggleShowArchived = useCallback(() => {
    setPreferences((prev) => ({ ...prev, showArchived: !prev.showArchived }));
  }, []);

  const toggleShowCompleted = useCallback(() => {
    setPreferences((prev) => ({ ...prev, showCompleted: !prev.showCompleted }));
  }, []);

  const resetFilters = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      filter: {},
      showArchived: DEFAULT_PREFERENCES.showArchived,
      showCompleted: DEFAULT_PREFERENCES.showCompleted,
    }));
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      preferences,
      setViewMode,
      setFocusColumns,
      setLibraryColumns,
      setSortConfig,
      setFilter,
      toggleShowArchived,
      toggleShowCompleted,
      resetFilters,
    }),
    [
      preferences,
      setViewMode,
      setFocusColumns,
      setLibraryColumns,
      setSortConfig,
      setFilter,
      toggleShowArchived,
      toggleShowCompleted,
      resetFilters,
    ],
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
