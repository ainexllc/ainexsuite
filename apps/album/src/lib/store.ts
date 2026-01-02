import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Moment, Space } from '@ainexsuite/types';
import { getMoments } from './moments';
import { getUserSpaces, createSpace, joinSpace, getSpaceByAccessCode } from './spaces';

interface MomentsState {
  // Spaces
  spaces: Space[];
  currentSpaceId: string;
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
  fetchMoments: (userId: string, spaceId?: string) => Promise<void>;

  // Guest Mode
  guestAccessSpace: Space | null;
  setGuestSpace: (space: Space | null) => void;
}

export const useMomentsStore = create<MomentsState>()(
  persist(
    (set, get) => ({
      spaces: [],
      currentSpaceId: 'personal',
      isLoadingSpaces: false,
      moments: [],
      isLoadingMoments: false,
      guestAccessSpace: null,

      setSpaces: (spaces) => {
        const currentId = get().currentSpaceId;
        let nextId = currentId;
        // Keep 'personal' as valid virtual space, otherwise set default if none selected
        if (!currentId || (currentId !== 'personal' && !spaces.find(s => s.id === currentId))) {
          nextId = 'personal';
        }
        set({ spaces, currentSpaceId: nextId, isLoadingSpaces: false });
      },

      fetchSpaces: async (userId: string) => {
        set({ isLoadingSpaces: true });
        try {
          const spaces = await getUserSpaces(userId);
          set({ spaces, isLoadingSpaces: false });

          // Keep 'personal' as default - it's a virtual space
          const currentId = get().currentSpaceId;
          if (!currentId || (currentId !== 'personal' && !spaces.find(s => s.id === currentId))) {
            set({ currentSpaceId: 'personal' });
          }
        } catch (error) {
          console.error('Failed to fetch spaces:', error);
          set({ isLoadingSpaces: false });
        }
      },

      setCurrentSpace: (spaceId: string) => {
        set({ currentSpaceId: spaceId });
        // Note: Moments will be fetched by the workspace page when space changes
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

      fetchMoments: async (userId, spaceId) => {
        const targetSpaceId = spaceId || get().currentSpaceId || get().guestAccessSpace?.id;

        set({ isLoadingMoments: true });
        try {
          const moments = await getMoments(userId, targetSpaceId || undefined);
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
