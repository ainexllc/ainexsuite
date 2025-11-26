import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PulseSpace } from '../types/models';

interface PulseState {
  // State
  spaces: PulseSpace[];
  currentSpaceId: string;

  // Setters (Sync)
  setSpaces: (spaces: PulseSpace[]) => void;

  // Actions
  setCurrentSpace: (spaceId: string) => void;
  addSpace: (space: PulseSpace) => Promise<void>;

  // Getters
  getCurrentSpace: () => PulseSpace | undefined;
}

export const usePulseStore = create<PulseState>()(
  persist(
    (set, get) => ({
      spaces: [],
      currentSpaceId: '',

      setSpaces: (spaces) => {
        const currentId = get().currentSpaceId;
        let nextId = currentId;
        if (spaces.length > 0 && !spaces.find(s => s.id === currentId)) {
          nextId = spaces[0].id;
        }
        set({ spaces, currentSpaceId: nextId });
      },

      setCurrentSpace: (spaceId) => set({ currentSpaceId: spaceId }),

      addSpace: async (space) => {
        set((state) => ({ spaces: [...state.spaces, space], currentSpaceId: space.id }));
        // TODO: Add Firebase service call when needed
      },

      getCurrentSpace: () => {
        const { spaces, currentSpaceId } = get();
        return spaces.find((s) => s.id === currentSpaceId);
      },
    }),
    {
      name: 'pulse-storage-client-prefs',
      partialize: (state) => ({ currentSpaceId: state.currentSpaceId }),
    }
  )
);
