'use client';

import { useState } from 'react';
import { Save, X } from 'lucide-react';
import type { HealthGoals } from '@ainexsuite/types';
import { GOAL_CONFIG, DEFAULT_HEALTH_GOALS } from '@/lib/goals-service';

interface GoalEditorProps {
  currentGoals: HealthGoals;
  onSave: (goals: Partial<HealthGoals>) => Promise<void>;
  onCancel: () => void;
}

export function GoalEditor({ currentGoals, onSave, onCancel }: GoalEditorProps) {
  const [goals, setGoals] = useState<HealthGoals>({
    ...DEFAULT_HEALTH_GOALS,
    ...currentGoals,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(goals);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof HealthGoals, value: number | null) => {
    setGoals((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Water Goal */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Daily Water Goal
          <span className="text-ink-400 font-normal"> (glasses)</span>
        </label>
        <input
          type="number"
          min="1"
          max="20"
          value={goals.dailyWaterGoal}
          onChange={(e) => handleChange('dailyWaterGoal', parseInt(e.target.value) || 8)}
          className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <p className="text-xs text-ink-400 mt-1">{GOAL_CONFIG.dailyWaterGoal.description}</p>
      </div>

      {/* Sleep Goal */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Sleep Goal
          <span className="text-ink-400 font-normal"> (hours per night)</span>
        </label>
        <input
          type="number"
          min="4"
          max="12"
          step="0.5"
          value={goals.sleepGoal}
          onChange={(e) => handleChange('sleepGoal', parseFloat(e.target.value) || 8)}
          className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <p className="text-xs text-ink-400 mt-1">{GOAL_CONFIG.sleepGoal.description}</p>
      </div>

      {/* Exercise Goal Daily */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Daily Exercise Goal
          <span className="text-ink-400 font-normal"> (minutes)</span>
        </label>
        <input
          type="number"
          min="10"
          max="180"
          step="5"
          value={goals.exerciseGoalDaily}
          onChange={(e) => handleChange('exerciseGoalDaily', parseInt(e.target.value) || 30)}
          className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <p className="text-xs text-ink-400 mt-1">{GOAL_CONFIG.exerciseGoalDaily.description}</p>
      </div>

      {/* Exercise Goal Weekly */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Weekly Exercise Goal
          <span className="text-ink-400 font-normal"> (minutes)</span>
        </label>
        <input
          type="number"
          min="60"
          max="600"
          step="30"
          value={goals.exerciseGoalWeekly}
          onChange={(e) => handleChange('exerciseGoalWeekly', parseInt(e.target.value) || 150)}
          className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <p className="text-xs text-ink-400 mt-1">{GOAL_CONFIG.exerciseGoalWeekly.description}</p>
      </div>

      {/* Target Weight */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Target Weight
          <span className="text-ink-400 font-normal"> (kg, optional)</span>
        </label>
        <input
          type="number"
          min="30"
          max="200"
          step="0.5"
          value={goals.targetWeight ?? ''}
          onChange={(e) =>
            handleChange('targetWeight', e.target.value ? parseFloat(e.target.value) : null)
          }
          placeholder="Leave empty if no target"
          className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <p className="text-xs text-ink-400 mt-1">{GOAL_CONFIG.targetWeight.description}</p>
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
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Goals'}
        </button>
      </div>
    </div>
  );
}
