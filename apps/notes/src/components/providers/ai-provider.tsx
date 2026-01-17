'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

interface AIContextValue {
  /** Whether the AI panel is currently open */
  isAIOpen: boolean;
  /** Toggle the AI panel open/closed */
  toggleAI: () => void;
  /** Open the AI panel */
  openAI: () => void;
  /** Close the AI panel */
  closeAI: () => void;
}

const AIContext = createContext<AIContextValue | null>(null);

interface AIProviderProps {
  children: ReactNode;
}

/**
 * AIProvider - Manages the AI assistant panel state
 *
 * Provides state and controls for the floating AI chat panel.
 * Used to share AI panel state between layout and page components.
 */
export function AIProvider({ children }: AIProviderProps) {
  const [isAIOpen, setIsAIOpen] = useState(false);

  const toggleAI = useCallback(() => {
    setIsAIOpen((prev) => !prev);
  }, []);

  const openAI = useCallback(() => {
    setIsAIOpen(true);
  }, []);

  const closeAI = useCallback(() => {
    setIsAIOpen(false);
  }, []);

  const value = useMemo<AIContextValue>(() => ({
    isAIOpen,
    toggleAI,
    openAI,
    closeAI,
  }), [isAIOpen, toggleAI, openAI, closeAI]);

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
}

/**
 * Hook to access AI panel state and controls
 * Must be used within an AIProvider
 */
export function useAIPanel() {
  const context = useContext(AIContext);

  if (!context) {
    throw new Error('useAIPanel must be used within an AIProvider');
  }

  return context;
}
