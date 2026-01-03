import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1';

interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName: string;
    nutrientNumber: string;
    unitName: string;
    value: number;
  }>;
}

interface SearchResult {
  foods: USDAFood[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

// Nutrient IDs for common macros
const NUTRIENT_IDS = {
  calories: 1008, // Energy (kcal)
  protein: 1003,
  fat: 1004,
  carbs: 1005,
  fiber: 1079,
  sugar: 2000,
  sodium: 1093,
};

function mapUSDAToFoodItem(food: USDAFood) {
  const nutrients = food.foodNutrients || [];

  const getNutrient = (nutrientId: number): number => {
    const nutrient = nutrients.find((n) => n.nutrientId === nutrientId);
    return nutrient?.value || 0;
  };

  return {
    id: `usda-${food.fdcId}`,
    fdcId: food.fdcId.toString(),
    name: food.description,
    servingSize: food.servingSize || 100,
    servingUnit: food.servingSizeUnit || 'g',
    brandOwner: food.brandOwner,
    nutrition: {
      calories: getNutrient(NUTRIENT_IDS.calories),
      protein: getNutrient(NUTRIENT_IDS.protein),
      carbs: getNutrient(NUTRIENT_IDS.carbs),
      fat: getNutrient(NUTRIENT_IDS.fat),
      fiber: getNutrient(NUTRIENT_IDS.fiber),
      sugar: getNutrient(NUTRIENT_IDS.sugar),
      sodium: getNutrient(NUTRIENT_IDS.sodium),
    },
    isCustom: false,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const fdcId = searchParams.get('fdcId');
    const pageSize = searchParams.get('pageSize') || '25';
    const pageNumber = searchParams.get('pageNumber') || '1';

    const apiKey = process.env.USDA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'USDA API key not configured' },
        { status: 500 }
      );
    }

    // Get specific food details
    if (fdcId) {
      const response = await fetch(
        `${USDA_API_URL}/food/${fdcId}?api_key=${apiKey}`,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('USDA API Error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch food details' },
          { status: response.status }
        );
      }

      const food: USDAFood = await response.json();
      return NextResponse.json({ food: mapUSDAToFoodItem(food) });
    }

    // Search foods
    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const response = await fetch(`${USDA_API_URL}/foods/search?api_key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        pageSize: parseInt(pageSize),
        pageNumber: parseInt(pageNumber),
        dataType: ['Survey (FNDDS)', 'Foundation', 'Branded'],
        sortBy: 'dataType.keyword',
        sortOrder: 'asc',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('USDA API Error:', error);
      return NextResponse.json(
        { error: 'Failed to search foods' },
        { status: response.status }
      );
    }

    const data: SearchResult = await response.json();

    return NextResponse.json({
      foods: data.foods.map(mapUSDAToFoodItem),
      totalHits: data.totalHits,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
    });
  } catch (error) {
    console.error('USDA API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
