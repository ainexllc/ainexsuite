'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { HintId } from './hints-config';

interface HintsContextType {
  dismissedHints: Set<HintId>;
  dismissHint: (hintId: HintId) => void;
  resetHints: () => void;
  shouldShowHint: (hintId: HintId) => boolean;
}

const HintsContext = createContext<HintsContextType | null>(null);

const STORAGE_KEY = 'workflow-dismissed-hints';

export function HintsProvider({ children }: { children: ReactNode }) {
  const [dismissedHints, setDismissedHints] = useState<Set<HintId>>(new Set());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as HintId[];
        setDismissedHints(new Set(parsed));
      } catch {
        // Invalid data, start fresh
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissedHints]));
    }
  }, [dismissedHints, isHydrated]);

  const dismissHint = useCallback((hintId: HintId) => {
    setDismissedHints((prev) => new Set([...prev, hintId]));
  }, []);

  const resetHints = useCallback(() => {
    setDismissedHints(new Set());
  }, []);

  const shouldShowHint = useCallback(
    (hintId: HintId) => {
      if (!isHydrated) return false;
      return !dismissedHints.has(hintId);
    },
    [dismissedHints, isHydrated]
  );

  return (
    <HintsContext.Provider value={{ dismissedHints, dismissHint, resetHints, shouldShowHint }}>
      {children}
    </HintsContext.Provider>
  );
}

export function useHints() {
  const context = useContext(HintsContext);
  if (!context) {
    throw new Error('useHints must be used within a HintsProvider');
  }
  return context;
}
