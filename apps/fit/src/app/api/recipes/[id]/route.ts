import { NextRequest, NextResponse } from 'next/server';

const SPOONACULAR_API_URL = 'https://api.spoonacular.com';

interface SpoonacularIngredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  original: string;
}

interface SpoonacularStep {
  number: number;
  step: string;
}

interface SpoonacularInstruction {
  name: string;
  steps: SpoonacularStep[];
}

interface SpoonacularNutrient {
  name: string;
  amount: number;
  unit: string;
}

interface SpoonacularRecipeDetail {
  id: number;
  title: string;
  image?: string;
  servings: number;
  readyInMinutes?: number;
  preparationMinutes?: number;
  cookingMinutes?: number;
  summary?: string;
  sourceUrl?: string;
  sourceName?: string;
  extendedIngredients?: SpoonacularIngredient[];
  analyzedInstructions?: SpoonacularInstruction[];
  nutrition?: {
    nutrients?: SpoonacularNutrient[];
  };
  cuisines?: string[];
  dishTypes?: string[];
  diets?: string[];
}

function mapSpoonacularToRecipeDetail(recipe: SpoonacularRecipeDetail) {
  const nutrients = recipe.nutrition?.nutrients || [];

  const getNutrient = (name: string): number => {
    const nutrient = nutrients.find((n) => n.name.toLowerCase() === name.toLowerCase());
    return nutrient ? Math.round(nutrient.amount) : 0;
  };

  // Extract instructions from analyzed instructions
  const instructions: string[] = [];
  if (recipe.analyzedInstructions?.length) {
    for (const instructionSet of recipe.analyzedInstructions) {
      for (const step of instructionSet.steps) {
        instructions.push(step.step);
      }
    }
  }

  // Map ingredients
  const ingredients = (recipe.extendedIngredients || []).map((ing) => ({
    id: String(ing.id),
    name: ing.name,
    amount: ing.amount,
    unit: ing.unit,
    original: ing.original,
  }));

  return {
    externalId: String(recipe.id),
    source: 'spoonacular' as const,
    name: recipe.title,
    description: recipe.summary
      ? recipe.summary.replace(/<[^>]*>/g, '').slice(0, 500)
      : undefined,
    image: recipe.image,
    servings: recipe.servings,
    prepTime: recipe.preparationMinutes,
    cookTime: recipe.cookingMinutes,
    totalTime: recipe.readyInMinutes,
    ingredients,
    instructions,
    nutrition: nutrients.length > 0 ? {
      calories: getNutrient('Calories'),
      protein: getNutrient('Protein'),
      carbs: getNutrient('Carbohydrates'),
      fat: getNutrient('Fat'),
      fiber: getNutrient('Fiber'),
      sugar: getNutrient('Sugar'),
      sodium: getNutrient('Sodium'),
      cholesterol: getNutrient('Cholesterol'),
      saturatedFat: getNutrient('Saturated Fat'),
    } : undefined,
    tags: [...(recipe.cuisines || []), ...(recipe.dishTypes || [])],
    dietLabels: recipe.diets,
    sourceUrl: recipe.sourceUrl,
    sourceName: recipe.sourceName,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Spoonacular API key not configured' },
      { status: 500 }
    );
  }

  try {
    const urlParams = new URLSearchParams({
      apiKey,
      includeNutrition: 'true',
    });

    const response = await fetch(
      `${SPOONACULAR_API_URL}/recipes/${id}/information?${urlParams}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Recipe not found' },
          { status: 404 }
        );
      }
      console.error('Spoonacular recipe fetch failed:', response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch recipe' },
        { status: response.status }
      );
    }

    const data: SpoonacularRecipeDetail = await response.json();

    return NextResponse.json({
      recipe: mapSpoonacularToRecipeDetail(data),
    });
  } catch (error) {
    console.error('Spoonacular recipe fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}
