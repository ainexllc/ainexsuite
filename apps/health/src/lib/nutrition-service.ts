/**
 * Nutrition Service
 * CRUD operations for meals, foods, and nutrition tracking
 */

import { db, auth } from '@ainexsuite/firebase';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import type {
  Meal,
  CreateMealInput,
  UpdateMealInput,
  CustomFood,
  CreateCustomFoodInput,
  NutritionGoals,
  CreateNutritionGoalsInput,
  DailyNutritionSummary,
  NutritionInfo,
  FoodItem,
  MealFoodEntry,
} from '@ainexsuite/types';
import { sumNutrition, calculateNutritionForQuantity, searchUSDAFoods, COMMON_FOODS } from './food-database';

// Collections
const MEALS_COLLECTION = 'meals';
const CUSTOM_FOODS_COLLECTION = 'custom_foods';
const NUTRITION_GOALS_COLLECTION = 'nutrition_goals';

// ===== HELPERS =====

function getCurrentUserId(): string | null {
  return auth.currentUser?.uid ?? null;
}

function getNowISOString(): string {
  return new Date().toISOString();
}

/**
 * Calculate total nutrition for a meal
 */
function calculateMealNutrition(foods: MealFoodEntry[]): NutritionInfo {
  const nutritionItems = foods.map((entry) =>
    calculateNutritionForQuantity(
      entry.food.nutrition,
      entry.food.servingSize,
      entry.food.servingSize * entry.quantity
    )
  );
  return sumNutrition(nutritionItems);
}

// ===== MEAL CRUD =====

/**
 * Get all meals for a specific date
 */
export async function getMealsForDate(date: string): Promise<Meal[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    const mealsRef = collection(db, MEALS_COLLECTION);
    const q = query(
      mealsRef,
      where('ownerId', '==', userId),
      where('date', '==', date),
      orderBy('time', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Meal[];
  } catch (error) {
    console.error('Failed to fetch meals:', error);
    return [];
  }
}

/**
 * Get meals for a date range
 */
export async function getMealsForDateRange(
  startDate: string,
  endDate: string
): Promise<Meal[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    const mealsRef = collection(db, MEALS_COLLECTION);
    const q = query(
      mealsRef,
      where('ownerId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc'),
      orderBy('time', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Meal[];
  } catch (error) {
    console.error('Failed to fetch meals for range:', error);
    return [];
  }
}

/**
 * Get a single meal by ID
 */
export async function getMealById(id: string): Promise<Meal | null> {
  try {
    const docRef = doc(db, MEALS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Meal;
  } catch (error) {
    console.error('Failed to fetch meal:', error);
    return null;
  }
}

/**
 * Create a new meal
 */
export async function createMeal(
  data: Omit<CreateMealInput, 'ownerId'>
): Promise<Meal | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    const now = getNowISOString();
    const totalNutrition = calculateMealNutrition(data.foods);

    const mealData = {
      ...data,
      ownerId: userId,
      totalNutrition,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, MEALS_COLLECTION), mealData);

    // Update usage count for custom foods
    for (const entry of data.foods) {
      if (entry.food.isCustom) {
        await incrementFoodUsage(entry.food.id);
      }
    }

    return { id: docRef.id, ...mealData } as Meal;
  } catch (error) {
    console.error('Failed to create meal:', error);
    return null;
  }
}

/**
 * Update an existing meal
 */
export async function updateMeal(
  id: string,
  data: UpdateMealInput
): Promise<boolean> {
  try {
    const docRef = doc(db, MEALS_COLLECTION, id);

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: getNowISOString(),
    };

    // Recalculate nutrition if foods changed
    if (data.foods) {
      updateData.totalNutrition = calculateMealNutrition(data.foods);
    }

    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    console.error('Failed to update meal:', error);
    return false;
  }
}

/**
 * Delete a meal
 */
export async function deleteMeal(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, MEALS_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Failed to delete meal:', error);
    return false;
  }
}

// ===== DAILY SUMMARY =====

/**
 * Get daily nutrition summary
 */
export async function getDailyNutritionSummary(
  date: string
): Promise<DailyNutritionSummary> {
  const meals = await getMealsForDate(date);
  const goals = await getNutritionGoals();

  const totals = sumNutrition(meals.map((m) => m.totalNutrition));

  const goalProgress = goals
    ? {
        calories: Math.min(totals.calories / goals.calories, 1),
        protein: Math.min(totals.protein / goals.protein, 1),
        carbs: Math.min(totals.carbs / goals.carbs, 1),
        fat: Math.min(totals.fat / goals.fat, 1),
      }
    : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  return {
    date,
    meals,
    totals,
    goals: goals ?? undefined,
    goalProgress,
    mealCount: meals.length,
  };
}

// ===== CUSTOM FOODS =====

/**
 * Get user's custom foods
 */
export async function getCustomFoods(): Promise<CustomFood[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    const foodsRef = collection(db, CUSTOM_FOODS_COLLECTION);
    const q = query(
      foodsRef,
      where('ownerId', '==', userId),
      orderBy('usageCount', 'desc'),
      limit(100)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CustomFood[];
  } catch (error) {
    console.error('Failed to fetch custom foods:', error);
    return [];
  }
}

/**
 * Create a custom food
 */
export async function createCustomFood(
  data: Omit<CreateCustomFoodInput, 'ownerId'>
): Promise<CustomFood | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    const now = getNowISOString();
    const foodData = {
      ...data,
      ownerId: userId,
      usageCount: 0,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, CUSTOM_FOODS_COLLECTION), foodData);
    return { id: docRef.id, ...foodData } as CustomFood;
  } catch (error) {
    console.error('Failed to create custom food:', error);
    return null;
  }
}

/**
 * Update a custom food
 */
export async function updateCustomFood(
  id: string,
  data: Partial<CustomFood>
): Promise<boolean> {
  try {
    const docRef = doc(db, CUSTOM_FOODS_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: getNowISOString(),
    });
    return true;
  } catch (error) {
    console.error('Failed to update custom food:', error);
    return false;
  }
}

/**
 * Delete a custom food
 */
export async function deleteCustomFood(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, CUSTOM_FOODS_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Failed to delete custom food:', error);
    return false;
  }
}

/**
 * Increment usage count for a custom food
 */
async function incrementFoodUsage(foodId: string): Promise<void> {
  try {
    const docRef = doc(db, CUSTOM_FOODS_COLLECTION, foodId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentCount = docSnap.data().usageCount || 0;
      await updateDoc(docRef, { usageCount: currentCount + 1 });
    }
  } catch (error) {
    console.error('Failed to increment food usage:', error);
  }
}

// ===== FOOD SEARCH =====

/**
 * Search for foods (custom + USDA + common)
 */
export async function searchFoods(
  query: string
): Promise<{ items: FoodItem[]; source: string }[]> {
  const results: { items: FoodItem[]; source: string }[] = [];
  const queryLower = query.toLowerCase();

  // Search custom foods first
  const customFoods = await getCustomFoods();
  const matchingCustom = customFoods.filter(
    (f) =>
      f.name.toLowerCase().includes(queryLower) ||
      f.brand?.toLowerCase().includes(queryLower)
  );

  if (matchingCustom.length > 0) {
    results.push({ items: matchingCustom, source: 'custom' });
  }

  // Search common foods
  const matchingCommon = COMMON_FOODS.filter((f) =>
    f.name.toLowerCase().includes(queryLower)
  );

  if (matchingCommon.length > 0) {
    results.push({ items: matchingCommon, source: 'common' });
  }

  // Search USDA
  try {
    const usdaResults = await searchUSDAFoods(query, 20);
    if (usdaResults.items.length > 0) {
      results.push({ items: usdaResults.items, source: 'usda' });
    }
  } catch (error) {
    console.error('USDA search failed:', error);
  }

  return results;
}

/**
 * Get recent/frequently used foods
 */
export async function getRecentFoods(): Promise<FoodItem[]> {
  const customFoods = await getCustomFoods();

  // Get top 10 by usage
  const topCustom = customFoods.slice(0, 10);

  // Also include some common foods
  const topCommon = COMMON_FOODS.slice(0, 5);

  return [...topCustom, ...topCommon];
}

// ===== NUTRITION GOALS =====

/**
 * Get user's nutrition goals
 */
export async function getNutritionGoals(): Promise<NutritionGoals | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    const goalsRef = collection(db, NUTRITION_GOALS_COLLECTION);
    const q = query(goalsRef, where('ownerId', '==', userId), limit(1));

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as NutritionGoals;
  } catch (error) {
    console.error('Failed to fetch nutrition goals:', error);
    return null;
  }
}

/**
 * Create or update nutrition goals
 */
export async function setNutritionGoals(
  data: Omit<CreateNutritionGoalsInput, 'ownerId'>
): Promise<NutritionGoals | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    const existing = await getNutritionGoals();

    if (existing) {
      // Update existing
      const docRef = doc(db, NUTRITION_GOALS_COLLECTION, existing.id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: getNowISOString(),
      });
      return { ...existing, ...data, updatedAt: getNowISOString() };
    } else {
      // Create new
      const goalsData = {
        ...data,
        ownerId: userId,
        updatedAt: getNowISOString(),
      };

      const docRef = await addDoc(collection(db, NUTRITION_GOALS_COLLECTION), goalsData);
      return { id: docRef.id, ...goalsData } as NutritionGoals;
    }
  } catch (error) {
    console.error('Failed to set nutrition goals:', error);
    return null;
  }
}

// ===== DEFAULT GOALS =====

export const DEFAULT_NUTRITION_GOALS: Omit<NutritionGoals, 'id' | 'ownerId' | 'updatedAt'> = {
  calories: 2000,
  protein: 50,
  carbs: 250,
  fat: 65,
  fiber: 25,
};
