import type { ExerciseCategory, Timestamp } from './common';

export interface ExerciseSet {
  setNumber: number;
  reps: number;
  weight: number; // kg or lbs based on user pref
  restTime: number; // seconds
  completed: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  sets: ExerciseSet[];
  notes: string;
}

export interface Workout {
  id: string;
  ownerId: string;
  name: string;
  date: Timestamp;
  duration: number; // minutes
  exercises: WorkoutExercise[];
  notes: string;
  createdAt: Timestamp;
}

export type CreateWorkoutInput = Omit<Workout, 'id' | 'createdAt'>;

export type UpdateWorkoutInput = Partial<Omit<Workout, 'id' | 'ownerId' | 'createdAt'>>;

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: string[];
  equipment: string[];
  instructions: string;
  videoUrl: string;
  tips: string[];
}

export interface PersonalRecord {
  id: string;
  ownerId: string;
  exerciseId: string;
  exerciseName: string;
  recordType: 'max_weight' | 'max_reps' | 'max_distance' | 'fastest_time';
  value: number;
  unit: string;
  date: Timestamp;
  workoutId: string;
}

export type CreatePersonalRecordInput = Omit<PersonalRecord, 'id'>;

export interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number; // minutes
  totalExercises: number;
  totalSets: number;
  totalReps: number;
  totalWeight: number; // kg or lbs
  personalRecords: number;
  favoriteExercises: Array<{
    exerciseId: string;
    exerciseName: string;
    count: number;
  }>;
}
