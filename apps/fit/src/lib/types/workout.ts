// apps/fit/src/lib/types/workout.ts
// Workout types for fitness tracking within the Fit app

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

export type WorkoutFeeling = 'great' | 'good' | 'tired' | 'exhausted';

export interface WorkoutComment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Workout {
  id: string;
  userId: string;
  // Required - 'personal' for personal content, or actual space ID
  spaceId: string;
  title: string;
  date: string;
  duration: number; // Total minutes
  exercises: Exercise[];
  caloriesBurned?: number;
  feeling?: WorkoutFeeling;
  archived?: boolean;
  archivedAt?: string;
}

export interface WorkoutSummary {
  id: string;
  title: string;
  date: string;
  duration: number;
  exerciseCount: number;
  caloriesBurned?: number;
  feeling?: WorkoutFeeling;
}

export interface WeeklyWorkoutStats {
  totalWorkouts: number;
  totalDuration: number; // minutes
  totalCalories: number;
  averageDuration: number;
}

export const FEELING_OPTIONS: { value: WorkoutFeeling; emoji: string; label: string }[] = [
  { value: 'great', emoji: '💪', label: 'Great' },
  { value: 'good', emoji: '😊', label: 'Good' },
  { value: 'tired', emoji: '😓', label: 'Tired' },
  { value: 'exhausted', emoji: '😵', label: 'Exhausted' },
];

export function getFeelingEmoji(feeling: WorkoutFeeling | undefined): string {
  switch (feeling) {
    case 'great':
      return '💪';
    case 'good':
      return '😊';
    case 'tired':
      return '😓';
    case 'exhausted':
      return '😵';
    default:
      return '🏋️';
  }
}
