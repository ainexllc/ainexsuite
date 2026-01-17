"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

/**
 * Hint placement options
 */
export type HintPlacement = "top" | "bottom" | "left" | "right";

/**
 * Hint configuration
 */
export interface HintConfig<T extends string = string> {
  id: T;
  title: string;
  description: string;
  placement: HintPlacement;
}

/**
 * Storage adapter interface for persisting hints
 */
export interface HintsStorageAdapter<T extends string = string> {
  /** Load dismissed hint IDs */
  load: () => Promise<T[]>;
  /** Save a dismissed hint */
  save: (hintId: T) => Promise<void>;
  /** Reset all hints */
  reset: () => Promise<void>;
}

interface HintsContextValue<T extends string = string> {
  /** Check if a hint should be shown (not yet dismissed) */
  shouldShowHint: (hintId: T) => boolean;
  /** Dismiss a hint (user clicked "Got it" or X) */
  dismissHint: (hintId: T) => void;
  /** Reset all hints to show again */
  resetHints: () => void;
  /** Whether hints are loaded */
  isLoading: boolean;
}

const HintsContext = createContext<HintsContextValue<string> | null>(null);

interface HintsProviderProps<T extends string = string> {
  children: ReactNode;
  /** Storage adapter for persisting hints */
  storage: HintsStorageAdapter<T>;
  /** Whether hints system is enabled */
  enabled?: boolean;
}

/**
 * HintsProvider - Manages hint visibility and persistence
 *
 * @example
 * ```tsx
 * // Create a Firestore storage adapter
 * const firestoreAdapter: HintsStorageAdapter = {
 *   load: async () => {
 *     const doc = await getDoc(docRef);
 *     return doc.data()?.dismissedHints || [];
 *   },
 *   save: async (hintId) => {
 *     await updateDoc(docRef, { dismissedHints: arrayUnion(hintId) });
 *   },
 *   reset: async () => {
 *     await updateDoc(docRef, { dismissedHints: [] });
 *   },
 * };
 *
 * <HintsProvider storage={firestoreAdapter}>
 *   <App />
 * </HintsProvider>
 * ```
 */
export function HintsProvider<T extends string = string>({
  children,
  storage,
  enabled = true,
}: HintsProviderProps<T>) {
  const [dismissedHints, setDismissedHints] = useState<Set<T>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load dismissed hints on mount
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const loadHints = async () => {
      try {
        const dismissed = await storage.load();
        setDismissedHints(new Set(dismissed));
      } catch (error) {
        console.error("Failed to load hints state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHints();
  }, [storage, enabled]);

  // Check if a hint should be shown
  const shouldShowHint = useCallback(
    (hintId: T): boolean => {
      if (!enabled || isLoading) return false;
      return !dismissedHints.has(hintId);
    },
    [dismissedHints, isLoading, enabled]
  );

  // Dismiss a hint
  const dismissHint = useCallback(
    async (hintId: T) => {
      if (!enabled) return;

      // Update local state immediately for responsive UI
      setDismissedHints((prev) => new Set([...prev, hintId]));

      // Sync to storage
      try {
        await storage.save(hintId);
      } catch (error) {
        console.error("Failed to save hint dismissal:", error);
      }
    },
    [storage, enabled]
  );

  // Reset all hints
  const resetHints = useCallback(async () => {
    if (!enabled) return;

    // Clear local state
    setDismissedHints(new Set());

    // Clear in storage
    try {
      await storage.reset();
    } catch (error) {
      console.error("Failed to reset hints:", error);
    }
  }, [storage, enabled]);

  const value: HintsContextValue<T> = {
    shouldShowHint,
    dismissHint,
    resetHints,
    isLoading,
  };

  return (
    <HintsContext.Provider value={value as HintsContextValue<string>}>
      {children}
    </HintsContext.Provider>
  );
}

/**
 * Hook to access hints context
 */
export function useHints<T extends string = string>(): HintsContextValue<T> {
  const context = useContext(HintsContext);

  if (!context) {
    throw new Error("useHints must be used within a HintsProvider");
  }

  return context as HintsContextValue<T>;
}

/**
 * Create a localStorage storage adapter for hints
 */
export function createLocalStorageAdapter<T extends string = string>(
  storageKey: string
): HintsStorageAdapter<T> {
  return {
    load: async () => {
      if (typeof window === "undefined") return [];
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    },
    save: async (hintId) => {
      if (typeof window === "undefined") return;
      const stored = localStorage.getItem(storageKey);
      const hints: T[] = stored ? JSON.parse(stored) : [];
      if (!hints.includes(hintId)) {
        hints.push(hintId);
        localStorage.setItem(storageKey, JSON.stringify(hints));
      }
    },
    reset: async () => {
      if (typeof window === "undefined") return;
      localStorage.removeItem(storageKey);
    },
  };
}
