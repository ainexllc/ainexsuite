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
        set((state) => ({ spaces: [...state.spaces, space], currentSpaceId: space.id }));
        // TODO: Add Firebase service call when needed
      },

      getCurrentSpace: () => {
        const { spaces, currentSpaceId } = get();
        if (currentSpaceId === 'personal') {
          return {
            id: 'personal',
            name: 'My Projects',
            type: 'personal',
            members: [],
            memberUids: [],
            createdAt: new Date().toISOString(),
            createdBy: '',
          } as ProjectSpace;
        }
        return spaces.find((s) => s.id === currentSpaceId);
      },
    }),
    {
      name: 'projects-storage-client-prefs',
      partialize: (state) => ({ currentSpaceId: state.currentSpaceId }),
    }
  )
);
