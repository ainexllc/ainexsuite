// apps/grow/src/lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Habit, Quest, Completion, Notification, Reaction, ReactionEmoji } from '../types/models';
import { ICON_BUNDLES } from './bundles';
import {
  createHabitInDb,
  updateHabitInDb,
  deleteHabitInDb,
  bulkDeleteHabitsInDb,
  bulkUpdateHabitsInDb,
  createCompletionInDb,
  deleteCompletionInDb,
  updateCompletionInDb,
  createQuestInDb,
  createNotificationInDb,
  markNotificationReadInDb
} from './firebase-service';
import { getUpdatedStreakValues, getTodayDateString } from './date-utils';

interface GrowState {
  // State - spaces now managed by createSpacesProvider
  habits: Habit[];
  quests: Quest[];
  completions: Completion[];
  notifications: Notification[];
  ownedBundles: string[];

  // Setters (Sync)
  setHabits: (habits: Habit[]) => void;
  setQuests: (quests: Quest[]) => void;
  setCompletions: (completions: Completion[]) => void;
  setNotifications: (notifications: Notification[]) => void;

  // Actions (DB)
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  toggleHabitFreeze: (habitId: string, currentStatus: boolean) => Promise<void>;
  // Bulk Actions
  bulkDeleteHabits: (habitIds: string[]) => Promise<void>;
  bulkUpdateHabits: (habitIds: string[], updates: Partial<Habit>) => Promise<void>;
  addCompletion: (completion: Completion) => Promise<void>;
  removeCompletion: (habitId: string, userId?: string) => Promise<void>;
  addReaction: (completionId: string, emoji: ReactionEmoji, userId: string, userName: string) => Promise<void>;
  removeReaction: (completionId: string, userId: string) => Promise<void>;
  addQuest: (quest: Quest) => Promise<void>;
  sendNotification: (notification: Notification) => Promise<void>;
      markNotificationRead: (notificationId: string) => Promise<void>;

      // Icon bundles
      loadOwnedBundles: () => Promise<void>;
      purchaseBundle: (bundleId: string) => Promise<void>;

  // Getters
  getSpaceHabits: (spaceId: string) => Habit[];
  getSpaceQuests: (spaceId: string) => Quest[];
}

export const useGrowStore = create<GrowState>()(
  persist(
    (set, get) => ({
      habits: [],
      quests: [],
      completions: [],
      notifications: [],
      ownedBundles: [],

      // --- Setters (Sync) ---
      setHabits: (habits) => set({ habits }),
      setQuests: (quests) => set({ quests }),
      setCompletions: (completions) => set({ completions }),
      setNotifications: (notifications) => set({ notifications }),

      // --- Actions (DB) ---
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

      bulkDeleteHabits: async (habitIds) => {
        // Optimistic update - remove from local state first
        set((state) => ({
          habits: state.habits.filter((h) => !habitIds.includes(h.id)),
          // Also remove completions for deleted habits
          completions: state.completions.filter((c) => !habitIds.includes(c.habitId))
        }));
        await bulkDeleteHabitsInDb(habitIds);
      },

      bulkUpdateHabits: async (habitIds, updates) => {
        // Optimistic update - update local state first
        set((state) => ({
          habits: state.habits.map((h) =>
            habitIds.includes(h.id) ? { ...h, ...updates } : h
          )
        }));
        await bulkUpdateHabitsInDb(habitIds, updates);
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

      removeCompletion: async (habitId, userId) => {
        const state = get();
        const today = getTodayDateString();

        // Find today's completion for this habit (and optionally for specific user)
        const completionToRemove = state.completions.find(
          c => c.habitId === habitId && c.date === today && (userId ? c.userId === userId : true)
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

      // Icon bundles (mock for now)
      loadOwnedBundles: async () => {
        // TODO: Fetch from Firestore user doc
        set({ ownedBundles: [] });
      },

      purchaseBundle: async (bundleId: string) => {
        const bundle = ICON_BUNDLES.find(b => b.id === bundleId);
        if (!bundle) throw new Error('Bundle not found');

        const state = get();
        if (state.ownedBundles.includes(bundleId)) {
          throw new Error('Bundle already owned');
        }

        // Mock purchase
        set({ ownedBundles: [...state.ownedBundles, bundleId] });

        // TODO: Stripe checkout, then Firestore update
        // eslint-disable-next-line no-console
        console.log(`Purchased ${bundle.name}`);
      },

      // --- Getters ---
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
      name: 'grow-storage-habits',
      partialize: () => ({}), // No state to persist - spaces managed by createSpacesProvider
    }
  )
);
