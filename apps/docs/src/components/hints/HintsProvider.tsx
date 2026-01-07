'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { db } from '@ainexsuite/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@ainexsuite/auth';
import { type HintId } from './hints-config';

interface HintsContextValue {
  /** Check if a hint should be shown (not yet dismissed) */
  shouldShowHint: (hintId: HintId) => boolean;
  /** Dismiss a hint (user clicked "Got it" or X) */
  dismissHint: (hintId: HintId) => void;
  /** Reset all hints to show again */
  resetHints: () => void;
  /** Whether hints are loaded from Firestore */
  isLoading: boolean;
}

const HintsContext = createContext<HintsContextValue | null>(null);

const FIRESTORE_COLLECTION = 'docs_preferences';

interface HintsProviderProps {
  children: ReactNode;
}

export function HintsProvider({ children }: HintsProviderProps) {
  const { user } = useAuth();
  const [dismissedHints, setDismissedHints] = useState<Set<HintId>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load dismissed hints from Firestore on mount
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    const loadHints = async () => {
      try {
        const docRef = doc(db, FIRESTORE_COLLECTION, user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const dismissed = data.dismissedHints || [];
          setDismissedHints(new Set(dismissed as HintId[]));
        }
      } catch (error) {
        console.error('Failed to load hints state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHints();
  }, [user?.uid]);

  // Check if a hint should be shown
  const shouldShowHint = useCallback(
    (hintId: HintId): boolean => {
      if (isLoading) return false;
      return !dismissedHints.has(hintId);
    },
    [dismissedHints, isLoading]
  );

  // Dismiss a hint
  const dismissHint = useCallback(
    async (hintId: HintId) => {
      if (!user?.uid) return;

      // Update local state immediately for responsive UI
      setDismissedHints((prev) => new Set([...prev, hintId]));

      // Sync to Firestore
      try {
        const docRef = doc(db, FIRESTORE_COLLECTION, user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const currentDismissed = docSnap.data().dismissedHints || [];
          if (!currentDismissed.includes(hintId)) {
            await updateDoc(docRef, {
              dismissedHints: [...currentDismissed, hintId],
              hintsUpdatedAt: Date.now(),
            });
          }
        } else {
          // Create the document if it doesn't exist
          await setDoc(docRef, {
            userId: user.uid,
            dismissedHints: [hintId],
            hintsUpdatedAt: Date.now(),
          });
        }
      } catch (error) {
        console.error('Failed to save hint dismissal:', error);
      }
    },
    [user?.uid]
  );

  // Reset all hints
  const resetHints = useCallback(async () => {
    if (!user?.uid) return;

    // Clear local state
    setDismissedHints(new Set());

    // Clear in Firestore
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          dismissedHints: [],
          hintsUpdatedAt: Date.now(),
        });
      }
    } catch (error) {
      console.error('Failed to reset hints:', error);
    }
  }, [user?.uid]);

  const value: HintsContextValue = {
    shouldShowHint,
    dismissHint,
    resetHints,
    isLoading,
  };

  return (
    <HintsContext.Provider value={value}>{children}</HintsContext.Provider>
  );
}

export function useHints() {
  const context = useContext(HintsContext);

  if (!context) {
    throw new Error('useHints must be used within a HintsProvider');
  }

  return context;
}
