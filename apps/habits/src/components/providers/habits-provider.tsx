"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useGrowStore } from "@/lib/store";
import { useSpaces } from "./spaces-provider";
import type { Habit, Completion } from "@/types/models";

interface HabitsContextValue {
  habits: Habit[];
  completions: Completion[];
  spaceHabits: Habit[];
  loading: boolean;
  // Computed stats
  totalHabits: number;
  activeHabits: number;
  frozenHabits: number;
  completedToday: number;
  currentStreakTotal: number;
  bestStreakTotal: number;
}

const HabitsContext = createContext<HabitsContextValue | null>(null);

interface HabitsProviderProps {
  children: ReactNode;
}

/**
 * Habits provider that wraps the Zustand store
 * Provides habits data through context for components that need it
 */
export function HabitsProvider({ children }: HabitsProviderProps) {
  const { habits, completions } = useGrowStore();
  const { currentSpaceId } = useSpaces();

  // Filter habits for current space
  const spaceHabits = useMemo(() => {
    if (!currentSpaceId) return habits;
    return habits.filter((h) => h.spaceId === currentSpaceId);
  }, [habits, currentSpaceId]);

  // Computed stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayCompletions = completions.filter((c) => c.date === today);
    const completedHabitIds = new Set(todayCompletions.map((c) => c.habitId));

    const activeHabits = spaceHabits.filter((h) => !h.isFrozen);
    const frozenHabits = spaceHabits.filter((h) => h.isFrozen);
    const completedToday = spaceHabits.filter((h) =>
      completedHabitIds.has(h.id)
    ).length;

    const currentStreakTotal = spaceHabits.reduce(
      (sum, h) => sum + (h.currentStreak || 0),
      0
    );
    const bestStreakTotal = spaceHabits.reduce(
      (sum, h) => sum + (h.bestStreak || 0),
      0
    );

    return {
      totalHabits: spaceHabits.length,
      activeHabits: activeHabits.length,
      frozenHabits: frozenHabits.length,
      completedToday,
      currentStreakTotal,
      bestStreakTotal,
    };
  }, [spaceHabits, completions]);

  const value = useMemo<HabitsContextValue>(
    () => ({
      habits,
      completions,
      spaceHabits,
      loading: false, // Data comes from Zustand store which is synced via FirestoreSync
      ...stats,
    }),
    [habits, completions, spaceHabits, stats]
  );

  return (
    <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);

  if (!context) {
    throw new Error("useHabits must be used within a HabitsProvider.");
  }

  return context;
}
