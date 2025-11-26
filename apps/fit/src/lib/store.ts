import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FitSpace, Workout, Challenge } from '../types/models';
import {
  createFitSpaceInDb,
  createWorkoutInDb,
  updateWorkoutInDb,
  createChallengeInDb,
  deleteWorkoutFromDb,
  archiveWorkoutInDb
} from './firebase-service';

interface FitState {
  // State
  spaces: FitSpace[];
  currentSpaceId: string;
  workouts: Workout[];
  challenges: Challenge[];
  
  // Setters (Sync)
  setSpaces: (spaces: FitSpace[]) => void;
  setWorkouts: (workouts: Workout[]) => void;
  setChallenges: (challenges: Challenge[]) => void;

  // Actions (DB)
  setCurrentSpace: (spaceId: string) => void;
  addSpace: (space: FitSpace) => Promise<void>;
  addWorkout: (workout: Workout) => Promise<void>;
  updateWorkout: (workoutId: string, data: Partial<Workout>) => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;
  archiveWorkout: (workoutId: string) => Promise<void>;
  addChallenge: (challenge: Challenge) => Promise<void>;
  
  // Getters
  getCurrentSpace: () => FitSpace | undefined;
}

export const useFitStore = create<FitState>()(
  persist(
    (set, get) => ({
      spaces: [],
      currentSpaceId: '',
      workouts: [],
      challenges: [],

      setSpaces: (spaces) => {
        const currentId = get().currentSpaceId;
        let nextId = currentId;
        if (spaces.length > 0 && !spaces.find(s => s.id === currentId)) {
          nextId = spaces[0].id;
        }
        set({ spaces, currentSpaceId: nextId });
      },
      setWorkouts: (workouts) => set({ workouts }),
      setChallenges: (challenges) => set({ challenges }),

      setCurrentSpace: (spaceId) => set({ currentSpaceId: spaceId }),
      
      addSpace: async (space) => {
        set((state) => ({ spaces: [...state.spaces, space], currentSpaceId: space.id }));
        await createFitSpaceInDb(space);
      },

      addWorkout: async (workout) => {
        // Check if workout with this ID already exists (prevent duplicates)
        const existing = get().workouts.find(w => w.id === workout.id);
        if (existing) {
          console.warn('Workout already exists, skipping duplicate:', workout.id);
          return;
        }
        set((state) => ({ workouts: [workout, ...state.workouts] }));
        await createWorkoutInDb(workout);
      },

      updateWorkout: async (workoutId, data) => {
        // Update local state optimistically
        set((state) => ({
          workouts: state.workouts.map(w =>
            w.id === workoutId ? { ...w, ...data } : w
          )
        }));
        await updateWorkoutInDb(workoutId, data);
      },

      deleteWorkout: async (workoutId) => {
        set((state) => ({ workouts: state.workouts.filter(w => w.id !== workoutId) }));
        await deleteWorkoutFromDb(workoutId);
      },

      archiveWorkout: async (workoutId) => {
        set((state) => ({ workouts: state.workouts.filter(w => w.id !== workoutId) }));
        await archiveWorkoutInDb(workoutId);
      },

      addChallenge: async (challenge) => {
        set((state) => ({ challenges: [...state.challenges, challenge] }));
        await createChallengeInDb(challenge);
      },

      getCurrentSpace: () => {
        const { spaces, currentSpaceId } = get();
        return spaces.find((s) => s.id === currentSpaceId);
      },
    }),
    {
      name: 'fit-storage-client-prefs',
      partialize: (state) => ({ currentSpaceId: state.currentSpaceId }),
    }
  )
);
