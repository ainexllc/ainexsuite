// apps/grow/src/lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Space, Habit, Quest, Completion, Notification } from '../types/models';
import { 
  createSpaceInDb, 
  updateSpaceInDb, 
  createHabitInDb, 
  updateHabitInDb, 
  createCompletionInDb,
  createQuestInDb,
  createNotificationInDb,
  markNotificationReadInDb
} from './firebase-service';

interface GrowState {
  // State
  spaces: Space[];
  currentSpaceId: string;
  habits: Habit[];
  quests: Quest[];
  completions: Completion[];
  notifications: Notification[];
  
  // Setters (Sync)
  setSpaces: (spaces: Space[]) => void;
  setHabits: (habits: Habit[]) => void;
  setQuests: (quests: Quest[]) => void;
  setCompletions: (completions: Completion[]) => void;
  setNotifications: (notifications: Notification[]) => void;

  // Actions (DB)
  setCurrentSpace: (spaceId: string) => void;
  addSpace: (space: Space) => Promise<void>;
  updateSpace: (spaceId: string, updates: Partial<Space>) => Promise<void>;
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>;
  toggleHabitFreeze: (habitId: string, currentStatus: boolean) => Promise<void>;
  addCompletion: (completion: Completion) => Promise<void>;
  addQuest: (quest: Quest) => Promise<void>;
  sendNotification: (notification: Notification) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  
  // Getters
  getCurrentSpace: () => Space | undefined;
  getSpaceHabits: (spaceId: string) => Habit[];
  getSpaceQuests: (spaceId: string) => Quest[];
}

export const useGrowStore = create<GrowState>()(
  persist(
    (set, get) => ({
      spaces: [],
      currentSpaceId: '',
      habits: [],
      quests: [],
      completions: [],
      notifications: [],

      // --- Setters (Sync) ---
      setSpaces: (spaces) => {
        const currentId = get().currentSpaceId;
        let nextId = currentId;
        if (spaces.length > 0 && !spaces.find(s => s.id === currentId)) {
          nextId = spaces[0].id;
        }
        set({ spaces, currentSpaceId: nextId });
      },
      setHabits: (habits) => set({ habits }),
      setQuests: (quests) => set({ quests }),
      setCompletions: (completions) => set({ completions }),
      setNotifications: (notifications) => set({ notifications }),

      // --- Actions (DB) ---
      setCurrentSpace: (spaceId) => set({ currentSpaceId: spaceId }),
      
      addSpace: async (space) => {
        set((state) => ({ spaces: [...state.spaces, space], currentSpaceId: space.id }));
        await createSpaceInDb(space);
      },
      
      updateSpace: async (spaceId, updates) => {
        set((state) => ({
          spaces: state.spaces.map((s) => s.id === spaceId ? { ...s, ...updates } : s)
        }));
        await updateSpaceInDb(spaceId, updates);
      },

      addHabit: async (habit) => {
        set((state) => ({ habits: [...state.habits, habit] }));
        await createHabitInDb(habit);
      },
      
      updateHabit: async (habitId, updates) => {
        set((state) => ({
          habits: state.habits.map((h) => h.id === habitId ? { ...h, ...updates } : h)
        }));
        await updateHabitInDb(habitId, updates);
      },

      toggleHabitFreeze: async (habitId, currentStatus) => {
        const newStatus = !currentStatus;
        set((state) => ({
          habits: state.habits.map((h) => h.id === habitId ? { ...h, isFrozen: newStatus } : h)
        }));
        await updateHabitInDb(habitId, { isFrozen: newStatus });
      },

      addCompletion: async (completion) => {
        set((state) => ({ completions: [...state.completions, completion] }));
        await createCompletionInDb(completion);
      },

      addQuest: async (quest) => {
        set((state) => ({ quests: [...state.quests, quest] }));
        await createQuestInDb(quest);
      },

      sendNotification: async (notification) => {
        // Optimistic add? Probably not needed for receiver, only sender might want confirmation
        await createNotificationInDb(notification);
      },

      markNotificationRead: async (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        }));
        await markNotificationReadInDb(notificationId);
      },

      // --- Getters ---
      getCurrentSpace: () => {
        const { spaces, currentSpaceId } = get();
        return spaces.find((s) => s.id === currentSpaceId);
      },

      getSpaceHabits: (spaceId) => {
        const { habits } = get();
        return habits.filter((h) => h.spaceId === spaceId);
      },

      getSpaceQuests: (spaceId) => {
        const { quests } = get();
        return quests.filter((q) => q.spaceId === spaceId);
      }
    }),
    {
      name: 'grow-storage-client-prefs',
      partialize: (state) => ({ currentSpaceId: state.currentSpaceId }),
    }
  )
);
