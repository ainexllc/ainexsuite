'use client';

import { useState } from 'react';
import { Trash2, Save, X } from 'lucide-react';
import { Modal } from '@ainexsuite/ui';
import type { FoodItem, MealType, NutritionInfo, Meal } from '@ainexsuite/types';
import { FoodSearch } from './FoodSearch';
import { FoodEditor } from './FoodEditor';
import { calculateNutritionForQuantity, sumNutrition } from '@/lib/food-database';
import { createCustomFood } from '@/lib/nutrition-service';
import { useAuth } from '@ainexsuite/auth';

interface FoodEntry {
  food: FoodItem;
  quantity: number;
  scaledNutrition: NutritionInfo;
}

interface MealComposerProps {
  initialMeal?: Meal;
  onSave: (meal: Omit<Meal, 'id' | 'ownerId'>) => Promise<void>;
  onCancel: () => void;
}

const mealTypes: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'other', label: 'Other' },
];

export function MealComposer({ initialMeal, onSave, onCancel }: MealComposerProps) {
  const { user } = useAuth();
  const [mealType, setMealType] = useState<MealType>(initialMeal?.type || 'breakfast');
  const [time, setTime] = useState(
    initialMeal?.time || new Date().toTimeString().slice(0, 5)
  );
  const [foods, setFoods] = useState<FoodEntry[]>(
    initialMeal?.foods.map((entry) => ({
      food: entry.food,
      quantity: entry.quantity,
      scaledNutrition: calculateNutritionForQuantity(entry.food.nutrition, 1, entry.quantity),
    })) || []
  );
  const [notes, setNotes] = useState(initialMeal?.notes || '');
  const [saving, setSaving] = useState(false);
  const [showFoodEditor, setShowFoodEditor] = useState(false);

  const handleAddFood = (food: FoodItem, quantity: number) => {
    const scaledNutrition = calculateNutritionForQuantity(food.nutrition, 1, quantity);
    setFoods((prev) => [...prev, { food, quantity, scaledNutrition }]);
  };

  const handleRemoveFood = (index: number) => {
    setFoods((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setFoods((prev) =>
      prev.map((entry, i) =>
        i === index
          ? {
              ...entry,
              quantity,
              scaledNutrition: calculateNutritionForQuantity(entry.food.nutrition, 1, quantity),
            }
          : entry
      )
    );
  };

  const totalNutrition = sumNutrition(foods.map((f) => f.scaledNutrition));

  const handleSave = async () => {
    if (foods.length === 0) return;

    setSaving(true);
    try {
      await onSave({
        date: initialMeal?.date || new Date().toISOString().split('T')[0],
        type: mealType,
        time,
        foods: foods.map((entry) => ({
          food: entry.food,
          quantity: entry.quantity,
        })),
        totalNutrition,
        notes: notes || undefined,
        createdAt: initialMeal?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCustomFood = async (food: Omit<FoodItem, 'id'>) => {
    if (!user?.uid) return;
    const newFood = await createCustomFood(food);
    if (newFood) {
      handleAddFood(newFood, 1);
    }
    setShowFoodEditor(false);
  };

  return (
    <div className="space-y-6">
      {/* Meal Type & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Meal Type
          </label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {mealTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Food Search */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Add Foods
        </label>
        <FoodSearch
          onSelect={handleAddFood}
          onCreateCustom={() => setShowFoodEditor(true)}
        />
      </div>

      {/* Added Foods */}
      {foods.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Foods in Meal
          </label>
          <div className="space-y-2">
            {foods.map((entry, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-surface-subtle rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink-900 truncate">
                    {entry.food.name}
                  </div>
                  <div className="text-sm text-ink-500">
                    {Math.round(entry.scaledNutrition.calories)} kcal
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0.25"
                    max="10"
                    step="0.25"
                    value={entry.quantity}
                    onChange={(e) =>
                      handleQuantityChange(index, parseFloat(e.target.value) || 1)
                    }
                    className="w-16 px-2 py-1 border border-outline-subtle rounded text-center text-sm"
                  />
                  <span className="text-sm text-ink-500">
                    × {entry.food.servingSize} {entry.food.servingUnit}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveFood(index)}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium text-emerald-800 dark:text-emerald-200">
                Total
              </span>
              <div className="flex gap-4 text-sm">
                <span className="text-emerald-700 dark:text-emerald-300">
                  {Math.round(totalNutrition.calories)} kcal
                </span>
                <span className="text-blue-700 dark:text-blue-300">
                  P: {Math.round(totalNutrition.protein)}g
                </span>
                <span className="text-amber-700 dark:text-amber-300">
                  C: {Math.round(totalNutrition.carbs)}g
                </span>
                <span className="text-purple-700 dark:text-purple-300">
                  F: {Math.round(totalNutrition.fat)}g
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did this meal make you feel?"
          rows={2}
          className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-outline-subtle">
        <button
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-outline-subtle rounded-lg text-ink-600 hover:bg-surface-subtle transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || foods.length === 0}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Meal'}
        </button>
      </div>

      {/* Custom Food Editor Modal */}
      <Modal
        isOpen={showFoodEditor}
        onClose={() => setShowFoodEditor(false)}
      >
        <h2 className="text-xl font-bold text-ink-900 mb-4">Create Custom Food</h2>
        <FoodEditor
          onSave={handleCreateCustomFood}
          onCancel={() => setShowFoodEditor(false)}
        />
      </Modal>
    </div>
  );
}
