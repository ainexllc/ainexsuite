'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useAuth } from '@ainexsuite/auth';
import type { Workout } from '@/lib/types/workout';
import {
  subscribeToUserWorkouts,
  createWorkoutInDb,
  updateWorkoutInDb,
  deleteWorkoutFromDb,
  archiveWorkoutInDb,
} from '@/lib/workout-service';

interface WorkoutsContextValue {
  workouts: Workout[];
  isLoading: boolean;
  error: string | null;
  addWorkout: (workout: Workout) => Promise<void>;
  updateWorkout: (workoutId: string, data: Partial<Workout>) => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;
  archiveWorkout: (workoutId: string) => Promise<void>;
  refresh: () => void;
}

const WorkoutsContext = createContext<WorkoutsContextValue | null>(null);

export function WorkoutsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Subscribe to workouts
  useEffect(() => {
    if (!user?.uid) {
      setWorkouts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserWorkouts(user.uid, (fetchedWorkouts) => {
      setWorkouts(fetchedWorkouts);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, refreshKey]);

  const addWorkout = useCallback(async (workout: Workout) => {
    // Optimistic update
    setWorkouts((prev) => {
      // Check for duplicates
      if (prev.find((w) => w.id === workout.id)) {
        return prev;
      }
      return [workout, ...prev];
    });

    try {
      await createWorkoutInDb(workout);
    } catch (err) {
      // Rollback on error
      setWorkouts((prev) => prev.filter((w) => w.id !== workout.id));
      setError('Failed to create workout');
      throw err;
    }
  }, []);

  const updateWorkout = useCallback(async (workoutId: string, data: Partial<Workout>) => {
    // Optimistic update
    setWorkouts((prev) =>
      prev.map((w) => (w.id === workoutId ? { ...w, ...data } : w))
    );

    try {
      await updateWorkoutInDb(workoutId, data);
    } catch (err) {
      setError('Failed to update workout');
      throw err;
    }
  }, []);

  const deleteWorkout = useCallback(async (workoutId: string) => {
    // Store for rollback
    const workoutToDelete = workouts.find((w) => w.id === workoutId);

    // Optimistic update
    setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));

    try {
      await deleteWorkoutFromDb(workoutId);
    } catch (err) {
      // Rollback on error
      if (workoutToDelete) {
        setWorkouts((prev) => [...prev, workoutToDelete]);
      }
      setError('Failed to delete workout');
      throw err;
    }
  }, [workouts]);

  const archiveWorkout = useCallback(async (workoutId: string) => {
    // Optimistic update (remove from list since archived workouts aren't shown)
    setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));

    try {
      await archiveWorkoutInDb(workoutId);
    } catch (err) {
      setError('Failed to archive workout');
      throw err;
    }
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const value = useMemo(
    () => ({
      workouts,
      isLoading,
      error,
      addWorkout,
      updateWorkout,
      deleteWorkout,
      archiveWorkout,
      refresh,
    }),
    [workouts, isLoading, error, addWorkout, updateWorkout, deleteWorkout, archiveWorkout, refresh]
  );

  return (
    <WorkoutsContext.Provider value={value}>
      {children}
    </WorkoutsContext.Provider>
  );
}

export function useWorkouts() {
  const context = useContext(WorkoutsContext);
  if (!context) {
    throw new Error('useWorkouts must be used within a WorkoutsProvider');
  }
  return context;
}
