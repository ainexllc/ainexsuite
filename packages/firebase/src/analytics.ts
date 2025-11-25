/**
 * Cross-App Analytics System
 * Calculates productivity metrics and insights across all 8 apps
 */

import { db } from './client';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';

/**
 * Get current user ID (temporary placeholder)
 * TODO: Replace with actual auth context
 */
function getCurrentUserId(): string {
  return 'test-user-id';
}

/**
 * Productivity analytics data
 */
export interface ProductivityAnalytics {
  summary: {
    totalNotes: number;
    totalTasks: number;
    completedTasks: number;
    activeHabits: number;
    totalMoments: number;
    learningGoals: number;
    weeklyWorkouts: number;
  };
  trends: {
    notesThisWeek: number;
    tasksCompletedThisWeek: number;
    journalEntriesThisWeek: number;
    habitsCompletedThisWeek: number;
    momentsThisWeek: number;
    workoutsThisWeek: number;
  };
  insights: {
    mostProductiveApp: string;
    completionRate: number; // Tasks completion percentage
    consistencyScore: number; // Habit consistency (0-100)
    averageMood: string | null;
    learningProgress: number; // Average % across all goals
  };
  activity: {
    dailyActivity: Array<{
      date: string;
      notes: number;
      tasks: number;
      journal: number;
      habits: number;
      moments: number;
      workouts: number;
    }>;
  };
}

/**
 * Get comprehensive productivity analytics
 */
export async function getProductivityAnalytics(): Promise<ProductivityAnalytics> {
  const userId = getCurrentUserId();
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  // Summary metrics
  const summary = {
    totalNotes: 0,
    totalTasks: 0,
    completedTasks: 0,
    activeHabits: 0,
    totalMoments: 0,
    learningGoals: 0,
    weeklyWorkouts: 0,
  };

  // Trends (this week)
  const trends = {
    notesThisWeek: 0,
    tasksCompletedThisWeek: 0,
    journalEntriesThisWeek: 0,
    habitsCompletedThisWeek: 0,
    momentsThisWeek: 0,
    workoutsThisWeek: 0,
  };

  // Notes
  const notesSnapshot = await getDocs(
    query(
      collection(db, 'notes'),
      where('ownerId', '==', userId)
    )
  );
  summary.totalNotes = notesSnapshot.size;
  notesSnapshot.forEach((doc) => {
    if (doc.data().createdAt >= weekAgo) {
      trends.notesThisWeek++;
    }
  });

  // Tasks
  const tasksSnapshot = await getDocs(
    query(
      collection(db, 'tasks'),
      where('ownerId', '==', userId)
    )
  );
  summary.totalTasks = tasksSnapshot.size;
  tasksSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.isCompleted) {
      summary.completedTasks++;
      if (data.updatedAt >= weekAgo) {
        trends.tasksCompletedThisWeek++;
      }
    }
  });

  // Journal
  const journalSnapshot = await getDocs(
    query(
      collection(db, 'journal_entries'),
      where('ownerId', '==', userId),
      orderBy('date', 'desc'),
      firestoreLimit(7)
    )
  );
  let moodCount = 0;
  let moodTotal = 0;
  const moodValues: Record<string, number> = {
    'Amazing': 5,
    'Good': 4,
    'Okay': 3,
    'Bad': 2,
    'Terrible': 1,
  };
  journalSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.date >= weekAgo) {
      trends.journalEntriesThisWeek++;
    }
    if (data.mood && moodValues[data.mood]) {
      moodTotal += moodValues[data.mood];
      moodCount++;
    }
  });
  const avgMoodValue = moodCount > 0 ? moodTotal / moodCount : 0;
  const avgMood =
    avgMoodValue >= 4.5
      ? 'Amazing'
      : avgMoodValue >= 3.5
      ? 'Good'
      : avgMoodValue >= 2.5
      ? 'Okay'
      : avgMoodValue >= 1.5
      ? 'Bad'
      : avgMoodValue > 0
      ? 'Terrible'
      : null;

  // Habits
  const habitsSnapshot = await getDocs(
    query(
      collection(db, 'habits'),
      where('ownerId', '==', userId)
    )
  );
  summary.activeHabits = habitsSnapshot.size;

  // Habit completions
  const completionsSnapshot = await getDocs(
    query(
      collection(db, 'habit_completions'),
      where('ownerId', '==', userId)
    )
  );
  completionsSnapshot.forEach((doc) => {
    if (doc.data().date >= weekAgo) {
      trends.habitsCompletedThisWeek++;
    }
  });

  // Moments
  const momentsSnapshot = await getDocs(
    query(
      collection(db, 'moments'),
      where('ownerId', '==', userId)
    )
  );
  summary.totalMoments = momentsSnapshot.size;
  momentsSnapshot.forEach((doc) => {
    if (doc.data().createdAt >= weekAgo) {
      trends.momentsThisWeek++;
    }
  });

  // Learning Goals
  const goalsSnapshot = await getDocs(
    query(
      collection(db, 'learning_goals'),
      where('ownerId', '==', userId)
    )
  );
  summary.learningGoals = goalsSnapshot.size;
  let totalProgress = 0;
  goalsSnapshot.forEach((doc) => {
    totalProgress += doc.data().progress || 0;
  });
  const learningProgress =
    goalsSnapshot.size > 0 ? totalProgress / goalsSnapshot.size : 0;

  // Workouts
  const workoutsSnapshot = await getDocs(
    query(
      collection(db, 'workouts'),
      where('ownerId', '==', userId),
      orderBy('date', 'desc'),
      firestoreLimit(10)
    )
  );
  workoutsSnapshot.forEach((doc) => {
    if (doc.data().date >= weekAgo) {
      summary.weeklyWorkouts++;
      trends.workoutsThisWeek++;
    }
  });

  // Calculate insights
  const completionRate =
    summary.totalTasks > 0
      ? Math.round((summary.completedTasks / summary.totalTasks) * 100)
      : 0;

  const consistencyScore = Math.min(
    100,
    Math.round((trends.habitsCompletedThisWeek / Math.max(summary.activeHabits * 7, 1)) * 100)
  );

  // Determine most productive app
  // Note: GROW handles habits now, HEALTH handles body metrics
  const activityCounts = {
    notes: trends.notesThisWeek,
    journal: trends.journalEntriesThisWeek,
    todo: trends.tasksCompletedThisWeek,
    grow: trends.habitsCompletedThisWeek,
    moments: trends.momentsThisWeek,
    fit: trends.workoutsThisWeek,
  };
  const mostProductiveApp =
    Object.entries(activityCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'notes';

  // Daily activity (last 7 days) - simplified for now
  const dailyActivity = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    return {
      date: date.toLocaleDateString(),
      notes: Math.floor(trends.notesThisWeek / 7),
      tasks: Math.floor(trends.tasksCompletedThisWeek / 7),
      journal: trends.journalEntriesThisWeek > i ? 1 : 0,
      habits: Math.floor(trends.habitsCompletedThisWeek / 7),
      moments: Math.floor(trends.momentsThisWeek / 7),
      workouts: trends.workoutsThisWeek > i ? 1 : 0,
    };
  }).reverse();

  return {
    summary,
    trends,
    insights: {
      mostProductiveApp,
      completionRate,
      consistencyScore,
      averageMood: avgMood,
      learningProgress: Math.round(learningProgress),
    },
    activity: {
      dailyActivity,
    },
  };
}
