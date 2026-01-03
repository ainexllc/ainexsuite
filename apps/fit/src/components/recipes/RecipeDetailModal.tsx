'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Users,
  Heart,
  Bookmark,
  BookmarkCheck,
  ChefHat,
  ExternalLink,
  Loader2,
  Check,
} from 'lucide-react';
import { Modal } from '@ainexsuite/ui';
import type { Recipe, RecipeSearchResult } from '@ainexsuite/types';
import { getRecipeDetails } from '@/lib/recipe-service';

interface RecipeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | RecipeSearchResult | null;
  isSaved: boolean;
  onSave?: () => Promise<void>;
  onToggleFavorite?: () => Promise<void>;
  onMarkCooked?: () => Promise<void>;
}

interface FullRecipeData {
  name: string;
  description?: string;
  image?: string;
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  ingredients: Array<{
    id: string;
    name: string;
    amount: number;
    unit: string;
    original?: string;
  }>;
  instructions: string[];
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  tags?: string[];
  dietLabels?: string[];
  sourceUrl?: string;
  sourceName?: string;
}

export function RecipeDetailModal({
  isOpen,
  onClose,
  recipe,
  isSaved,
  onSave,
  onToggleFavorite,
  onMarkCooked,
}: RecipeDetailModalProps) {
  const [fullRecipe, setFullRecipe] = useState<FullRecipeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [favoriting, setFavoriting] = useState(false);
  const [marking, setMarking] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  const isSavedRecipe = recipe && 'id' in recipe && recipe.source === 'custom';
  const isFavorite = isSavedRecipe && (recipe as Recipe).isFavorite;

  useEffect(() => {
    if (!isOpen || !recipe) {
      setFullRecipe(null);
      setCheckedSteps(new Set());
      return;
    }

    // If it's a saved recipe with full data, use it directly
    if ('instructions' in recipe && Array.isArray(recipe.instructions) && recipe.instructions.length > 0) {
      setFullRecipe({
        name: recipe.name,
        description: (recipe as Recipe).description,
        image: recipe.image,
        servings: recipe.servings,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        totalTime: (recipe as Recipe).totalTime,
        ingredients: (recipe as Recipe).ingredients || [],
        instructions: recipe.instructions,
        nutrition: recipe.nutrition,
        tags: recipe.tags,
        dietLabels: recipe.dietLabels,
        sourceUrl: recipe.sourceUrl,
      });
      return;
    }

    // Otherwise, fetch full details from API
    const externalId = 'externalId' in recipe ? recipe.externalId : null;
    if (!externalId) return;

    setLoading(true);
    getRecipeDetails(externalId)
      .then((details) => {
        if (details) {
          setFullRecipe({
            name: details.name,
            description: details.description,
            image: details.image,
            servings: details.servings,
            prepTime: details.prepTime,
            cookTime: details.cookTime,
            totalTime: details.totalTime,
            ingredients: details.ingredients,
            instructions: details.instructions,
            nutrition: details.nutrition,
            tags: details.tags,
            dietLabels: details.dietLabels,
            sourceUrl: details.sourceUrl,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [isOpen, recipe]);

  const handleSave = async () => {
    if (!onSave || saving) return;
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!onToggleFavorite || favoriting) return;
    setFavoriting(true);
    try {
      await onToggleFavorite();
    } finally {
      setFavoriting(false);
    }
  };

  const handleMarkCooked = async () => {
    if (!onMarkCooked || marking) return;
    setMarking(true);
    try {
      await onMarkCooked();
    } finally {
      setMarking(false);
    }
  };

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (!recipe) return null;

  const displayData = fullRecipe || {
    name: recipe.name,
    image: recipe.image,
    servings: recipe.servings,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    nutrition: recipe.nutrition,
    tags: recipe.tags,
    dietLabels: recipe.dietLabels,
    sourceUrl: recipe.sourceUrl,
    ingredients: [],
    instructions: [],
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="max-h-[85vh] overflow-y-auto -m-6 p-6">
        {/* Header Image */}
        {displayData.image ? (
          <div className="relative -mx-6 -mt-6 mb-6 aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayData.image}
              alt={displayData.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-foreground/10 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}

        {/* Title & Actions */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">{displayData.name}</h2>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            {!isSaved && onSave && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--app-primary))] text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
                Save Recipe
              </button>
            )}
            {isSaved && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg">
                <BookmarkCheck className="w-4 h-4" />
                Saved
              </div>
            )}
            {isSavedRecipe && onToggleFavorite && (
              <button
                onClick={handleToggleFavorite}
                disabled={favoriting}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                  isFavorite
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'border border-border text-muted-foreground hover:bg-foreground/5'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Favorited' : 'Favorite'}
              </button>
            )}
            {isSavedRecipe && onMarkCooked && (
              <button
                onClick={handleMarkCooked}
                disabled={marking}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-foreground/5 transition-colors disabled:opacity-50"
              >
                <ChefHat className="w-4 h-4" />
                Mark Cooked
              </button>
            )}
            {displayData.sourceUrl && (
              <a
                href={displayData.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-foreground/5 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Source
              </a>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {displayData.prepTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Prep: {displayData.prepTime} min</span>
              </div>
            )}
            {displayData.cookTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Cook: {displayData.cookTime} min</span>
              </div>
            )}
            {displayData.totalTime && !displayData.prepTime && !displayData.cookTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{displayData.totalTime} min total</span>
              </div>
            )}
            {displayData.servings && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{displayData.servings} servings</span>
              </div>
            )}
          </div>
        </div>

        {/* Diet Labels & Tags */}
        {(displayData.dietLabels?.length || displayData.tags?.length) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {displayData.dietLabels?.map((label) => (
              <span
                key={label}
                className="px-2 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full"
              >
                {label}
              </span>
            ))}
            {displayData.tags?.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs font-medium bg-foreground/10 text-muted-foreground rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Nutrition */}
        {displayData.nutrition && (
          <div className="p-4 bg-foreground/5 rounded-xl mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3">Per Serving</h4>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round(displayData.nutrition.calories)}
                </div>
                <div className="text-xs text-muted-foreground">Calories</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(displayData.nutrition.protein)}g
                </div>
                <div className="text-xs text-muted-foreground">Protein</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {Math.round(displayData.nutrition.carbs)}g
                </div>
                <div className="text-xs text-muted-foreground">Carbs</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(displayData.nutrition.fat)}g
                </div>
                <div className="text-xs text-muted-foreground">Fat</div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[hsl(var(--app-primary))] animate-spin" />
          </div>
        ) : (
          <>
            {/* Description */}
            {displayData.description && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-foreground mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{displayData.description}</p>
              </div>
            )}

            {/* Ingredients */}
            {displayData.ingredients.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-foreground mb-3">
                  Ingredients ({displayData.ingredients.length})
                </h4>
                <ul className="space-y-2">
                  {displayData.ingredients.map((ing, index) => (
                    <li
                      key={ing.id || index}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[hsl(var(--app-primary))] flex-shrink-0" />
                      <span className="text-foreground">
                        {ing.original || `${ing.amount} ${ing.unit} ${ing.name}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructions */}
            {displayData.instructions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">
                  Instructions ({displayData.instructions.length} steps)
                </h4>
                <ol className="space-y-4">
                  {displayData.instructions.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <button
                        onClick={() => toggleStep(index)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                          checkedSteps.has(index)
                            ? 'bg-emerald-500 text-white'
                            : 'bg-foreground/10 text-muted-foreground hover:bg-foreground/20'
                        }`}
                      >
                        {checkedSteps.has(index) ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          index + 1
                        )}
                      </button>
                      <p
                        className={`text-sm pt-0.5 transition-opacity ${
                          checkedSteps.has(index)
                            ? 'text-muted-foreground line-through opacity-60'
                            : 'text-foreground'
                        }`}
                      >
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
