'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { getBackgroundOptions, subscribeToBackgrounds, toBackgroundOption } from '@ainexsuite/firebase';
import type { BackgroundDoc, BackgroundOption } from '@ainexsuite/types';

interface BackgroundsContextValue {
  backgrounds: BackgroundOption[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getById: (id: string) => BackgroundOption | undefined;
}

const BackgroundsContext = createContext<BackgroundsContextValue | null>(null);

interface BackgroundsProviderProps {
  children: ReactNode;
}

/**
 * Provider for backgrounds data - centralizes Firestore subscription to prevent
 * multiple subscriptions from individual components
 */
export function BackgroundsProvider({ children }: BackgroundsProviderProps) {
  const [backgrounds, setBackgrounds] = useState<BackgroundOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time updates (single subscription for entire app)
  useEffect(() => {
    let initialLoad = true;

    const unsubscribe = subscribeToBackgrounds((docs: BackgroundDoc[]) => {
      const accessible = docs.filter((bg) => bg.active);
      setBackgrounds(accessible.map(toBackgroundOption));
      if (initialLoad) {
        setIsLoading(false);
        initialLoad = false;
      }
    });

    return () => unsubscribe();
  }, []);

  // Refresh function (manual refresh if needed)
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const options = await getBackgroundOptions();
      setBackgrounds(options);
    } catch (err) {
      console.error('Failed to fetch backgrounds:', err);
      setError('Failed to load backgrounds');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get background by ID - memoized for performance
  const getById = useCallback(
    (id: string): BackgroundOption | undefined => {
      return backgrounds.find((bg) => bg.id === id);
    },
    [backgrounds]
  );

  const value = useMemo<BackgroundsContextValue>(
    () => ({
      backgrounds,
      isLoading,
      error,
      refresh,
      getById,
    }),
    [backgrounds, isLoading, error, refresh, getById]
  );

  return (
    <BackgroundsContext.Provider value={value}>{children}</BackgroundsContext.Provider>
  );
}

export function useBackgrounds(): BackgroundsContextValue {
  const context = useContext(BackgroundsContext);

  if (!context) {
    throw new Error('useBackgrounds must be used within a BackgroundsProvider.');
  }

  return context;
}
