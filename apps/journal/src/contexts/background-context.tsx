'use client';

import { createContext, useContext, ReactNode } from 'react';

type BackgroundBrightness = 'light' | 'dark' | null;

interface BackgroundContextValue {
  /** Background brightness: 'light', 'dark', or null (no background) */
  brightness: BackgroundBrightness;
}

const BackgroundContext = createContext<BackgroundContextValue>({
  brightness: null,
});

interface BackgroundProviderProps {
  children: ReactNode;
  /** The brightness of the current background, or null if no background */
  brightness: BackgroundBrightness;
}

/**
 * Provider component that passes background brightness to child components
 * for adaptive styling based on background images.
 */
export function BackgroundProvider({ children, brightness }: BackgroundProviderProps) {
  return (
    <BackgroundContext.Provider value={{ brightness }}>
      {children}
    </BackgroundContext.Provider>
  );
}

/**
 * Hook to access the current background brightness.
 * Returns 'light', 'dark', or null (no background).
 */
export function useBackgroundBrightness(): BackgroundBrightness {
  const context = useContext(BackgroundContext);
  return context.brightness;
}

/**
 * Hook to get the full background context value.
 */
export function useBackgroundContext(): BackgroundContextValue {
  return useContext(BackgroundContext);
}
