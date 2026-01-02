/**
 * Food Database Service
 * USDA FoodData Central API integration for food search
 */

import type { FoodItem, NutritionInfo } from '@ainexsuite/types';

// USDA API constants
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// Nutrient IDs in USDA database
const NUTRIENT_IDS = {
  calories: 1008, // Energy (kcal)
  protein: 1003, // Protein
  carbs: 1005, // Carbohydrates
  fat: 1004, // Total fat
  fiber: 1079, // Fiber
  sugar: 2000, // Total sugars
  sodium: 1093, // Sodium
};

// ===== TYPES =====

interface USDAFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  brandName?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: USDANutrient[];
}

interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  value: number;
  unitName: string;
}

interface USDASearchResponse {
  foods: USDAFood[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

// ===== API FUNCTIONS =====

/**
 * Search for foods in USDA database
 */
export async function searchUSDAFoods(
  query: string,
  pageSize: number = 25,
  pageNumber: number = 1
): Promise<{ items: FoodItem[]; totalResults: number }> {
  // Use API route to protect API key
  try {
    const response = await fetch('/api/usda/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, pageSize, pageNumber }),
    });

    if (!response.ok) {
      console.error('USDA search failed:', response.statusText);
      return { items: [], totalResults: 0 };
    }

    const data = await response.json();
    return data;
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
    const response = await fetch(`/api/usda/food/${fdcId}`);

    if (!response.ok) {
      console.error('USDA food details failed:', response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('USDA food details error:', error);
    return null;
  }
}

// ===== SERVER-SIDE FUNCTIONS (for API routes) =====

/**
 * Direct USDA API search (use in API routes only)
 */
export async function searchUSDADirect(
  query: string,
  apiKey: string,
  pageSize: number = 25,
  pageNumber: number = 1
): Promise<{ items: FoodItem[]; totalResults: number }> {
  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      query,
      pageSize: String(pageSize),
      pageNumber: String(pageNumber),
      dataType: 'Foundation,SR Legacy,Branded',
    });

    const response = await fetch(`${USDA_BASE_URL}/foods/search?${params}`);

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }

    const data: USDASearchResponse = await response.json();

    const items = data.foods.map(mapUSDAToFoodItem);

    return {
      items,
      totalResults: data.totalHits,
    };
  } catch (error) {
    console.error('USDA direct search error:', error);
    return { items: [], totalResults: 0 };
  }
}

/**
 * Direct USDA API food details (use in API routes only)
 */
export async function getFoodDetailsDirect(
  fdcId: string,
  apiKey: string
): Promise<FoodItem | null> {
  try {
    const response = await fetch(
      `${USDA_BASE_URL}/food/${fdcId}?api_key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }

    const data: USDAFood = await response.json();
    return mapUSDAToFoodItem(data);
  } catch (error) {
    console.error('USDA direct details error:', error);
    return null;
  }
}

// ===== HELPERS =====

/**
 * Map USDA food data to our FoodItem type
 */
function mapUSDAToFoodItem(usdaFood: USDAFood): FoodItem {
  const nutrition = extractNutrition(usdaFood.foodNutrients);

  return {
    id: `usda-${usdaFood.fdcId}`,
    name: formatFoodName(usdaFood.description),
    brand: usdaFood.brandOwner || usdaFood.brandName,
    servingSize: usdaFood.servingSize || 100,
    servingUnit: usdaFood.servingSizeUnit || 'g',
    nutrition,
    fdcId: String(usdaFood.fdcId),
    isCustom: false,
  };
}

/**
 * Extract nutrition info from USDA nutrients array
 */
function extractNutrition(nutrients: USDANutrient[]): NutritionInfo {
  const getNutrient = (id: number): number => {
    const nutrient = nutrients.find((n) => n.nutrientId === id);
    return nutrient?.value ?? 0;
  };

  return {
    calories: Math.round(getNutrient(NUTRIENT_IDS.calories)),
    protein: Math.round(getNutrient(NUTRIENT_IDS.protein) * 10) / 10,
    carbs: Math.round(getNutrient(NUTRIENT_IDS.carbs) * 10) / 10,
    fat: Math.round(getNutrient(NUTRIENT_IDS.fat) * 10) / 10,
    fiber: Math.round(getNutrient(NUTRIENT_IDS.fiber) * 10) / 10,
    sugar: Math.round(getNutrient(NUTRIENT_IDS.sugar) * 10) / 10,
    sodium: Math.round(getNutrient(NUTRIENT_IDS.sodium)),
  };
}

/**
 * Clean up food name from USDA format
 */
function formatFoodName(name: string): string {
  // USDA names are often in ALL CAPS or have extra commas
  return name
    .toLowerCase()
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) =>
      part
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    )
    .join(', ');
}

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
