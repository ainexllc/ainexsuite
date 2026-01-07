'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { getCoverOptions, subscribeToCovers, toCoverOption } from '@ainexsuite/firebase';
import type { CoverDoc, CoverOption } from '@ainexsuite/types';

interface CoversContextValue {
  covers: CoverOption[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getById: (id: string) => CoverOption | undefined;
}

const CoversContext = createContext<CoversContextValue | null>(null);

interface CoversProviderProps {
  children: ReactNode;
}

/**
 * Provider for covers data - centralizes Firestore subscription to prevent
 * multiple subscriptions from individual components
 */
export function CoversProvider({ children }: CoversProviderProps) {
  const [covers, setCovers] = useState<CoverOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time updates (single subscription for entire app)
  useEffect(() => {
    let initialLoad = true;

    const unsubscribe = subscribeToCovers((docs: CoverDoc[]) => {
      const accessible = docs.filter((cover) => cover.active);
      setCovers(accessible.map(toCoverOption));
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
      const options = await getCoverOptions();
      setCovers(options);
    } catch (err) {
      console.error('Failed to fetch covers:', err);
      setError('Failed to load covers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get cover by ID - memoized for performance
  const getById = useCallback(
    (id: string): CoverOption | undefined => {
      return covers.find((cover) => cover.id === id);
    },
    [covers]
  );

  const value = useMemo<CoversContextValue>(
    () => ({
      covers,
      isLoading,
      error,
      refresh,
      getById,
    }),
    [covers, isLoading, error, refresh, getById]
  );

  return (
    <CoversContext.Provider value={value}>{children}</CoversContext.Provider>
  );
}

export function useCovers(): CoversContextValue {
  const context = useContext(CoversContext);

  if (!context) {
    throw new Error('useCovers must be used within a CoversProvider.');
  }

  return context;
}
