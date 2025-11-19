'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';

export interface AppColorData {
  appId: string;
  primary: string;
  secondary: string;
}

/**
 * Hook to fetch all app colors from Firestore in real-time
 * Returns a map of appId -> { primary, secondary }
 */
export function useAllAppColors() {
  const [colors, setColors] = useState<Record<string, { primary: string; secondary: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      // Listen to all app documents in the apps collection
      unsubscribe = onSnapshot(
        collection(db, 'apps'),
        (snapshot) => {
          const appColors: Record<string, { primary: string; secondary: string }> = {};

          snapshot.docs.forEach((doc) => {
            const data = doc.data();
            appColors[doc.id] = {
              primary: data.primary || '#3b82f6',
              secondary: data.secondary || '#60a5fa',
            };
          });

          setColors(appColors);
          setLoading(false);
        },
        (error) => {
          // Silently handle permission errors - use empty colors
          console.warn('Could not load app colors, using defaults:', error.message);
          setColors({});
          setLoading(false);
        }
      );
    } catch (error) {
      // Handle any initialization errors gracefully
      console.warn('Failed to initialize app colors listener, using defaults:', error);
      setColors({});
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { colors, loading };
}
