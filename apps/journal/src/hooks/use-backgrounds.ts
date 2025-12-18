'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBackgroundOptions, subscribeToBackgrounds, toBackgroundOption } from '@ainexsuite/firebase';
import type { BackgroundDoc, BackgroundOption } from '@ainexsuite/types';

interface UseBackgroundsReturn {
  backgrounds: BackgroundOption[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getById: (id: string) => BackgroundOption | undefined;
}

/**
 * Hook to fetch and manage backgrounds from Firestore
 */
export function useBackgrounds(): UseBackgroundsReturn {
  const [backgrounds, setBackgrounds] = useState<BackgroundOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch backgrounds
  const fetchBackgrounds = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const options = await getBackgroundOptions();
      setBackgrounds(options);
    } catch (err) {
      console.error('Failed to fetch backgrounds:', err);
      setError('Failed to load backgrounds');
      setBackgrounds([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchBackgrounds();
  }, [fetchBackgrounds]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToBackgrounds(
      (docs: BackgroundDoc[]) => {
        const accessible = docs.filter((bg) => bg.active);
        setBackgrounds(accessible.map(toBackgroundOption));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Get background by ID
  const getById = useCallback(
    (id: string): BackgroundOption | undefined => {
      return backgrounds.find((bg) => bg.id === id);
    },
    [backgrounds]
  );

  // Refresh function
  const refresh = useCallback(async () => {
    await fetchBackgrounds();
  }, [fetchBackgrounds]);

  return {
    backgrounds,
    isLoading,
    error,
    refresh,
    getById,
  };
}
