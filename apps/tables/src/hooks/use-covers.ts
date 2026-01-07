'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCoverOptions, subscribeToCovers, toCoverOption } from '@ainexsuite/firebase';
import type { CoverDoc, CoverOption } from '@ainexsuite/types';

interface UseCoversReturn {
  covers: CoverOption[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getById: (id: string) => CoverOption | undefined;
}

/**
 * Hook to fetch and manage covers from Firestore
 */
export function useCovers(): UseCoversReturn {
  const [covers, setCovers] = useState<CoverOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch covers
  const fetchCovers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const options = await getCoverOptions();
      setCovers(options);
    } catch (err) {
      console.error('Failed to fetch covers:', err);
      setError('Failed to load covers');
      setCovers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCovers();
  }, [fetchCovers]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToCovers(
      (docs: CoverDoc[]) => {
        const accessible = docs.filter((cover) => cover.active);
        setCovers(accessible.map(toCoverOption));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Get cover by ID
  const getById = useCallback(
    (id: string): CoverOption | undefined => {
      return covers.find((cover) => cover.id === id);
    },
    [covers]
  );

  // Refresh function
  const refresh = useCallback(async () => {
    await fetchCovers();
  }, [fetchCovers]);

  return {
    covers,
    isLoading,
    error,
    refresh,
    getById,
  };
}
