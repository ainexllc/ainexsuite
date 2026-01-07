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
  updateSpace: (spaceId: string, updates: Partial<WorkflowSpace>) => Promise<void>;
  deleteSpace: (spaceId: string) => Promise<void>;

  // Getters
  getCurrentSpace: () => WorkflowSpace | undefined;
}

export const useWorkflowStore = create<WorkflowState>()(
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

      updateSpace: async (spaceId, updates) => {
        set((state) => ({
          spaces: state.spaces.map((s) => (s.id === spaceId ? { ...s, ...updates } : s)),
        }));
        // TODO: Add Firebase service call when needed
      },

      deleteSpace: async (spaceId) => {
        set((state) => {
          const newSpaces = state.spaces.filter((s) => s.id !== spaceId);
          const newCurrentId = state.currentSpaceId === spaceId ? 'personal' : state.currentSpaceId;
          return { spaces: newSpaces, currentSpaceId: newCurrentId };
        });
        // TODO: Add Firebase service call when needed
      },

      getCurrentSpace: () => {
        const { spaces, currentSpaceId } = get();
        if (currentSpaceId === 'personal') {
          return {
            id: 'personal',
            name: 'My Workflows',
            type: 'personal',
            members: [],
            memberUids: [],
            createdAt: new Date().toISOString(),
            createdBy: '',
          } as WorkflowSpace;
        }
        return spaces.find((s) => s.id === currentSpaceId);
      },
    }),
    {
      name: 'workflow-storage-client-prefs',
      partialize: (state) => ({ currentSpaceId: state.currentSpaceId }),
    }
  )
);
