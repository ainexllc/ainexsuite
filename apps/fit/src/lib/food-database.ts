/**
 * Food Database Service
 * USDA FoodData Central API integration for food search
 */

import type { FoodItem, NutritionInfo } from '@ainexsuite/types';

// ===== API FUNCTIONS =====

/**
 * Search for foods in USDA database
 */
export async function searchUSDAFoods(
  query: string,
  pageSize: number = 25,
  pageNumber: number = 1
): Promise<{ items: FoodItem[]; totalResults: number }> {
  try {
    const params = new URLSearchParams({
      query,
      pageSize: String(pageSize),
      pageNumber: String(pageNumber),
    });

    const response = await fetch(`/api/usda?${params}`);

    if (!response.ok) {
      console.error('USDA search failed:', response.statusText);
      return { items: [], totalResults: 0 };
    }

    const data = await response.json();
    return {
      items: data.foods || [],
      totalResults: data.totalHits || 0,
    };
  } catch (error) {
    console.error('USDA search error:', error);
    return { items: [], totalResults: 0 };
  }
}

/**
 * Get detailed food info by FDC ID
 */
export async function getFoodDetails(fdcId: string): Promise<FoodItem | null> {
  try {
    const params = new URLSearchParams({ fdcId });
    const response = await fetch(`/api/usda?${params}`);

    if (!response.ok) {
      console.error('USDA food details failed:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.food || null;
  } catch (error) {
    console.error('USDA food details error:', error);
    return null;
  }
}

// ===== HELPERS =====

/**
 * Calculate nutrition for a given quantity
 */
export function calculateNutritionForQuantity(
  baseNutrition: NutritionInfo,
  baseServingSize: number,
  quantity: number
): NutritionInfo {
  const multiplier = quantity / baseServingSize;

  return {
    calories: Math.round(baseNutrition.calories * multiplier),
    protein: Math.round(baseNutrition.protein * multiplier * 10) / 10,
    carbs: Math.round(baseNutrition.carbs * multiplier * 10) / 10,
    fat: Math.round(baseNutrition.fat * multiplier * 10) / 10,
    fiber: baseNutrition.fiber
      ? Math.round(baseNutrition.fiber * multiplier * 10) / 10
      : undefined,
    sugar: baseNutrition.sugar
      ? Math.round(baseNutrition.sugar * multiplier * 10) / 10
      : undefined,
    sodium: baseNutrition.sodium
      ? Math.round(baseNutrition.sodium * multiplier)
      : undefined,
  };
}

/**
 * Sum nutrition info from multiple items
 */
export function sumNutrition(items: NutritionInfo[]): NutritionInfo {
  return items.reduce(
    (total, item) => ({
      calories: total.calories + item.calories,
      protein: Math.round((total.protein + item.protein) * 10) / 10,
      carbs: Math.round((total.carbs + item.carbs) * 10) / 10,
      fat: Math.round((total.fat + item.fat) * 10) / 10,
      fiber:
        total.fiber !== undefined || item.fiber !== undefined
          ? Math.round(((total.fiber ?? 0) + (item.fiber ?? 0)) * 10) / 10
          : undefined,
      sugar:
        total.sugar !== undefined || item.sugar !== undefined
          ? Math.round(((total.sugar ?? 0) + (item.sugar ?? 0)) * 10) / 10
          : undefined,
      sodium:
        total.sodium !== undefined || item.sodium !== undefined
          ? Math.round((total.sodium ?? 0) + (item.sodium ?? 0))
          : undefined,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 } as NutritionInfo
  );
}

// ===== COMMON FOODS (fallback) =====

export const COMMON_FOODS: FoodItem[] = [
  {
    id: 'common-apple',
    name: 'Apple, medium',
    servingSize: 182,
    servingUnit: 'g',
    nutrition: { calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, sugar: 19 },
    isCustom: false,
  },
  {
    id: 'common-banana',
    name: 'Banana, medium',
    servingSize: 118,
    servingUnit: 'g',
    nutrition: { calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, sugar: 14 },
    isCustom: false,
  },
  {
    id: 'common-chicken-breast',
    name: 'Chicken breast, grilled',
    servingSize: 100,
    servingUnit: 'g',
    nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
    isCustom: false,
  },
  {
    id: 'common-rice',
    name: 'White rice, cooked',
    servingSize: 158,
    servingUnit: 'g',
    nutrition: { calories: 206, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6 },
    isCustom: false,
  },
  {
    id: 'common-egg',
    name: 'Egg, large',
    servingSize: 50,
    servingUnit: 'g',
    nutrition: { calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, fiber: 0 },
    isCustom: false,
  },
  {
    id: 'common-milk',
    name: 'Milk, whole',
    servingSize: 244,
    servingUnit: 'ml',
    nutrition: { calories: 149, protein: 8, carbs: 12, fat: 8, sugar: 12 },
    isCustom: false,
  },
  {
    id: 'common-bread',
    name: 'Bread, whole wheat',
    servingSize: 28,
    servingUnit: 'g',
    nutrition: { calories: 69, protein: 3.6, carbs: 12, fat: 1.1, fiber: 1.9 },
    isCustom: false,
  },
  {
    id: 'common-salmon',
    name: 'Salmon, baked',
    servingSize: 100,
    servingUnit: 'g',
    nutrition: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
    isCustom: false,
  },
];
