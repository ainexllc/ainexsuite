'use client';

import { Clock, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import type { Meal } from '@ainexsuite/types';

interface MealCardProps {
  meal: Meal;
  onEdit?: (meal: Meal) => void;
  onDelete?: (mealId: string) => void;
}

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  other: 'Other',
};

const mealTypeColors: Record<string, string> = {
  breakfast: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  lunch: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  dinner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  snack: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export function MealCard({ meal, onEdit, onDelete }: MealCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="p-4 bg-surface-elevated border border-outline-subtle rounded-xl">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${mealTypeColors[meal.type]}`}>
            {mealTypeLabels[meal.type]}
          </span>
          <div className="flex items-center gap-1 text-sm text-ink-500">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(meal.time)}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded hover:bg-surface-subtle transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-ink-400" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 py-1 bg-surface-elevated border border-outline-subtle rounded-lg shadow-lg z-20 min-w-[120px]">
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(meal);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-surface-subtle"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(meal.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-surface-subtle"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Foods */}
      <div className="space-y-2 mb-3">
        {meal.foods.map((entry, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-ink-700">{entry.food.name}</span>
            <span className="text-ink-500">
              {entry.quantity} × {entry.food.servingSize}{entry.food.servingUnit} • {Math.round(entry.food.nutrition.calories * entry.quantity)} kcal
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="pt-3 border-t border-outline-subtle">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-900">Total</span>
          <div className="flex gap-3 text-xs">
            <span className="text-emerald-600 dark:text-emerald-400">
              {Math.round(meal.totalNutrition.calories)} kcal
            </span>
            <span className="text-blue-600 dark:text-blue-400">
              P: {Math.round(meal.totalNutrition.protein)}g
            </span>
            <span className="text-amber-600 dark:text-amber-400">
              C: {Math.round(meal.totalNutrition.carbs)}g
            </span>
            <span className="text-purple-600 dark:text-purple-400">
              F: {Math.round(meal.totalNutrition.fat)}g
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {meal.notes && (
        <p className="mt-2 text-xs text-ink-500 italic">{meal.notes}</p>
      )}
    </div>
  );
}
