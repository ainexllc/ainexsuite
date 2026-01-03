'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ChefHat,
  Heart,
  Bookmark,
  Plus,
  Filter,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import type { Recipe, RecipeSearchResult } from '@ainexsuite/types';
import { RecipeCard } from './RecipeCard';
import { RecipeDetailModal } from './RecipeDetailModal';
import { RecipeEditor } from './RecipeEditor';
import { Modal } from '@ainexsuite/ui';
import {
  searchRecipes,
  getSavedRecipes,
  getFavoriteRecipes,
  saveRecipe,
  toggleRecipeFavorite,
  markRecipeCooked,
  getRecipeDetails,
  CUISINE_OPTIONS,
  DIET_OPTIONS,
  MEAL_TYPE_OPTIONS,
} from '@/lib/recipe-service';

type TabType = 'search' | 'saved' | 'favorites';

export function RecipeDashboard() {
  const { user } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('search');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RecipeSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [cuisine, setCuisine] = useState('');
  const [diet, setDiet] = useState('');
  const [mealType, setMealType] = useState('');
  const [maxTime, setMaxTime] = useState('');

  // Saved recipes
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Saved recipe IDs for quick lookup
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Detail modal state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | RecipeSearchResult | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Custom recipe editor
  const [showEditor, setShowEditor] = useState(false);

  // Load saved recipes
  const loadSavedRecipes = useCallback(async () => {
    if (!user?.uid) return;

    setLoadingSaved(true);
    try {
      const [saved, favorites] = await Promise.all([
        getSavedRecipes(),
        getFavoriteRecipes(),
      ]);
      setSavedRecipes(saved);
      setFavoriteRecipes(favorites);

      // Build set of saved external IDs
      const ids = new Set<string>();
      saved.forEach((r) => {
        if (r.externalId) {
          ids.add(`${r.source}:${r.externalId}`);
        }
      });
      setSavedIds(ids);
    } catch (error) {
      console.error('Error loading saved recipes:', error);
    } finally {
      setLoadingSaved(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadSavedRecipes();
  }, [loadSavedRecipes]);

  // Search handler
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setHasSearched(true);
    try {
      const { recipes } = await searchRecipes(searchQuery, {
        cuisine: cuisine || undefined,
        diet: diet || undefined,
        type: mealType || undefined,
        maxReadyTime: maxTime ? parseInt(maxTime) : undefined,
        number: 24,
      });
      setSearchResults(recipes);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, cuisine, diet, mealType, maxTime]);

  // Check if recipe is saved
  const isRecipeSaved = useCallback(
    (recipe: RecipeSearchResult) => {
      return savedIds.has(`${recipe.source}:${recipe.externalId}`);
    },
    [savedIds]
  );

  // Save recipe handler
  const handleSaveRecipe = useCallback(
    async (recipe: RecipeSearchResult) => {
      if (!user?.uid) return;

      // Get full details first
      const details = await getRecipeDetails(recipe.externalId);
      if (!details) return;

      const saved = await saveRecipe(details);
      if (saved) {
        await loadSavedRecipes();
      }
    },
    [user?.uid, loadSavedRecipes]
  );

  // Toggle favorite handler
  const handleToggleFavorite = useCallback(
    async (recipeId: string) => {
      const success = await toggleRecipeFavorite(recipeId);
      if (success) {
        await loadSavedRecipes();
        // Update selected recipe if it's open
        if (selectedRecipe && 'id' in selectedRecipe && selectedRecipe.id === recipeId) {
          const updated = savedRecipes.find((r) => r.id === recipeId);
          if (updated) {
            setSelectedRecipe({ ...updated, isFavorite: !updated.isFavorite });
          }
        }
      }
    },
    [loadSavedRecipes, savedRecipes, selectedRecipe]
  );

  // Mark cooked handler
  const handleMarkCooked = useCallback(
    async (recipeId: string) => {
      await markRecipeCooked(recipeId);
      await loadSavedRecipes();
    },
    [loadSavedRecipes]
  );

  // View recipe detail
  const handleViewRecipe = (recipe: Recipe | RecipeSearchResult) => {
    setSelectedRecipe(recipe);
    setShowDetail(true);
  };

  // Clear filters
  const clearFilters = () => {
    setCuisine('');
    setDiet('');
    setMealType('');
    setMaxTime('');
  };

  const hasFilters = cuisine || diet || mealType || maxTime;

  // Get displayed recipes based on active tab
  const displayedRecipes =
    activeTab === 'search'
      ? searchResults
      : activeTab === 'saved'
      ? savedRecipes
      : favoriteRecipes;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Recipes</h2>
          <p className="text-sm text-muted-foreground">
            Discover and save recipes that fit your nutrition goals
          </p>
        </div>
        <button
          onClick={() => setShowEditor(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--app-primary))] text-white rounded-lg hover:opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Recipe
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-foreground/5 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'search'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Search className="w-4 h-4" />
          Search
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'saved'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Saved ({savedRecipes.length})
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'favorites'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Heart className="w-4 h-4" />
          Favorites ({favoriteRecipes.length})
        </button>
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <>
          {/* Search Input */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search recipes (e.g., chicken pasta, vegetarian stir fry)..."
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                  showFilters || hasFilters
                    ? 'border-[hsl(var(--app-primary))] bg-[hsl(var(--app-primary))]/10 text-[hsl(var(--app-primary))]'
                    : 'border-border text-muted-foreground hover:bg-foreground/5'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasFilters && (
                  <span className="w-2 h-2 rounded-full bg-[hsl(var(--app-primary))]" />
                )}
              </button>
              <button
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                className="px-6 py-2 bg-[hsl(var(--app-primary))] text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Search'
                )}
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="p-4 bg-foreground/5 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Filters</span>
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-[hsl(var(--app-primary))] hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Cuisine
                    </label>
                    <select
                      value={cuisine}
                      onChange={(e) => setCuisine(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                    >
                      <option value="">Any cuisine</option>
                      {CUISINE_OPTIONS.map((c) => (
                        <option key={c} value={c.toLowerCase()}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Diet
                    </label>
                    <select
                      value={diet}
                      onChange={(e) => setDiet(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                    >
                      <option value="">Any diet</option>
                      {DIET_OPTIONS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Meal Type
                    </label>
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                    >
                      <option value="">Any type</option>
                      {MEAL_TYPE_OPTIONS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Max Time (min)
                    </label>
                    <input
                      type="number"
                      value={maxTime}
                      onChange={(e) => setMaxTime(e.target.value)}
                      placeholder="e.g., 30"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Results */}
          {searching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[hsl(var(--app-primary))] animate-spin" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {searchResults.map((recipe) => (
                <RecipeCard
                  key={recipe.externalId}
                  recipe={recipe}
                  isSaved={isRecipeSaved(recipe)}
                  onView={() => handleViewRecipe(recipe)}
                  onSave={() => handleSaveRecipe(recipe)}
                />
              ))}
            </div>
          ) : hasSearched ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ChefHat className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No recipes found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-xl">
              <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Search for Recipes
              </h3>
              <p className="text-muted-foreground max-w-md">
                Enter a search term like &quot;healthy chicken&quot; or &quot;quick
                pasta&quot; to discover recipes with nutrition information
              </p>
            </div>
          )}
        </>
      )}

      {/* Saved/Favorites Tab */}
      {(activeTab === 'saved' || activeTab === 'favorites') && (
        <>
          {loadingSaved ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[hsl(var(--app-primary))] animate-spin" />
            </div>
          ) : displayedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(displayedRecipes as Recipe[]).map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isSaved={true}
                  onView={() => handleViewRecipe(recipe)}
                  onToggleFavorite={() => handleToggleFavorite(recipe.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-xl">
              {activeTab === 'favorites' ? (
                <>
                  <Heart className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Favorite Recipes
                  </h3>
                  <p className="text-muted-foreground">
                    Heart your favorite recipes to find them quickly here
                  </p>
                </>
              ) : (
                <>
                  <Bookmark className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Saved Recipes
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Search for recipes and save them to build your collection
                  </p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="px-4 py-2 bg-[hsl(var(--app-primary))] text-white rounded-lg hover:opacity-90 transition-colors"
                  >
                    Search Recipes
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        isOpen={showDetail}
        onClose={() => {
          setShowDetail(false);
          setSelectedRecipe(null);
        }}
        recipe={selectedRecipe}
        isSaved={
          selectedRecipe
            ? 'id' in selectedRecipe
              ? true
              : isRecipeSaved(selectedRecipe as RecipeSearchResult)
            : false
        }
        onSave={
          selectedRecipe && !('id' in selectedRecipe)
            ? () => handleSaveRecipe(selectedRecipe as RecipeSearchResult)
            : undefined
        }
        onToggleFavorite={
          selectedRecipe && 'id' in selectedRecipe
            ? () => handleToggleFavorite((selectedRecipe as Recipe).id)
            : undefined
        }
        onMarkCooked={
          selectedRecipe && 'id' in selectedRecipe
            ? () => handleMarkCooked((selectedRecipe as Recipe).id)
            : undefined
        }
      />

      {/* Recipe Editor Modal */}
      <Modal isOpen={showEditor} onClose={() => setShowEditor(false)} size="lg">
        <h2 className="text-xl font-bold text-foreground mb-4">Create Custom Recipe</h2>
        <RecipeEditor
          onSave={async (recipe) => {
            await saveRecipe(recipe);
            await loadSavedRecipes();
            setShowEditor(false);
            setActiveTab('saved');
          }}
          onCancel={() => setShowEditor(false)}
        />
      </Modal>
    </div>
  );
}
