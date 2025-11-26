import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProjectSpace } from '../types/models';

interface ProjectsState {
  // State
  spaces: ProjectSpace[];
  currentSpaceId: string;

  // Setters (Sync)
  setSpaces: (spaces: ProjectSpace[]) => void;

  // Actions
  setCurrentSpace: (spaceId: string) => void;
  addSpace: (space: ProjectSpace) => Promise<void>;

  // Getters
  getCurrentSpace: () => ProjectSpace | undefined;
}

export const useProjectsStore = create<ProjectsState>()(
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
      name: 'projects-storage-client-prefs',
      partialize: (state) => ({ currentSpaceId: state.currentSpaceId }),
    }
  )
);
