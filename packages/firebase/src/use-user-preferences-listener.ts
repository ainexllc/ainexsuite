'use client';

import { useEffect, useState, useRef } from 'react';
import { doc, onSnapshot, type FirestoreError } from 'firebase/firestore';
import { db } from './client';
import type { UserPreferences } from '@ainexsuite/types';

/**
 * Real-time Firestore listener for user preferences.
 * Enables cross-device sync by listening to preference changes.
 *
 * @param uid - The user's Firebase UID
 * @returns { preferences, loading, error }
 *
 * @example
 * ```tsx
 * const { preferences, loading } = useUserPreferencesListener(user?.uid);
 *
 * useEffect(() => {
 *   if (preferences?.theme) {
 *     setTheme(preferences.theme);
 *   }
 * }, [preferences?.theme]);
 * ```
 */
export function useUserPreferencesListener(uid: string | undefined) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // No user = no listener
    if (!uid) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Listen to user document for preferences field
    const userRef = doc(db, 'users', uid);

    unsubscribeRef.current = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setPreferences(data.preferences as UserPreferences || null);
        } else {
          setPreferences(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('[useUserPreferencesListener] Firestore error:', err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup on unmount or uid change
    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [uid]);

  return { preferences, loading, error };
}
