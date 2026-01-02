'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { HintId } from './hints-config';

interface HintsContextType {
  dismissedHints: Set<HintId>;
  dismissHint: (hintId: HintId) => void;
  shouldShowHint: (hintId: HintId) => boolean;
  resetHints: () => void;
}

const HintsContext = createContext<HintsContextType | null>(null);

const STORAGE_KEY = 'health-dismissed-hints';

export function HintsProvider({ children }: { children: ReactNode }) {
  const [dismissedHints, setDismissedHints] = useState<Set<HintId>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load dismissed hints from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HintId[];
        setDismissedHints(new Set(parsed));
      }
    } catch (error) {
      console.error('Failed to load dismissed hints:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save dismissed hints to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(dismissedHints)));
    } catch (error) {
      console.error('Failed to save dismissed hints:', error);
    }
  }, [dismissedHints, isLoaded]);

  const dismissHint = useCallback((hintId: HintId) => {
    setDismissedHints((prev) => new Set([...prev, hintId]));
  }, []);

  const shouldShowHint = useCallback(
    (hintId: HintId) => {
      if (!isLoaded) return false;
      return !dismissedHints.has(hintId);
    },
    [dismissedHints, isLoaded]
  );

  const resetHints = useCallback(() => {
    setDismissedHints(new Set());
  }, []);

  return (
    <HintsContext.Provider value={{ dismissedHints, dismissHint, shouldShowHint, resetHints }}>
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
