import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PulseSpace } from '../types/models';
import { SpaceService } from './space-service';

interface PulseState {
  // State
  spaces: PulseSpace[];
  currentSpaceId: string;

  // Setters (Sync)
  setSpaces: (spaces: PulseSpace[]) => void;

  // Actions
  setCurrentSpace: (spaceId: string) => void;
  addSpace: (space: PulseSpace) => Promise<void>;
  updateSpace: (spaceId: string, data: Partial<PulseSpace>) => Promise<void>;
  deleteSpace: (spaceId: string) => Promise<void>;

  // Getters
  getCurrentSpace: () => PulseSpace | undefined;
}

export const usePulseStore = create<PulseState>()(
  persist(
    (set, get) => ({
      spaces: [],
      currentSpaceId: 'personal',

      setSpaces: (spaces) => {
        const currentId = get().currentSpaceId;
        let nextId = currentId;
        // Keep 'personal' as valid virtual space
        if (!currentId || (currentId !== 'personal' && !spaces.find(s => s.id === currentId))) {
          nextId = 'personal';
        }
        set({ spaces, currentSpaceId: nextId });
      },

      setCurrentSpace: (spaceId) => set({ currentSpaceId: spaceId }),

      addSpace: async (space) => {
        // Optimistically update local state
        set((state) => ({ spaces: [...state.spaces, space], currentSpaceId: space.id }));
        // Persist to Firestore
        await SpaceService.createSpace(space);
      },

      updateSpace: async (spaceId, data) => {
        // Optimistically update local state
        set((state) => ({
          spaces: state.spaces.map(s => s.id === spaceId ? { ...s, ...data } : s)
        }));
        // Persist to Firestore
        await SpaceService.updateSpace(spaceId, data);
      },

      deleteSpace: async (spaceId) => {
        const { spaces, currentSpaceId } = get();
        // Optimistically update local state
        const newSpaces = spaces.filter(s => s.id !== spaceId);
        const newCurrentId = currentSpaceId === spaceId
          ? (newSpaces[0]?.id || '')
          : currentSpaceId;
        set({ spaces: newSpaces, currentSpaceId: newCurrentId });
        // Persist to Firestore
        await SpaceService.deleteSpace(spaceId);
      },

      getCurrentSpace: () => {
        const { spaces, currentSpaceId } = get();
        if (currentSpaceId === 'personal') {
          return {
            id: 'personal',
            name: 'My Display',
            type: 'personal',
            members: [],
            memberUids: [],
            createdAt: new Date().toISOString(),
            createdBy: '',
          } as PulseSpace;
        }
        return spaces.find((s) => s.id === currentSpaceId);
      },
    }),
    {
      name: 'pulse-storage-client-prefs',
      partialize: (state) => ({ currentSpaceId: state.currentSpaceId }),
    }
  )
);
