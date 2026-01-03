import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from '@ainexsuite/firebase';
import type {
  Recipe,
  CreateRecipeInput,
  UpdateRecipeInput,
  RecipeSearchResult,
} from '@ainexsuite/types';

const RECIPES_COLLECTION = 'recipes';

function getCurrentUserId(): string | null {
  return auth.currentUser?.uid || null;
}

function getNowISOString(): string {
  return new Date().toISOString();
}

// ============================================================================
// SAVED RECIPES (CRUD)
// ============================================================================

/**
 * Get all saved recipes for the current user
 */
export async function getSavedRecipes(): Promise<Recipe[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    const q = query(
      collection(db, RECIPES_COLLECTION),
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Recipe[];
  } catch (error) {
    console.error('Error fetching saved recipes:', error);
    return [];
  }
}

/**
 * Get favorite recipes for the current user
 */
export async function getFavoriteRecipes(): Promise<Recipe[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    const q = query(
      collection(db, RECIPES_COLLECTION),
      where('ownerId', '==', userId),
      where('isFavorite', '==', true),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Recipe[];
  } catch (error) {
    console.error('Error fetching favorite recipes:', error);
    return [];
  }
}

/**
 * Get a single recipe by ID
 */
export async function getRecipeById(recipeId: string): Promise<Recipe | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    const docRef = doc(db, RECIPES_COLLECTION, recipeId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    if (data.ownerId !== userId) return null;

    return { id: docSnap.id, ...data } as Recipe;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }
}

/**
 * Check if a recipe from external source is already saved
 */
export async function checkRecipeSaved(externalId: string, source: string): Promise<Recipe | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    const q = query(
      collection(db, RECIPES_COLLECTION),
      where('ownerId', '==', userId),
      where('externalId', '==', externalId),
      where('source', '==', source),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Recipe;
  } catch (error) {
    console.error('Error checking saved recipe:', error);
    return null;
  }
}

/**
 * Save a recipe (from search result or custom)
 */
export async function saveRecipe(
  data: Omit<CreateRecipeInput, 'ownerId'>
): Promise<Recipe | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    const now = getNowISOString();

    // Check if already saved (for external recipes)
    if (data.externalId && data.source !== 'custom') {
      const existing = await checkRecipeSaved(data.externalId, data.source);
      if (existing) {
        return existing;
      }
    }

    const recipeData = {
      ...data,
      ownerId: userId,
      isFavorite: data.isFavorite ?? false,
      timesCooked: 0,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, RECIPES_COLLECTION), recipeData);

    return { id: docRef.id, ...recipeData } as Recipe;
  } catch (error) {
    console.error('Error saving recipe:', error);
    return null;
  }
}

/**
 * Update a recipe
 */
export async function updateRecipe(
  recipeId: string,
  data: UpdateRecipeInput
): Promise<boolean> {
  const userId = getCurrentUserId();
  if (!userId) return false;

  try {
    const docRef = doc(db, RECIPES_COLLECTION, recipeId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return false;
    if (docSnap.data().ownerId !== userId) return false;

    await updateDoc(docRef, {
      ...data,
      updatedAt: getNowISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error updating recipe:', error);
    return false;
  }
}

/**
 * Toggle favorite status
 */
export async function toggleRecipeFavorite(recipeId: string): Promise<boolean> {
  const userId = getCurrentUserId();
  if (!userId) return false;

  try {
    const docRef = doc(db, RECIPES_COLLECTION, recipeId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return false;
    if (docSnap.data().ownerId !== userId) return false;

    const currentFavorite = docSnap.data().isFavorite || false;
    await updateDoc(docRef, {
      isFavorite: !currentFavorite,
      updatedAt: getNowISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return false;
  }
}

/**
 * Mark recipe as cooked (increment counter, update lastCooked)
 */
export async function markRecipeCooked(recipeId: string): Promise<boolean> {
  const userId = getCurrentUserId();
  if (!userId) return false;

  try {
    const docRef = doc(db, RECIPES_COLLECTION, recipeId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return false;
    if (docSnap.data().ownerId !== userId) return false;

    const currentCount = docSnap.data().timesCooked || 0;
    await updateDoc(docRef, {
      timesCooked: currentCount + 1,
      lastCooked: getNowISOString(),
      updatedAt: getNowISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error marking recipe cooked:', error);
    return false;
  }
}

/**
 * Delete a recipe
 */
export async function deleteRecipe(recipeId: string): Promise<boolean> {
  const userId = getCurrentUserId();
  if (!userId) return false;

  try {
    const docRef = doc(db, RECIPES_COLLECTION, recipeId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return false;
    if (docSnap.data().ownerId !== userId) return false;

    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return false;
  }
}

// ============================================================================
// SPOONACULAR API INTEGRATION
// ============================================================================

/**
 * Search recipes from Spoonacular API
 */
export async function searchRecipes(
  query: string,
  options: {
    cuisine?: string;
    diet?: string;
    type?: string;
    maxReadyTime?: number;
    offset?: number;
    number?: number;
  } = {}
): Promise<{ recipes: RecipeSearchResult[]; totalResults: number }> {
  try {
    const params = new URLSearchParams({ query });

    if (options.cuisine) params.append('cuisine', options.cuisine);
    if (options.diet) params.append('diet', options.diet);
    if (options.type) params.append('type', options.type);
    if (options.maxReadyTime) params.append('maxReadyTime', String(options.maxReadyTime));
    if (options.offset !== undefined) params.append('offset', String(options.offset));
    if (options.number !== undefined) params.append('number', String(options.number));

    const response = await fetch(`/api/recipes/search?${params}`);

    if (!response.ok) {
      console.error('Recipe search failed:', response.statusText);
      return { recipes: [], totalResults: 0 };
    }

    const data = await response.json();
    return {
      recipes: data.recipes || [],
      totalResults: data.totalResults || 0,
    };
  } catch (error) {
    console.error('Recipe search error:', error);
    return { recipes: [], totalResults: 0 };
  }
}

/**
 * Get recipe details from Spoonacular API
 */
export async function getRecipeDetails(
  externalId: string
): Promise<Omit<CreateRecipeInput, 'ownerId'> | null> {
  try {
    const response = await fetch(`/api/recipes/${externalId}`);

    if (!response.ok) {
      console.error('Recipe details fetch failed:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.recipe || null;
  } catch (error) {
    console.error('Recipe details error:', error);
    return null;
  }
}

// ============================================================================
// RECIPE CATEGORIES AND FILTERS
// ============================================================================

export const CUISINE_OPTIONS = [
  'African',
  'American',
  'British',
  'Cajun',
  'Caribbean',
  'Chinese',
  'Eastern European',
  'European',
  'French',
  'German',
  'Greek',
  'Indian',
  'Irish',
  'Italian',
  'Japanese',
  'Jewish',
  'Korean',
  'Latin American',
  'Mediterranean',
  'Mexican',
  'Middle Eastern',
  'Nordic',
  'Southern',
  'Spanish',
  'Thai',
  'Vietnamese',
];

export const DIET_OPTIONS = [
  { value: 'gluten free', label: 'Gluten Free' },
  { value: 'ketogenic', label: 'Keto' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'lacto-vegetarian', label: 'Lacto-Vegetarian' },
  { value: 'ovo-vegetarian', label: 'Ovo-Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescetarian', label: 'Pescetarian' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'primal', label: 'Primal' },
  { value: 'low fodmap', label: 'Low FODMAP' },
  { value: 'whole30', label: 'Whole30' },
];

export const MEAL_TYPE_OPTIONS = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'main course', label: 'Main Course' },
  { value: 'side dish', label: 'Side Dish' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'appetizer', label: 'Appetizer' },
  { value: 'salad', label: 'Salad' },
  { value: 'bread', label: 'Bread' },
  { value: 'soup', label: 'Soup' },
  { value: 'beverage', label: 'Beverage' },
  { value: 'sauce', label: 'Sauce' },
  { value: 'snack', label: 'Snack' },
];
