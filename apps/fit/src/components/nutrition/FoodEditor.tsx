'use client';

import { useState } from 'react';
import { Save, X } from 'lucide-react';
import type { FoodItem, NutritionInfo } from '@ainexsuite/types';

interface FoodEditorProps {
  initialFood?: Partial<FoodItem>;
  onSave: (food: Omit<FoodItem, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function FoodEditor({ initialFood, onSave, onCancel }: FoodEditorProps) {
  const [name, setName] = useState(initialFood?.name || '');
  const [servingSize, setServingSize] = useState(initialFood?.servingSize || 100);
  const [servingUnit, setServingUnit] = useState(initialFood?.servingUnit || 'g');
  const [nutrition, setNutrition] = useState<NutritionInfo>(
    initialFood?.nutrition || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleNutritionChange = (key: keyof NutritionInfo, value: number) => {
    setNutrition((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a food name');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSave({
        name: name.trim(),
        servingSize,
        servingUnit,
        nutrition,
        isCustom: true,
      });
    } catch (err) {
      setError('Failed to save food');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const servingUnits = ['g', 'ml', 'oz', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'serving'];

  return (
    <div className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">
          Food Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Homemade granola"
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
        />
      </div>

      {/* Serving Size */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Serving Size
          </label>
          <input
            type="number"
            min="1"
            value={servingSize}
            onChange={(e) => setServingSize(parseFloat(e.target.value) || 100)}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Unit
          </label>
          <select
            value={servingUnit}
            onChange={(e) => setServingUnit(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
          >
            {servingUnits.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Nutrition Facts */}
      <div>
        <h4 className="text-sm font-medium text-foreground/80 mb-3">
          Nutrition Facts (per serving)
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Calories (kcal)</label>
            <input
              type="number"
              min="0"
              value={nutrition.calories}
              onChange={(e) => handleNutritionChange('calories', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Protein (g)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={nutrition.protein}
              onChange={(e) => handleNutritionChange('protein', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Carbs (g)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={nutrition.carbs}
              onChange={(e) => handleNutritionChange('carbs', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Fat (g)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={nutrition.fat}
              onChange={(e) => handleNutritionChange('fat', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Fiber (g)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={nutrition.fiber || 0}
              onChange={(e) => handleNutritionChange('fiber', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Sugar (g)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={nutrition.sugar || 0}
              onChange={(e) => handleNutritionChange('sugar', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-foreground/5 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[hsl(var(--app-primary))] text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Food'}
        </button>
      </div>
    </div>
  );
}
