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
 * Filters by user's subscription tier automatically
 */
export function useBackgrounds(): UseBackgroundsReturn {
  const [backgrounds, setBackgrounds] = useState<BackgroundOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch backgrounds (no tier filtering for now)
  const fetchBackgrounds = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get all backgrounds without tier filtering
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
        // For now, show all active backgrounds regardless of access level
        // TODO: Re-enable access level filtering once subscription system is integrated
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

/**
 * Fallback backgrounds when Firestore is unavailable
 * These are the original hardcoded backgrounds
 */
export const FALLBACK_BACKGROUNDS: BackgroundOption[] = [
  {
    id: 'winter-lights',
    name: 'Winter Lights',
    thumbnail: '/backgrounds/dark/winter-lights.jpg',
    fullImage: '/backgrounds/dark/winter-lights.jpg',
    brightness: 'dark',
    category: 'festive',
    tags: ['winter', 'festive'],
  },
  {
    id: 'winter-cabin-light',
    name: 'Winter Cabin',
    thumbnail: '/backgrounds/light/winter-cabin.jpg',
    fullImage: '/backgrounds/light/winter-cabin.jpg',
    brightness: 'light',
    category: 'festive',
    tags: ['winter', 'festive', 'cabin'],
  },
  {
    id: 'winter-cabin-dark',
    name: 'Winter Cabin',
    thumbnail: '/backgrounds/dark/winter-cabin.jpg',
    fullImage: '/backgrounds/dark/winter-cabin.jpg',
    brightness: 'dark',
    category: 'festive',
    tags: ['winter', 'festive', 'cabin'],
  },
];
