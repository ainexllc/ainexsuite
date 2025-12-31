// apps/grow/src/lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Space, Habit, Quest, Completion, Notification, Reaction, ReactionEmoji } from '../types/models';
import {
  createSpaceInDb,
  updateSpaceInDb,
  createHabitInDb,
  updateHabitInDb,
  deleteHabitInDb,
  createCompletionInDb,
  deleteCompletionInDb,
  updateCompletionInDb,
  createQuestInDb,
  createNotificationInDb,
  markNotificationReadInDb
} from './firebase-service';
import { getUpdatedStreakValues, getTodayDateString } from './date-utils';

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
  deleteHabit: (habitId: string) => Promise<void>;
  toggleHabitFreeze: (habitId: string, currentStatus: boolean) => Promise<void>;
  addCompletion: (completion: Completion) => Promise<void>;
  removeCompletion: (habitId: string) => Promise<void>;
  addReaction: (completionId: string, emoji: ReactionEmoji, userId: string, userName: string) => Promise<void>;
  removeReaction: (completionId: string, userId: string) => Promise<void>;
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

      deleteHabit: async (habitId) => {
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== habitId),
          // Also remove completions for this habit
          completions: state.completions.filter((c) => c.habitId !== habitId)
        }));
        await deleteHabitInDb(habitId);
      },

      toggleHabitFreeze: async (habitId, currentStatus) => {
        const newStatus = !currentStatus;
        set((state) => ({
          habits: state.habits.map((h) => h.id === habitId ? { ...h, isFrozen: newStatus } : h)
        }));
        await updateHabitInDb(habitId, { isFrozen: newStatus });
      },

      addCompletion: async (completion) => {
        const state = get();
        const newCompletions = [...state.completions, completion];
        set({ completions: newCompletions });

        // Update habit streak
        const habit = state.habits.find(h => h.id === completion.habitId);
        if (habit) {
          const { currentStreak, bestStreak } = getUpdatedStreakValues(habit, newCompletions);
          const updates = {
            currentStreak,
            bestStreak,
            lastCompletedAt: completion.completedAt
          };
          set((s) => ({
            habits: s.habits.map(h =>
              h.id === completion.habitId ? { ...h, ...updates } : h
            )
          }));
          await updateHabitInDb(completion.habitId, updates);
        }

        await createCompletionInDb(completion);
      },

      removeCompletion: async (habitId) => {
        const state = get();
        const today = getTodayDateString();

        // Find today's completion for this habit
        const completionToRemove = state.completions.find(
          c => c.habitId === habitId && c.date === today
        );

        if (!completionToRemove) return;

        // Remove from state
        const newCompletions = state.completions.filter(c => c.id !== completionToRemove.id);
        set({ completions: newCompletions });

        // Recalculate streak
        const habit = state.habits.find(h => h.id === habitId);
        if (habit) {
          const { currentStreak, bestStreak } = getUpdatedStreakValues(habit, newCompletions);
          set((s) => ({
            habits: s.habits.map(h =>
              h.id === habitId ? { ...h, currentStreak, bestStreak } : h
            )
          }));
          await updateHabitInDb(habitId, { currentStreak, bestStreak });
        }

        await deleteCompletionInDb(completionToRemove.id);
      },

      addReaction: async (completionId, emoji, userId, userName) => {
        const state = get();
        const completion = state.completions.find(c => c.id === completionId);
        if (!completion) return;

        const newReaction: Reaction = {
          emoji,
          userId,
          userName,
          createdAt: new Date().toISOString()
        };

        // Remove existing reaction from same user, then add new one
        const existingReactions = completion.reactions || [];
        const filteredReactions = existingReactions.filter(r => r.userId !== userId);
        const updatedReactions = [...filteredReactions, newReaction];

        set((s) => ({
          completions: s.completions.map(c =>
            c.id === completionId ? { ...c, reactions: updatedReactions } : c
          )
        }));

        await updateCompletionInDb(completionId, { reactions: updatedReactions });
      },

      removeReaction: async (completionId, userId) => {
        const state = get();
        const completion = state.completions.find(c => c.id === completionId);
        if (!completion || !completion.reactions) return;

        const updatedReactions = completion.reactions.filter(r => r.userId !== userId);

        set((s) => ({
          completions: s.completions.map(c =>
            c.id === completionId ? { ...c, reactions: updatedReactions } : c
          )
        }));

        await updateCompletionInDb(completionId, { reactions: updatedReactions });
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
