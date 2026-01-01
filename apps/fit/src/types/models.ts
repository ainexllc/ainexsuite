// apps/fit/src/types/models.ts

import type { SpaceType } from '@ainexsuite/types';

export type { SpaceType };

export interface Member {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member' | 'observer';
  joinedAt: string;
}

export interface FitSpace {
  id: string;
  name: string; // "Gym Bros", "Running Club"
  type: SpaceType;
  members: Member[];
  memberUids: string[];
  createdAt: string;
  createdBy: string;
}

export interface ExerciseSet {
  id: string;
  weight?: number;
  reps?: number;
  distance?: number; // km/miles
  duration?: number; // seconds
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  notes?: string;
}

export interface Workout {
  id: string;
  spaceId: string; // Link to space
  userId: string; // Who did this workout?
  title: string;
  date: string;
  duration: number; // Total minutes
  exercises: Exercise[];
  caloriesBurned?: number;
  feeling?: 'great' | 'good' | 'tired' | 'exhausted';
  likes?: string[]; // Array of user UIDs who liked this
  comments?: Comment[];
  archived?: boolean; // Soft-delete/archive flag
  archivedAt?: string;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  spaceId: string;
  title: string; // "1000 Pushups in a Month"
  metric: 'workouts' | 'distance' | 'calories' | 'weight_volume';
  target: number;
  startDate: string;
  endDate: string;
  participants: string[];
  status: 'active' | 'completed';
}
