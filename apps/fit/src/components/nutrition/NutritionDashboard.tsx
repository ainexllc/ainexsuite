'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight, Settings, Apple } from 'lucide-react';
import { Modal } from '@ainexsuite/ui';
import { useAuth } from '@ainexsuite/auth';
import type { Meal, DailyNutritionSummary, NutritionGoals } from '@ainexsuite/types';
import { NutritionStats } from './NutritionStats';
import { MealCard } from './MealCard';
import { MealComposer } from './MealComposer';
import {
  getMealsForDate,
  getDailyNutritionSummary,
  getNutritionGoals,
  setNutritionGoals,
  createMeal,
  updateMeal,
  deleteMeal,
} from '@/lib/nutrition-service';

const DEFAULT_GOALS: Pick<NutritionGoals, 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber'> = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
  fiber: 25,
};

export function NutritionDashboard() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [summary, setSummary] = useState<DailyNutritionSummary | null>(null);
  const [goals, setGoals] = useState<NutritionGoals | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMealComposer, setShowMealComposer] = useState(false);
  const [showGoalsEditor, setShowGoalsEditor] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const [mealsData, summaryData, goalsData] = await Promise.all([
        getMealsForDate(selectedDate),
        getDailyNutritionSummary(selectedDate),
        getNutritionGoals(),
      ]);

      setMeals(mealsData);
      setSummary(summaryData);
      setGoals(goalsData);
    } catch (error) {
      console.error('Failed to load nutrition data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDateChange = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleSaveMeal = async (mealData: Omit<Meal, 'id' | 'ownerId'>) => {
    if (!user?.uid) return;

    if (editingMeal) {
      await updateMeal(editingMeal.id, mealData);
    } else {
      await createMeal({ ...mealData, date: selectedDate });
    }

    setShowMealComposer(false);
    setEditingMeal(null);
    loadData();
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!user?.uid) return;
    await deleteMeal(mealId);
    loadData();
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setShowMealComposer(true);
  };

  const handleSaveGoals = async (newGoals: Pick<NutritionGoals, 'calories' | 'protein' | 'carbs' | 'fat'>) => {
    if (!user?.uid) return;
    const result = await setNutritionGoals(newGoals);
    if (result) setGoals(result);
    setShowGoalsEditor(false);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--app-primary))]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Nutrition</h2>
          <p className="text-sm text-muted-foreground">Track your meals and macros</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGoalsEditor(true)}
            className="p-2 border border-border rounded-lg hover:bg-foreground/5 transition-colors"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => {
              setEditingMeal(null);
              setShowMealComposer(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--app-primary))] text-white rounded-lg hover:opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Meal
          </button>
        </div>
      </div>

      {/* Date Selector */}
      <div className="flex items-center justify-center gap-4 p-3 bg-background/60 border border-border rounded-xl backdrop-blur-xl">
        <button
          onClick={() => handleDateChange(-1)}
          className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="text-center">
          <div className="font-semibold text-foreground">{formatDate(selectedDate)}</div>
          <div className="text-xs text-muted-foreground">{selectedDate}</div>
        </div>
        <button
          onClick={() => handleDateChange(1)}
          disabled={selectedDate >= new Date().toISOString().split('T')[0]}
          className="p-2 hover:bg-foreground/10 rounded-lg transition-colors disabled:opacity-50"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Nutrition Stats */}
      <NutritionStats summary={summary} goals={goals || DEFAULT_GOALS} />

      {/* Meals */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Meals</h3>
        {meals.length > 0 ? (
          <div className="space-y-3">
            {meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onEdit={handleEditMeal}
                onDelete={handleDeleteMeal}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-xl">
            <Apple className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Meals Logged</h3>
            <p className="text-muted-foreground mb-4">Start tracking your nutrition for the day</p>
            <button
              onClick={() => {
                setEditingMeal(null);
                setShowMealComposer(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--app-primary))] text-white rounded-lg hover:opacity-90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Log First Meal
            </button>
          </div>
        )}
      </div>

      {/* Meal Composer Modal */}
      <Modal
        isOpen={showMealComposer}
        onClose={() => {
          setShowMealComposer(false);
          setEditingMeal(null);
        }}
      >
        <h2 className="text-xl font-bold text-foreground mb-4">{editingMeal ? 'Edit Meal' : 'Log Meal'}</h2>
        <MealComposer
          initialMeal={editingMeal || undefined}
          onSave={handleSaveMeal}
          onCancel={() => {
            setShowMealComposer(false);
            setEditingMeal(null);
          }}
        />
      </Modal>

      {/* Goals Editor Modal */}
      <Modal
        isOpen={showGoalsEditor}
        onClose={() => setShowGoalsEditor(false)}
      >
        <h2 className="text-xl font-bold text-foreground mb-4">Nutrition Goals</h2>
        <GoalsEditor
          goals={goals || DEFAULT_GOALS}
          onSave={handleSaveGoals}
          onCancel={() => setShowGoalsEditor(false)}
        />
      </Modal>
    </div>
  );
}

type GoalValues = Pick<NutritionGoals, 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber'>;

// Simple Goals Editor inline component
function GoalsEditor({
  goals,
  onSave,
  onCancel,
}: {
  goals: GoalValues;
  onSave: (goals: GoalValues) => Promise<void>;
  onCancel: () => void;
}) {
  const [editing, setEditing] = useState<GoalValues>(goals);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(editing);
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-1">
          Daily Calories (kcal)
        </label>
        <input
          type="number"
          min="1000"
          max="5000"
          value={editing.calories}
          onChange={(e) => setEditing({ ...editing, calories: parseInt(e.target.value) || 2000 })}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-1">
          Protein (g)
        </label>
        <input
          type="number"
          min="0"
          max="400"
          value={editing.protein}
          onChange={(e) => setEditing({ ...editing, protein: parseInt(e.target.value) || 150 })}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-1">
          Carbs (g)
        </label>
        <input
          type="number"
          min="0"
          max="500"
          value={editing.carbs}
          onChange={(e) => setEditing({ ...editing, carbs: parseInt(e.target.value) || 250 })}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-1">
          Fat (g)
        </label>
        <input
          type="number"
          min="0"
          max="200"
          value={editing.fat}
          onChange={(e) => setEditing({ ...editing, fat: parseInt(e.target.value) || 65 })}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-1">
          Fiber (g)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={editing.fiber}
          onChange={(e) => setEditing({ ...editing, fiber: parseInt(e.target.value) || 25 })}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-foreground/5 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-4 py-2 bg-[hsl(var(--app-primary))] text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Goals'}
        </button>
      </div>
    </div>
  );
}
