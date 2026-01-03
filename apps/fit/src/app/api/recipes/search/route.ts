import { NextRequest, NextResponse } from 'next/server';

const SPOONACULAR_API_URL = 'https://api.spoonacular.com';

interface SpoonacularNutrient {
  name: string;
  amount: number;
  unit: string;
}

interface SpoonacularRecipe {
  id: number;
  title: string;
  image?: string;
  imageType?: string;
  servings?: number;
  readyInMinutes?: number;
  preparationMinutes?: number;
  cookingMinutes?: number;
  nutrition?: {
    nutrients?: SpoonacularNutrient[];
  };
  cuisines?: string[];
  dishTypes?: string[];
  diets?: string[];
  sourceUrl?: string;
}

interface SearchResponse {
  results: SpoonacularRecipe[];
  offset: number;
  number: number;
  totalResults: number;
}

function mapSpoonacularToRecipeResult(recipe: SpoonacularRecipe) {
  const nutrients = recipe.nutrition?.nutrients || [];

  const getNutrient = (name: string): number => {
    const nutrient = nutrients.find((n) => n.name.toLowerCase() === name.toLowerCase());
    return nutrient ? Math.round(nutrient.amount) : 0;
  };

  return {
    externalId: String(recipe.id),
    source: 'spoonacular' as const,
    name: recipe.title,
    image: recipe.image,
    servings: recipe.servings,
    prepTime: recipe.preparationMinutes,
    cookTime: recipe.cookingMinutes,
    totalTime: recipe.readyInMinutes,
    nutrition: nutrients.length > 0 ? {
      calories: getNutrient('Calories'),
      protein: getNutrient('Protein'),
      carbs: getNutrient('Carbohydrates'),
      fat: getNutrient('Fat'),
      fiber: getNutrient('Fiber'),
      sugar: getNutrient('Sugar'),
      sodium: getNutrient('Sodium'),
    } : undefined,
    tags: [...(recipe.cuisines || []), ...(recipe.dishTypes || [])],
    dietLabels: recipe.diets,
    sourceUrl: recipe.sourceUrl,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const cuisine = searchParams.get('cuisine');
  const diet = searchParams.get('diet');
  const type = searchParams.get('type'); // meal type
  const maxReadyTime = searchParams.get('maxReadyTime');
  const offset = searchParams.get('offset') || '0';
  const number = searchParams.get('number') || '12';

  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Spoonacular API key not configured' },
      { status: 500 }
    );
  }

  if (!query) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }

  try {
    const params = new URLSearchParams({
      apiKey,
      query,
      addRecipeNutrition: 'true',
      fillIngredients: 'false',
      offset,
      number,
    });

    if (cuisine) params.append('cuisine', cuisine);
    if (diet) params.append('diet', diet);
    if (type) params.append('type', type);
    if (maxReadyTime) params.append('maxReadyTime', maxReadyTime);

    const response = await fetch(
      `${SPOONACULAR_API_URL}/recipes/complexSearch?${params}`
    );

    if (!response.ok) {
      console.error('Spoonacular search failed:', response.statusText);
      return NextResponse.json(
        { error: 'Failed to search recipes' },
        { status: response.status }
      );
    }

    const data: SearchResponse = await response.json();

    return NextResponse.json({
      recipes: data.results.map(mapSpoonacularToRecipeResult),
      totalResults: data.totalResults,
      offset: data.offset,
      number: data.number,
    });
  } catch (error) {
    console.error('Spoonacular search error:', error);
    return NextResponse.json(
      { error: 'Failed to search recipes' },
      { status: 500 }
    );
  }
}
