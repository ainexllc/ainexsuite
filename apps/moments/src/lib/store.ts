import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Moment, Space } from '@ainexsuite/types';
import { getMoments } from './moments';
import { getUserSpaces, createSpace, joinSpace, getSpaceByAccessCode } from './spaces';

interface MomentsState {
  // Spaces
  spaces: Space[];
  currentSpaceId: string | null;
  isLoadingSpaces: boolean;

  // Moments
  moments: Moment[];
  isLoadingMoments: boolean;

  // Actions
  setSpaces: (spaces: Space[]) => void;
  fetchSpaces: (userId: string) => Promise<void>;
  setCurrentSpace: (spaceId: string) => void;
  addSpace: (userId: string, name: string, type: Space['type'], pin?: string) => Promise<void>;
  joinByPin: (pin: string, userId?: string) => Promise<Space | null>; // userId optional for guest access
  fetchMoments: (spaceId?: string) => Promise<void>;

  // Guest Mode
  guestAccessSpace: Space | null;
  setGuestSpace: (space: Space | null) => void;
}

export const useMomentsStore = create<MomentsState>()(
  persist(
    (set, get) => ({
      spaces: [],
      currentSpaceId: null,
      isLoadingSpaces: false,
      moments: [],
      isLoadingMoments: false,
      guestAccessSpace: null,

      setSpaces: (spaces) => {
        const currentId = get().currentSpaceId;
        let nextId = currentId;
        // Set default space if none selected or current no longer exists
        if (spaces.length > 0 && (!currentId || !spaces.find(s => s.id === currentId))) {
          nextId = spaces[0].id;
        }
        set({ spaces, currentSpaceId: nextId, isLoadingSpaces: false });
      },

      fetchSpaces: async (userId: string) => {
        set({ isLoadingSpaces: true });
        try {
          const spaces = await getUserSpaces(userId);
          set({ spaces, isLoadingSpaces: false });
          
          // Set default space if none selected
          if (!get().currentSpaceId && spaces.length > 0) {
            set({ currentSpaceId: spaces[0].id });
          }
        } catch (error) {
          console.error('Failed to fetch spaces:', error);
          set({ isLoadingSpaces: false });
        }
      },

      setCurrentSpace: (spaceId: string) => {
        set({ currentSpaceId: spaceId });
        // Fetch moments for this space
        get().fetchMoments(spaceId);
      },

      addSpace: async (userId, name, type, pin) => {
        try {
          await createSpace(userId, name, type, pin);
          await get().fetchSpaces(userId);
        } catch (error) {
          console.error('Failed to create space:', error);
          throw error;
        }
      },

      joinByPin: async (pin, userId) => {
        try {
          const space = await getSpaceByAccessCode(pin);
          if (!space) return null;

          if (userId) {
            // If logged in, join permanently
            await joinSpace(space.id, userId);
            await get().fetchSpaces(userId);
            set({ currentSpaceId: space.id });
          } else {
            // Guest access
            set({ guestAccessSpace: space });
          }
          
          return space;
        } catch (error) {
          console.error('Failed to join space:', error);
          throw error;
        }
      },

      fetchMoments: async (spaceId) => {
        const targetSpaceId = spaceId || get().currentSpaceId || get().guestAccessSpace?.id;
        // If no space context, we might fetch "all personal" or empty
        // For now, let's assume we need a space ID or it fetches user's personal moments if authenticated
        
        set({ isLoadingMoments: true });
        try {
          // TODO: Update getMoments to accept spaceId
          // For now passing null/undefined will fallback to current behavior (user's moments)
          // We need to update getMoments signature
          const moments = await getMoments(targetSpaceId || undefined); 
          set({ moments, isLoadingMoments: false });
        } catch (error) {
          console.error('Failed to fetch moments:', error);
          set({ isLoadingMoments: false });
        }
      },

      setGuestSpace: (space) => set({ guestAccessSpace: space }),
    }),
    {
      name: 'moments-storage',
      partialize: (state) => ({ 
        currentSpaceId: state.currentSpaceId,
        guestAccessSpace: state.guestAccessSpace 
      }),
    }
  )
);
