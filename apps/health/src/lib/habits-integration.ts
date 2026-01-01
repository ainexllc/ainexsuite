/**
 * HABITS App Integration for HEALTH
 * Fetches habit and completion data from the Habits app's Firestore collections
 */

import { db, auth } from '@ainexsuite/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import type {
  HabitProgressSummary,
  HabitCompletionItem,
  HabitStreakItem,
  HabitWeeklyStats,
} from '@ainexsuite/types';

const HABITS_COLLECTION = 'habits';
const COMPLETIONS_COLLECTION = 'completions';

interface HabitDoc {
  id: string;
  title: string;
  category?: string;
  currentStreak: number;
  bestStreak: number;
  targetValue?: number;
  targetUnit?: string;
  assigneeIds: string[];
  isFrozen: boolean;
  spaceId: string;
}

interface CompletionDoc {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  value?: number;
  completedAt: string;
}

function getCurrentUserId(): string | null {
  return auth.currentUser?.uid ?? null;
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function getWeekAgoDateString(): string {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return weekAgo.toISOString().split('T')[0];
}

/**
 * Get today's habit progress for the current user
 */
export async function getTodayHabitProgress(): Promise<HabitProgressSummary> {
  const userId = getCurrentUserId();
  const today = getTodayDateString();

  const emptyResult: HabitProgressSummary = {
    date: today,
    totalHabits: 0,
    completedHabits: 0,
    completionRate: 0,
    healthHabits: [],
    fitnessHabits: [],
    topStreaks: [],
  };

  if (!userId) return emptyResult;

  try {
    // Get all habits assigned to this user
    const habitsRef = collection(db, HABITS_COLLECTION);
    const habitsQuery = query(
      habitsRef,
      where('assigneeIds', 'array-contains', userId)
    );

    const habitsSnapshot = await getDocs(habitsQuery);
    const habits: HabitDoc[] = habitsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as HabitDoc[];

    // Filter to only active (non-frozen) habits
    const activeHabits = habits.filter((h) => !h.isFrozen);

    if (activeHabits.length === 0) return emptyResult;

    // Get today's completions
    const completionsRef = collection(db, COMPLETIONS_COLLECTION);
    const completionsQuery = query(
      completionsRef,
      where('userId', '==', userId),
      where('date', '==', today)
    );

    const completionsSnapshot = await getDocs(completionsQuery);
    const completions: CompletionDoc[] = completionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CompletionDoc[];

    const completedHabitIds = new Set(completions.map((c) => c.habitId));

    // Build habit items
    const healthHabits: HabitCompletionItem[] = [];
    const fitnessHabits: HabitCompletionItem[] = [];
    const allStreaks: HabitStreakItem[] = [];

    for (const habit of activeHabits) {
      const isCompleted = completedHabitIds.has(habit.id);
      const completion = completions.find((c) => c.habitId === habit.id);

      const item: HabitCompletionItem = {
        habitId: habit.id,
        habitTitle: habit.title,
        completed: isCompleted,
        category: habit.category || 'other',
        streak: habit.currentStreak,
        targetValue: habit.targetValue,
        targetUnit: habit.targetUnit,
        completedValue: completion?.value,
      };

      // Categorize by type
      if (habit.category === 'health') {
        healthHabits.push(item);
      } else if (habit.category === 'fitness') {
        fitnessHabits.push(item);
      }

      // Track streaks
      if (habit.currentStreak > 0) {
        allStreaks.push({
          habitId: habit.id,
          habitTitle: habit.title,
          currentStreak: habit.currentStreak,
          bestStreak: habit.bestStreak,
          category: habit.category || 'other',
        });
      }
    }

    // Sort streaks by current streak descending
    allStreaks.sort((a, b) => b.currentStreak - a.currentStreak);

    const completedCount = completions.length;
    const totalCount = activeHabits.length;

    return {
      date: today,
      totalHabits: totalCount,
      completedHabits: completedCount,
      completionRate: totalCount > 0 ? completedCount / totalCount : 0,
      healthHabits,
      fitnessHabits,
      topStreaks: allStreaks.slice(0, 5),
    };
  } catch (error) {
    console.error('Failed to fetch habit progress:', error);
    return emptyResult;
  }
}

/**
 * Get weekly habit statistics
 */
export async function getWeeklyHabitStats(): Promise<HabitWeeklyStats> {
  const userId = getCurrentUserId();
  const emptyStats: HabitWeeklyStats = {
    totalCompletions: 0,
    averageCompletionRate: 0,
    longestActiveStreak: 0,
    healthHabitCompletions: 0,
    fitnessHabitCompletions: 0,
  };

  if (!userId) return emptyStats;

  try {
    const weekAgo = getWeekAgoDateString();

    // Get all habits for this user
    const habitsRef = collection(db, HABITS_COLLECTION);
    const habitsQuery = query(
      habitsRef,
      where('assigneeIds', 'array-contains', userId)
    );

    const habitsSnapshot = await getDocs(habitsQuery);
    const habits: HabitDoc[] = habitsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as HabitDoc[];

    const habitMap = new Map<string, HabitDoc>();
    habits.forEach((h) => habitMap.set(h.id, h));

    // Get completions from the last 7 days
    const completionsRef = collection(db, COMPLETIONS_COLLECTION);
    const completionsQuery = query(
      completionsRef,
      where('userId', '==', userId),
      where('date', '>=', weekAgo),
      orderBy('date', 'desc')
    );

    const completionsSnapshot = await getDocs(completionsQuery);
    const completions: CompletionDoc[] = completionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CompletionDoc[];

    // Calculate stats
    let healthCompletions = 0;
    let fitnessCompletions = 0;

    for (const completion of completions) {
      const habit = habitMap.get(completion.habitId);
      if (habit?.category === 'health') {
        healthCompletions++;
      } else if (habit?.category === 'fitness') {
        fitnessCompletions++;
      }
    }

    // Find longest active streak
    const activeHabits = habits.filter((h) => !h.isFrozen);
    const longestStreak = activeHabits.reduce(
      (max, h) => Math.max(max, h.currentStreak),
      0
    );

    // Calculate average completion rate (completions per day / active habits)
    const uniqueDays = new Set(completions.map((c) => c.date)).size;
    const avgDaily = uniqueDays > 0 ? completions.length / uniqueDays : 0;
    const avgRate =
      activeHabits.length > 0 ? avgDaily / activeHabits.length : 0;

    return {
      totalCompletions: completions.length,
      averageCompletionRate: Math.min(avgRate, 1),
      longestActiveStreak: longestStreak,
      healthHabitCompletions: healthCompletions,
      fitnessHabitCompletions: fitnessCompletions,
    };
  } catch (error) {
    console.error('Failed to fetch weekly habit stats:', error);
    return emptyStats;
  }
}

/**
 * Get recent habit completions for activity feed
 */
export async function getRecentHabitCompletions(
  limitCount: number = 10
): Promise<
  Array<{
    id: string;
    habitId: string;
    habitTitle: string;
    category: string;
    completedAt: string;
    value?: number;
  }>
> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    // Get habits first for titles
    const habitsRef = collection(db, HABITS_COLLECTION);
    const habitsQuery = query(
      habitsRef,
      where('assigneeIds', 'array-contains', userId)
    );

    const habitsSnapshot = await getDocs(habitsQuery);
    const habitMap = new Map<string, { title: string; category: string }>();
    habitsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      habitMap.set(doc.id, {
        title: data.title,
        category: data.category || 'other',
      });
    });

    // Get recent completions
    const completionsRef = collection(db, COMPLETIONS_COLLECTION);
    const completionsQuery = query(
      completionsRef,
      where('userId', '==', userId),
      orderBy('completedAt', 'desc'),
      limit(limitCount)
    );

    const completionsSnapshot = await getDocs(completionsQuery);

    return completionsSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        const habit = habitMap.get(data.habitId);
        return {
          id: doc.id,
          habitId: data.habitId,
          habitTitle: habit?.title || 'Unknown Habit',
          category: habit?.category || 'other',
          completedAt: data.completedAt,
          value: data.value,
        };
      })
      .filter((c) => c.habitTitle !== 'Unknown Habit');
  } catch (error) {
    console.error('Failed to fetch recent completions:', error);
    return [];
  }
}

/**
 * Get habit category icon
 */
export function getHabitCategoryIcon(category: string): string {
  switch (category) {
    case 'health':
      return '💚';
    case 'fitness':
      return '💪';
    case 'medicine':
      return '💊';
    case 'productivity':
      return '⚡';
    case 'mindfulness':
      return '🧘';
    case 'learning':
      return '📚';
    case 'relationships':
      return '❤️';
    case 'finance':
      return '💰';
    case 'creativity':
      return '🎨';
    case 'self-care':
      return '✨';
    default:
      return '📌';
  }
}

/**
 * Get habit category color
 */
export function getHabitCategoryColor(category: string): string {
  switch (category) {
    case 'health':
      return '#10b981';
    case 'fitness':
      return '#3b82f6';
    case 'medicine':
      return '#ef4444';
    case 'productivity':
      return '#f59e0b';
    case 'mindfulness':
      return '#8b5cf6';
    case 'learning':
      return '#06b6d4';
    case 'relationships':
      return '#ec4899';
    case 'finance':
      return '#22c55e';
    case 'creativity':
      return '#f97316';
    case 'self-care':
      return '#a855f7';
    default:
      return '#6b7280';
  }
}
