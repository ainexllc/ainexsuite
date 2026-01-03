'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Loader2, Database } from 'lucide-react';
import type { FoodItem } from '@ainexsuite/types';
import { searchFoods, getRecentFoods } from '@/lib/nutrition-service';
import { useAuth } from '@ainexsuite/auth';

interface FoodSearchProps {
  onSelect: (food: FoodItem, quantity: number) => void;
  onCreateCustom?: () => void;
}

export function FoodSearch({ onSelect, onCreateCustom }: FoodSearchProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Load recent foods on mount
  useEffect(() => {
    if (user?.uid) {
      getRecentFoods().then(setRecentFoods);
    }
  }, [user?.uid]);

  // Debounced search
  const search = useCallback(async (searchQuery: string) => {
    if (!user?.uid || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await searchFoods(searchQuery);
      // Flatten results from different sources into single array
      const allFoods = searchResults.flatMap((r) => r.items);
      setResults(allFoods);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setQuantity(1);
  };

  const handleAdd = () => {
    if (selectedFood) {
      onSelect(selectedFood, quantity);
      setSelectedFood(null);
      setQuantity(1);
      setQuery('');
      setResults([]);
    }
  };

  const displayFoods = query.length >= 2 ? results : recentFoods;

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods (USDA database)..."
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Selected Food Quantity */}
      {selectedFood && (
        <div className="p-3 bg-[hsl(var(--app-primary))]/10 border border-[hsl(var(--app-primary))]/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-foreground">{selectedFood.name}</span>
            <button
              onClick={() => setSelectedFood(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0.25"
              max="10"
              step="0.25"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
              className="w-20 px-2 py-1 border border-border rounded text-center bg-background"
            />
            <span className="text-sm text-muted-foreground">
              × {selectedFood.servingSize} {selectedFood.servingUnit}
            </span>
            <span className="text-sm text-muted-foreground">
              = {Math.round(selectedFood.nutrition.calories * quantity)} kcal
            </span>
            <button
              onClick={handleAdd}
              className="ml-auto flex items-center gap-1 px-3 py-1 bg-[hsl(var(--app-primary))] text-white rounded-lg hover:opacity-90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="max-h-64 overflow-y-auto space-y-1">
        {query.length < 2 && recentFoods.length > 0 && (
          <p className="text-xs text-muted-foreground mb-2">Recent foods</p>
        )}

        {displayFoods.map((food) => (
          <button
            key={food.id}
            onClick={() => handleSelect(food)}
            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
              selectedFood?.id === food.id
                ? 'bg-[hsl(var(--app-primary))]/10 border border-[hsl(var(--app-primary))]/30'
                : 'hover:bg-foreground/5'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{food.name}</span>
                {food.isCustom && (
                  <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded">
                    Custom
                  </span>
                )}
                {food.fdcId && (
                  <span title="USDA Database">
                    <Database className="w-3 h-3 text-muted-foreground" />
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {food.servingSize} {food.servingUnit}
              </span>
            </div>
            <div className="text-right">
              <div className="font-medium text-emerald-600">{Math.round(food.nutrition.calories)} kcal</div>
              <div className="text-xs text-muted-foreground">
                P:{Math.round(food.nutrition.protein)}g C:{Math.round(food.nutrition.carbs)}g F:{Math.round(food.nutrition.fat)}g
              </div>
            </div>
          </button>
        ))}

        {query.length >= 2 && results.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-3">No foods found for &quot;{query}&quot;</p>
            {onCreateCustom && (
              <button
                onClick={onCreateCustom}
                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-foreground/5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Custom Food
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
