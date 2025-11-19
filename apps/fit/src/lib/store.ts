import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FitSpace, Workout, Challenge } from '../types/models';
import { 
  createFitSpaceInDb, 
  createWorkoutInDb, 
  createChallengeInDb 
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
        set((state) => ({ workouts: [workout, ...state.workouts] }));
        await createWorkoutInDb(workout);
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
