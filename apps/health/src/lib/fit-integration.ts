/**
 * FIT App Integration for HEALTH
 * Fetches workout data from the FIT app's Firestore collection
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

const WORKOUTS_COLLECTION = 'workouts';

export interface FitWorkoutSummary {
  id: string;
  title: string;
  date: string;
  duration: number; // minutes
  exerciseCount: number;
  caloriesBurned?: number;
  feeling?: 'great' | 'good' | 'tired' | 'exhausted';
}

export interface FitWeeklyStats {
  totalWorkouts: number;
  totalDuration: number; // minutes
  totalCalories: number;
  averageDuration: number;
}

function getCurrentUserId(): string | null {
  return auth.currentUser?.uid ?? null;
}

/**
 * Get recent workouts from FIT app (last 7 days)
 */
export async function getRecentWorkouts(
  limitCount: number = 5
): Promise<FitWorkoutSummary[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    const workoutsRef = collection(db, WORKOUTS_COLLECTION);
    const q = query(
      workoutsRef,
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Workout',
        date: data.date,
        duration: data.duration || 0,
        exerciseCount: data.exercises?.length || 0,
        caloriesBurned: data.caloriesBurned,
        feeling: data.feeling,
      };
    });
  } catch (error) {
    console.error('Failed to fetch FIT workouts:', error);
    return [];
  }
}

/**
 * Calculate weekly workout stats
 */
export async function getWeeklyWorkoutStats(): Promise<FitWeeklyStats> {
  const userId = getCurrentUserId();
  if (!userId) {
    return { totalWorkouts: 0, totalDuration: 0, totalCalories: 0, averageDuration: 0 };
  }

  try {
    // Get workouts from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString().split('T')[0];

    const workoutsRef = collection(db, WORKOUTS_COLLECTION);
    const q = query(
      workoutsRef,
      where('userId', '==', userId),
      where('date', '>=', startDate),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    const workouts = snapshot.docs.map((doc) => doc.data());

    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

    return {
      totalWorkouts,
      totalDuration,
      totalCalories,
      averageDuration,
    };
  } catch (error) {
    console.error('Failed to fetch weekly workout stats:', error);
    return { totalWorkouts: 0, totalDuration: 0, totalCalories: 0, averageDuration: 0 };
  }
}

/**
 * Get feeling emoji for workout
 */
export function getFeelingEmoji(feeling: string | undefined): string {
  switch (feeling) {
    case 'great':
      return '';
    case 'good':
      return '';
    case 'tired':
      return '';
    case 'exhausted':
      return '';
    default:
      return '';
  }
}
