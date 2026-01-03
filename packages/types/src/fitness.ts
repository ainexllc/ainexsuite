import type { ExerciseCategory, Timestamp } from './common';
import type { NutritionInfo } from './nutrition';

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

// ============================================================================
// SUPPLEMENTS
// ============================================================================

/** Time of day for supplement intake */
export type SupplementTime = 'morning' | 'afternoon' | 'evening' | 'night' | 'with_food' | 'before_bed';

/** Supplement definition */
export interface Supplement {
  id: string;
  ownerId: string;
  spaceId?: string;
  name: string;
  brand?: string;
  dosage: string; // e.g., "500mg", "2 capsules"
  schedule: {
    times: SupplementTime[];
    frequency: 'daily' | 'weekly' | 'as_needed';
    daysOfWeek?: number[]; // 0-6, Sunday-Saturday (for weekly)
  };
  benefits?: string[];
  notes?: string;
  /** Current inventory count */
  inventory?: number;
  /** Alert when inventory drops below this */
  lowStockThreshold?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateSupplementInput = Omit<Supplement, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSupplementInput = Partial<Omit<Supplement, 'id' | 'ownerId' | 'createdAt'>>;

/** Log entry for supplement intake */
export interface SupplementLog {
  id: string;
  ownerId: string;
  spaceId?: string;
  supplementId: string;
  supplementName: string;
  date: string; // YYYY-MM-DD
  time: SupplementTime;
  status: 'taken' | 'skipped' | 'missed';
  takenAt?: string; // Actual time taken (ISO string)
  notes?: string;
  sideEffects?: string;
  createdAt: string;
}

export type CreateSupplementLogInput = Omit<SupplementLog, 'id' | 'createdAt'>;

// ============================================================================
// BODY METRICS (Shared between Fit and Health apps)
// ============================================================================

/** Body metric entry - shared collection between Fit and Health apps */
export interface BodyMetric {
  id: string;
  ownerId: string;
  spaceId?: string;
  date: string; // YYYY-MM-DD
  /** Body weight */
  weight?: number;
  /** Weight unit preference */
  weightUnit?: 'kg' | 'lbs';
  /** Water intake in glasses */
  water?: number;
  /** Body fat percentage */
  bodyFat?: number;
  /** Muscle mass in kg/lbs */
  muscleMass?: number;
  /** Waist circumference in cm/inches */
  waist?: number;
  /** Hip circumference in cm/inches */
  hips?: number;
  /** Chest circumference in cm/inches */
  chest?: number;
  /** Notes for the day */
  notes?: string;
  /** Source app that created this entry */
  source: 'fit' | 'health';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateBodyMetricInput = Omit<BodyMetric, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateBodyMetricInput = Partial<Omit<BodyMetric, 'id' | 'ownerId' | 'createdAt'>>;

// ============================================================================
// RECIPES
// ============================================================================

/** Recipe source */
export type RecipeSource = 'custom' | 'spoonacular' | 'edamam' | 'url';

// Re-export NutritionInfo from nutrition.ts for convenience
export type { NutritionInfo } from './nutrition';

/** Recipe ingredient */
export interface RecipeIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  /** Optional link to food database item */
  foodId?: string;
  /** Nutrition info for this ingredient */
  nutrition?: NutritionInfo;
  /** Notes like "diced", "minced" */
  preparation?: string;
}

/** Recipe */
export interface Recipe {
  id: string;
  ownerId: string;
  spaceId?: string;
  name: string;
  description?: string;
  source: RecipeSource;
  /** External ID if from API (e.g., Spoonacular recipe ID) */
  externalId?: string;
  /** Original URL if saved from web */
  sourceUrl?: string;
  servings: number;
  prepTime?: number; // minutes
  cookTime?: number; // minutes
  totalTime?: number; // minutes
  ingredients: RecipeIngredient[];
  instructions: string[];
  /** Nutrition per serving */
  nutrition?: NutritionInfo;
  /** Main image URL */
  image?: string;
  /** Additional images */
  images?: string[];
  /** Tags like "vegetarian", "quick", "meal-prep" */
  tags?: string[];
  /** Cuisine type like "Italian", "Mexican" */
  cuisine?: string;
  /** Meal type like "breakfast", "dinner", "snack" */
  mealType?: string;
  /** Diet labels like "gluten-free", "keto" */
  dietLabels?: string[];
  /** User rating 1-5 */
  rating?: number;
  /** Is this a favorite */
  isFavorite: boolean;
  /** Number of times this recipe was used */
  timesCooked?: number;
  /** Last time this recipe was cooked */
  lastCooked?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateRecipeInput = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateRecipeInput = Partial<Omit<Recipe, 'id' | 'ownerId' | 'createdAt'>>;

/** Recipe search result from external API */
export interface RecipeSearchResult {
  externalId: string;
  source: RecipeSource;
  name: string;
  image?: string;
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  nutrition?: NutritionInfo;
  tags?: string[];
  dietLabels?: string[];
  sourceUrl?: string;
}

// ============================================================================
// WATER TRACKING
// ============================================================================

/** Water intake entry */
export interface WaterIntake {
  id: string;
  ownerId: string;
  spaceId?: string;
  date: string; // YYYY-MM-DD
  /** Number of glasses/cups */
  glasses: number;
  /** Goal for the day */
  goal: number;
  /** Individual entries with timestamps */
  entries?: Array<{
    timestamp: Timestamp;
    amount: number; // glasses
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateWaterIntakeInput = Omit<WaterIntake, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateWaterIntakeInput = Partial<Omit<WaterIntake, 'id' | 'ownerId' | 'createdAt'>>;
