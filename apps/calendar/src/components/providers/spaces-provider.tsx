'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { useAuth } from '@ainexsuite/auth';

export type SpaceType = 'personal' | 'family' | 'work';

export interface CalendarSpace {
  id: string;
  name: string;
  type: SpaceType;
  memberUids: string[];
  createdBy: string;
  createdAt: Date;
}

const DEFAULT_PERSONAL_SPACE: CalendarSpace = {
  id: 'personal',
  name: 'My Calendar',
  type: 'personal',
  memberUids: [],
  createdBy: '',
  createdAt: new Date(),
};

type SpacesContextValue = {
  spaces: CalendarSpace[];
  currentSpace: CalendarSpace;
  currentSpaceId: string;
  loading: boolean;
  setCurrentSpace: (spaceId: string) => void;
};

const SpacesContext = createContext<SpacesContextValue | null>(null);

export function SpacesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentSpaceId, setCurrentSpaceId] = useState<string>('personal');
  const [loading] = useState(false);

  const userId = user?.uid ?? null;

  // For now, just personal space - can add Firebase integration later
  const spaces = useMemo(() => {
    const personalSpace: CalendarSpace = {
      ...DEFAULT_PERSONAL_SPACE,
      createdBy: userId || '',
      memberUids: userId ? [userId] : [],
    };
    return [personalSpace];
  }, [userId]);

  const currentSpace = useMemo(() => {
    return spaces.find((s) => s.id === currentSpaceId) || spaces[0];
  }, [spaces, currentSpaceId]);

  const handleSetCurrentSpace = useCallback((spaceId: string) => {
    setCurrentSpaceId(spaceId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('calendar-current-space', spaceId);
    }
  }, []);

  // Restore current space from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSpaceId = localStorage.getItem('calendar-current-space');
      if (savedSpaceId) {
        setCurrentSpaceId(savedSpaceId);
      }
    }
  }, []);

  const value = useMemo<SpacesContextValue>(
    () => ({
      spaces,
      currentSpace,
      currentSpaceId,
      loading,
      setCurrentSpace: handleSetCurrentSpace,
    }),
    [spaces, currentSpace, currentSpaceId, loading, handleSetCurrentSpace]
  );

  return (
    <SpacesContext.Provider value={value}>{children}</SpacesContext.Provider>
  );
}

export function useSpaces() {
  const context = useContext(SpacesContext);
  if (!context) {
    throw new Error('useSpaces must be used within a SpacesProvider');
  }
  return context;
}
