'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { getUserSettings, updateCoversSettings } from '@/lib/firebase/settings';

interface CoverSettingsContextType {
  showAiSummary: boolean;
  setShowAiSummary: (value: boolean) => Promise<void>;
  isLoading: boolean;
}

const CoverSettingsContext = createContext<CoverSettingsContextType>({
  showAiSummary: true,
  setShowAiSummary: async () => {},
  isLoading: true,
});

export function CoverSettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [showAiSummary, setShowAiSummaryState] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const settings = await getUserSettings(user.uid);
        setShowAiSummaryState(settings.covers?.showAiSummary ?? true);
      } catch (error) {
        console.error('Failed to load cover settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user?.uid]);

  const setShowAiSummary = useCallback(async (value: boolean) => {
    if (!user?.uid) return;

    // Optimistic update
    setShowAiSummaryState(value);

    try {
      await updateCoversSettings(user.uid, { showAiSummary: value });
    } catch (error) {
      console.error('Failed to update cover settings:', error);
      // Revert on error
      setShowAiSummaryState(!value);
    }
  }, [user?.uid]);

  return (
    <CoverSettingsContext.Provider value={{ showAiSummary, setShowAiSummary, isLoading }}>
      {children}
    </CoverSettingsContext.Provider>
  );
}

export function useCoverSettings() {
  return useContext(CoverSettingsContext);
}
