/**
 * Nutrition Tracking Types
 * For Health app meal and nutrition management
 */

// ===== MEAL TYPES =====

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';

export interface NutritionInfo {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // mg
  cholesterol?: number; // mg
  saturatedFat?: number; // grams
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string; // 'g', 'oz', 'cup', 'piece', etc.
  nutrition: NutritionInfo;
  // For food database items
  fdcId?: string; // USDA FoodData Central ID
  barcode?: string;
  isCustom: boolean;
}

export interface MealFoodEntry {
  food: FoodItem;
  quantity: number; // multiplier of serving size
  notes?: string;
}

export interface Meal {
  id: string;
  ownerId: string;
  date: string; // YYYY-MM-DD
  type: MealType;
  time: string; // HH:mm
  foods: MealFoodEntry[];
  totalNutrition: NutritionInfo;
  notes?: string;
  photo?: string; // Storage URL for meal photo
  createdAt: string;
  updatedAt: string;
}

export type CreateMealInput = Omit<Meal, 'id' | 'createdAt' | 'updatedAt' | 'totalNutrition'>;
export type UpdateMealInput = Partial<Omit<Meal, 'id' | 'ownerId' | 'createdAt'>>;

// ===== NUTRITION GOALS =====

export interface NutritionGoals {
  id: string;
  ownerId: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
  updatedAt: string;
}

export type CreateNutritionGoalsInput = Omit<NutritionGoals, 'id' | 'updatedAt'>;

// ===== DAILY NUTRITION SUMMARY =====

export interface NutritionGoalProgress {
  calories: number; // 0-1 percentage
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyNutritionSummary {
  date: string;
  meals: Meal[];
  totals: NutritionInfo;
  goals?: NutritionGoals;
  goalProgress: NutritionGoalProgress;
  mealCount: number;
}

// ===== CUSTOM FOODS =====

export interface CustomFood extends FoodItem {
  ownerId: string;
  usageCount: number; // For "recently used" sorting
  createdAt: string;
  updatedAt: string;
}

export type CreateCustomFoodInput = Omit<CustomFood, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>;

// ===== FOOD SEARCH =====

export interface FoodSearchResult {
  items: FoodItem[];
  source: 'usda' | 'custom' | 'recent';
  totalResults: number;
  page: number;
  pageSize: number;
}

// ===== WEEKLY/MONTHLY STATS =====

export interface NutritionPeriodStats {
  period: 'week' | 'month';
  startDate: string;
  endDate: string;
  averages: NutritionInfo;
  totals: NutritionInfo;
  daysLogged: number;
  totalMeals: number;
  goalAchievementRate: number; // percentage of days meeting calorie goal
}
