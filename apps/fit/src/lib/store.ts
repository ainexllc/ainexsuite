import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FitState {
  // State
  currentSpaceId: string;

  // Setters
  setCurrentSpace: (spaceId: string) => void;

  // View Preferences
  viewPreferences: Record<string, string>; // spaceId -> viewType
  setViewPreference: (spaceId: string, view: string) => void;

  // Getters
  getCurrentSpaceId: () => string;
}

export const useFitStore = create<FitState>()(
  persist(
    (set, get) => ({
      currentSpaceId: 'personal',
      viewPreferences: {},

      setCurrentSpace: (spaceId) => set({ currentSpaceId: spaceId }),

      setViewPreference: (spaceId, view) => set((state) => ({
        viewPreferences: { ...state.viewPreferences, [spaceId]: view }
      })),

      getCurrentSpaceId: () => get().currentSpaceId,
    }),
    {
      name: 'fit-storage-client-prefs',
      partialize: (state) => ({
        currentSpaceId: state.currentSpaceId,
        viewPreferences: state.viewPreferences
      }),
    }
  )
);
