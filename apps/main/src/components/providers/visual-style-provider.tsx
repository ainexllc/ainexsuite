'use client';

import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '@ainexsuite/auth';
import { db } from '@ainexsuite/firebase';
import {
  VisualStyleContext,
  gradientVariants,
  defaultGradientVariant,
  getVariantById,
  getNextVariant,
  type GradientVariantId,
} from '@/lib/theme/visual-style';

const STORAGE_KEY = 'ainexsuite:visual-style';

interface VisualStyleProviderProps {
  children: ReactNode;
}

export function VisualStyleProvider({ children }: VisualStyleProviderProps) {
  const { user, loading: authLoading } = useAuth();
  const [selectedId, setSelectedId] = useState<GradientVariantId>(() => {
    if (typeof window === 'undefined') {
      return defaultGradientVariant.id;
    }
    const storedValue = window.localStorage.getItem(STORAGE_KEY) as GradientVariantId | null;
    return storedValue ? getVariantById(storedValue).id : defaultGradientVariant.id;
  });

  // Load user's theme preference from Firestore when authenticated
  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    async function loadUserTheme() {
      try {
        const userRef = doc(db, 'users', user!.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const savedTheme = userData?.preferences?.visualTheme as GradientVariantId | undefined;

          if (savedTheme && (savedTheme === 'ember-glow' || savedTheme === 'aurora-mist')) {
            setSelectedId(savedTheme);
            // Also update localStorage for consistency
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(STORAGE_KEY, savedTheme);
            }
          }
        }
      } catch {
        // Silently fail if we can't load user theme
      }
    }

    void loadUserTheme();
  }, [user, authLoading]);

  // Save theme changes to Firestore and localStorage
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Always save to localStorage
    window.localStorage.setItem(STORAGE_KEY, selectedId);

    // Save to Firestore if user is authenticated
    if (!authLoading && user) {
      void (async () => {
        try {
          const userRef = doc(db, 'users', user!.uid);

          await setDoc(
            userRef,
            {
              preferences: {
                visualTheme: selectedId,
              },
            },
            { merge: true }
          );
        } catch {
          // Silently fail if we can't save user theme
        }
      })();
    }
  }, [selectedId, user, authLoading]);

  const value = useMemo(
    () => ({
      variants: gradientVariants,
      selectedVariant: getVariantById(selectedId),
      selectVariantById: (id: GradientVariantId) => setSelectedId(getVariantById(id).id),
      cycleVariant: () => setSelectedId((currentId) => getNextVariant(currentId).id),
    }),
    [selectedId]
  );

  return (
    <VisualStyleContext.Provider value={value}>
      {children}
    </VisualStyleContext.Provider>
  );
}
