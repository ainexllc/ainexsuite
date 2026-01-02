'use client';

import { Flame, Drumstick, Wheat, Droplet } from 'lucide-react';
import type { DailyNutritionSummary, NutritionGoals } from '@ainexsuite/types';
import { MacroProgressBar } from './MacroProgressBar';

interface NutritionStatsProps {
  summary: DailyNutritionSummary | null;
  goals: Pick<NutritionGoals, 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber'>;
}

export function NutritionStats({ summary, goals }: NutritionStatsProps) {
  const totals = summary?.totals || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  };

  const macros = [
    {
      label: 'Calories',
      current: totals.calories,
      goal: goals.calories,
      unit: 'kcal',
      color: 'emerald' as const,
      icon: Flame,
    },
    {
      label: 'Protein',
      current: totals.protein,
      goal: goals.protein,
      unit: 'g',
      color: 'blue' as const,
      icon: Drumstick,
    },
    {
      label: 'Carbs',
      current: totals.carbs,
      goal: goals.carbs,
      unit: 'g',
      color: 'amber' as const,
      icon: Wheat,
    },
    {
      label: 'Fat',
      current: totals.fat,
      goal: goals.fat,
      unit: 'g',
      color: 'purple' as const,
      icon: Droplet,
    },
  ];

  const caloriePercentage = goals.calories > 0 ? Math.round((totals.calories / goals.calories) * 100) : 0;

  return (
    <div className="p-4 bg-surface-elevated border border-outline-subtle rounded-xl space-y-6">
      {/* Main Calorie Ring */}
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              className="stroke-surface-subtle"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              className={caloriePercentage > 100 ? 'stroke-red-500' : 'stroke-emerald-500'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${Math.min(caloriePercentage, 100)} 100`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-ink-900">{Math.round(totals.calories)}</span>
            <span className="text-xs text-ink-500">kcal</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-ink-900">Daily Nutrition</h3>
          <p className="text-sm text-ink-500">
            {caloriePercentage}% of {goals.calories} kcal goal
          </p>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-ink-600">P: {Math.round(totals.protein)}g</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-ink-600">C: {Math.round(totals.carbs)}g</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-ink-600">F: {Math.round(totals.fat)}g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Macro Progress Bars */}
      <div className="space-y-4">
        {macros.map((macro) => (
          <MacroProgressBar
            key={macro.label}
            label={macro.label}
            current={macro.current}
            goal={macro.goal}
            unit={macro.unit}
            color={macro.color}
          />
        ))}
      </div>

      {/* Fiber if tracked */}
      {goals.fiber && (
        <MacroProgressBar
          label="Fiber"
          current={totals.fiber || 0}
          goal={goals.fiber}
          unit="g"
          color="emerald"
        />
      )}
    </div>
  );
}
