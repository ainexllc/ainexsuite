/**
 * Workout Service for Fit App
 * Handles all workout-related Firebase operations
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db, auth } from '@ainexsuite/firebase';
import type { Workout, WorkoutSummary, WeeklyWorkoutStats } from './types/workout';

const WORKOUTS_COLLECTION = 'workouts';

function getCurrentUserId(): string | null {
  return auth.currentUser?.uid ?? null;
}

// --- Create/Update/Delete Operations ---

export async function createWorkoutInDb(workout: Workout): Promise<void> {
  const workoutRef = doc(collection(db, WORKOUTS_COLLECTION), workout.id);
  await setDoc(workoutRef, { ...workout, archived: false });
}

export async function updateWorkoutInDb(workoutId: string, data: Partial<Workout>): Promise<void> {
  const workoutRef = doc(db, WORKOUTS_COLLECTION, workoutId);
  await updateDoc(workoutRef, data);
}

export async function deleteWorkoutFromDb(workoutId: string): Promise<void> {
  const workoutRef = doc(db, WORKOUTS_COLLECTION, workoutId);
  await deleteDoc(workoutRef);
}

export async function archiveWorkoutInDb(workoutId: string): Promise<void> {
  const workoutRef = doc(db, WORKOUTS_COLLECTION, workoutId);
  await updateDoc(workoutRef, {
    archived: true,
    archivedAt: new Date().toISOString(),
  });
}

export async function unarchiveWorkoutInDb(workoutId: string): Promise<void> {
  const workoutRef = doc(db, WORKOUTS_COLLECTION, workoutId);
  await updateDoc(workoutRef, {
    archived: false,
    archivedAt: null,
  });
}

// --- Subscriptions (Real-time) ---

export function subscribeToUserWorkouts(
  userId: string,
  callback: (workouts: Workout[]) => void,
  spaceId?: string
): () => void {
  let q;

  if (spaceId && spaceId !== 'personal') {
    // Filter by space
    q = query(
      collection(db, WORKOUTS_COLLECTION),
      where('spaceId', '==', spaceId),
      where('archived', '!=', true),
      orderBy('archived'),
      orderBy('date', 'desc'),
      limit(100)
    );
  } else {
    // Personal workouts (no spaceId or spaceId is 'personal')
    q = query(
      collection(db, WORKOUTS_COLLECTION),
      where('userId', '==', userId),
      where('archived', '!=', true),
      orderBy('archived'),
      orderBy('date', 'desc'),
      limit(100)
    );
  }

  return onSnapshot(q, (snapshot) => {
    const workouts = snapshot.docs
      .map((doc) => doc.data() as Workout)
      .filter((w) => {
        // For personal, filter out workouts that belong to other spaces
        if (!spaceId || spaceId === 'personal') {
          return !w.spaceId || w.spaceId === 'personal';
        }
        return true;
      });
    callback(workouts);
  });
}

// --- One-time Queries ---

export async function getRecentWorkouts(limitCount: number = 5): Promise<WorkoutSummary[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    const workoutsRef = collection(db, WORKOUTS_COLLECTION);
    const q = query(
      workoutsRef,
      where('userId', '==', userId),
      where('archived', '!=', true),
      orderBy('archived'),
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
    console.error('Failed to fetch workouts:', error);
    return [];
  }
}

export async function getWeeklyWorkoutStats(): Promise<WeeklyWorkoutStats> {
  const userId = getCurrentUserId();
  if (!userId) {
    return { totalWorkouts: 0, totalDuration: 0, totalCalories: 0, averageDuration: 0 };
  }

  try {
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
