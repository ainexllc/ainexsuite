'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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

  // Get user tier from subscription context (default to 'free')
  // TODO: Integrate with subscription system to get actual tier
  const userTier = useMemo(() => {
    return 'free' as 'free' | 'premium' | 'enterprise';
  }, []);

  // Fetch backgrounds
  const fetchBackgrounds = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const options = await getBackgroundOptions(userTier);
      setBackgrounds(options);
    } catch (err) {
      console.error('Failed to fetch backgrounds:', err);
      setError('Failed to load backgrounds');
      setBackgrounds([]);
    } finally {
      setIsLoading(false);
    }
  }, [userTier]);

  // Initial fetch
  useEffect(() => {
    fetchBackgrounds();
  }, [fetchBackgrounds]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToBackgrounds(
      (docs: BackgroundDoc[]) => {
        // Filter by active and access level
        const accessible = docs.filter((bg) => {
          if (!bg.active) return false;
          if (bg.accessLevel === 'free') return true;
          if (bg.accessLevel === 'premium') return userTier !== 'free';
          if (bg.accessLevel === 'restricted') return userTier === 'enterprise';
          return false;
        });

        setBackgrounds(accessible.map(toBackgroundOption));
        setIsLoading(false);
      },
      { active: true }
    );

    return () => unsubscribe();
  }, [userTier]);

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
