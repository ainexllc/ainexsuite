'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';

// Types matching the habits app
export interface Habit {
  id: string;
  spaceId: string;
  title: string;
  description?: string;
  schedule: {
    type: 'daily' | 'weekly' | 'interval' | 'specific_days';
    daysOfWeek?: number[];
    intervalDays?: number;
    timesPerWeek?: number;
  };
  assigneeIds: string[];
  currentStreak: number;
  bestStreak: number;
  isFrozen: boolean;
  category?: string;
  createdAt: string;
  lastCompletedAt?: string;
}

export interface Completion {
  id: string;
  habitId: string;
  spaceId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completedAt: string;
}

export interface HabitWithStatus extends Habit {
  isCompletedToday: boolean;
  completionId?: string;
}

export interface HabitsData {
  habits: HabitWithStatus[];
  completedCount: number;
  totalCount: number;
  bestStreak: number;
  isLoading: boolean;
  error: string | null;
  toggleHabit: (habit: HabitWithStatus) => Promise<void>;
}

// Get today's date in YYYY-MM-DD format
function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Check if habit is due today based on schedule
function isHabitDueToday(habit: Habit): boolean {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday

  switch (habit.schedule.type) {
    case 'daily':
      return true;
    case 'specific_days':
      return habit.schedule.daysOfWeek?.includes(dayOfWeek) ?? false;
    case 'weekly':
      // For weekly, assume it's due every day until timesPerWeek is met
      return true;
    case 'interval': {
      if (!habit.lastCompletedAt || !habit.schedule.intervalDays) return true;
      const lastCompleted = new Date(habit.lastCompletedAt);
      const daysSince = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
      return daysSince >= habit.schedule.intervalDays;
    }
    default:
      return true;
  }
}

export function useHabitsData(userId: string | undefined, spaceId?: string): HabitsData {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to habits
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Query habits where user is assigned
    const habitsQuery = query(
      collection(db, 'habits'),
      where('assigneeIds', 'array-contains', userId)
    );

    const unsubscribeHabits = onSnapshot(
      habitsQuery,
      (snapshot) => {
        const habitsData = snapshot.docs.map(doc => doc.data() as Habit);
        // Filter by spaceId if provided
        const filtered = spaceId
          ? habitsData.filter(h => h.spaceId === spaceId)
          : habitsData;
        setHabits(filtered);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching habits:', err);
        setError('Failed to load habits');
        setIsLoading(false);
      }
    );

    return () => unsubscribeHabits();
  }, [userId, spaceId]);

  // Subscribe to today's completions
  useEffect(() => {
    if (!userId) return;

    const today = getTodayDateString();

    const completionsQuery = query(
      collection(db, 'completions'),
      where('userId', '==', userId),
      where('date', '==', today)
    );

    const unsubscribeCompletions = onSnapshot(
      completionsQuery,
      (snapshot) => {
        const completionsData = snapshot.docs.map(doc => doc.data() as Completion);
        setCompletions(completionsData);
      },
      (err) => {
        console.error('Error fetching completions:', err);
      }
    );

    return () => unsubscribeCompletions();
  }, [userId]);

  // Merge habits with completion status
  const habitsWithStatus: HabitWithStatus[] = habits
    .filter(habit => !habit.isFrozen && isHabitDueToday(habit))
    .map(habit => {
      const completion = completions.find(c => c.habitId === habit.id);
      return {
        ...habit,
        isCompletedToday: !!completion,
        completionId: completion?.id,
      };
    });

  const completedCount = habitsWithStatus.filter(h => h.isCompletedToday).length;
  const totalCount = habitsWithStatus.length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak), 0);

  // Toggle habit completion
  const toggleHabit = useCallback(async (habit: HabitWithStatus) => {
    if (!userId) return;

    const today = getTodayDateString();

    if (habit.isCompletedToday && habit.completionId) {
      // Uncomplete - delete completion
      await deleteDoc(doc(db, 'completions', habit.completionId));
    } else {
      // Complete - create completion
      const completionId = `${habit.id}_${userId}_${today}`;
      const completion: Completion = {
        id: completionId,
        habitId: habit.id,
        spaceId: habit.spaceId,
        userId,
        date: today,
        completedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'completions', completionId), completion);
    }
  }, [userId]);

  return {
    habits: habitsWithStatus,
    completedCount,
    totalCount,
    bestStreak,
    isLoading,
    error,
    toggleHabit,
  };
}
