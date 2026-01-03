'use client';

import { useState } from 'react';
import { Clock, Users, Heart, Bookmark, BookmarkCheck, ChefHat } from 'lucide-react';
import type { Recipe, RecipeSearchResult } from '@ainexsuite/types';

interface RecipeCardProps {
  recipe: Recipe | RecipeSearchResult;
  isSaved?: boolean;
  onView: () => void;
  onSave?: () => Promise<void>;
  onToggleFavorite?: () => Promise<void>;
}

export function RecipeCard({
  recipe,
  isSaved = false,
  onView,
  onSave,
  onToggleFavorite,
}: RecipeCardProps) {
  const [saving, setSaving] = useState(false);
  const [favoriting, setFavoriting] = useState(false);

  const isSavedRecipe = 'id' in recipe && !('externalId' in recipe && !recipe.id.startsWith('recipe_'));
  const isFavorite = isSavedRecipe && (recipe as Recipe).isFavorite;

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSave || saving) return;

    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onToggleFavorite || favoriting) return;

    setFavoriting(true);
    try {
      await onToggleFavorite();
    } finally {
      setFavoriting(false);
    }
  };

  const nutrition = recipe.nutrition;
  const prepTime = recipe.prepTime || (recipe as Recipe).totalTime;
  const servings = recipe.servings;

  return (
    <button
      onClick={onView}
      className="group w-full text-left bg-background/60 border border-border rounded-xl overflow-hidden hover:border-[hsl(var(--app-primary))]/50 hover:shadow-lg transition-all"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {recipe.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-foreground/5">
            <ChefHat className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-1">
          {isSavedRecipe && onToggleFavorite && (
            <button
              onClick={handleToggleFavorite}
              disabled={favoriting}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-black/50 text-white hover:bg-black/70'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
          {!isSaved && onSave && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-2 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors disabled:opacity-50"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          )}
          {isSaved && !isSavedRecipe && (
            <div className="p-2 rounded-full bg-[hsl(var(--app-primary))] text-white">
              <BookmarkCheck className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Diet Labels */}
        {recipe.dietLabels && recipe.dietLabels.length > 0 && (
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            {recipe.dietLabels.slice(0, 2).map((label) => (
              <span
                key={label}
                className="px-2 py-0.5 text-xs font-medium bg-white/90 text-gray-800 rounded-full"
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-[hsl(var(--app-primary))] transition-colors">
          {recipe.name}
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          {prepTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{prepTime} min</span>
            </div>
          )}
          {servings && (
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{servings}</span>
            </div>
          )}
        </div>

        {/* Nutrition */}
        {nutrition && (
          <div className="flex gap-3 text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {Math.round(nutrition.calories)} cal
            </span>
            <span className="text-blue-600 dark:text-blue-400">
              P: {Math.round(nutrition.protein)}g
            </span>
            <span className="text-amber-600 dark:text-amber-400">
              C: {Math.round(nutrition.carbs)}g
            </span>
            <span className="text-purple-600 dark:text-purple-400">
              F: {Math.round(nutrition.fat)}g
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
