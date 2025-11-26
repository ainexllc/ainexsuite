import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkflowSpace } from '../types/models';

interface WorkflowState {
  // State
  spaces: WorkflowSpace[];
  currentSpaceId: string;

  // Setters (Sync)
  setSpaces: (spaces: WorkflowSpace[]) => void;

  // Actions
  setCurrentSpace: (spaceId: string) => void;
  addSpace: (space: WorkflowSpace) => Promise<void>;

  // Getters
  getCurrentSpace: () => WorkflowSpace | undefined;
}

export const useWorkflowStore = create<WorkflowState>()(
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
      name: 'workflow-storage-client-prefs',
      partialize: (state) => ({ currentSpaceId: state.currentSpaceId }),
    }
  )
);
