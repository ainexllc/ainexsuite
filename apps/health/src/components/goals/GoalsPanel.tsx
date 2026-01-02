'use client';

import { useState } from 'react';
import { Target, Flame, Edit2, Plus } from 'lucide-react';
import { Modal } from '@ainexsuite/ui';
import { useGoals } from '@/providers/goals-provider';
import { GoalCard } from './GoalCard';
import { GoalEditor } from './GoalEditor';
import { GOAL_CONFIG } from '@/lib/goals-service';

export function GoalsPanel() {
  const { goals, progress, summary, loading, updateGoals } = useGoals();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink-900">Health Goals</h2>
          <p className="text-sm text-ink-500">Track your daily targets and streaks</p>
        </div>
        <button
          onClick={() => setIsEditorOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Edit Goals
        </button>
      </div>

      {/* Overall Progress */}
      <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90">Overall Progress</div>
            <div className="text-3xl font-bold">
              {Math.round(summary.overallCompletionRate)}%
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6" />
            <div>
              <div className="text-2xl font-bold">{summary.totalStreak}</div>
              <div className="text-sm opacity-90">day streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {progress.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {progress.map((p) => (
            <GoalCard key={p.metric} progress={p} config={GOAL_CONFIG[p.metric]} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-outline-subtle rounded-xl">
          <Target className="w-12 h-12 text-ink-300 mb-4" />
          <h3 className="text-lg font-semibold text-ink-900 mb-2">No Goals Set</h3>
          <p className="text-ink-500 mb-4">Set your health goals to start tracking progress</p>
          <button
            onClick={() => setIsEditorOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Goals
          </button>
        </div>
      )}

      {/* Tips */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
        <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Tips</h4>
        <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
          <li>• Log your health metrics daily to track goal progress</li>
          <li>• Build streaks by meeting your goals consistently</li>
          <li>• Adjust goals based on your progress and feedback</li>
        </ul>
      </div>

      {/* Goal Editor Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      >
        <h2 className="text-xl font-bold text-ink-900 mb-4">Edit Goals</h2>
        <GoalEditor
          currentGoals={goals}
          onSave={async (newGoals) => {
            await updateGoals(newGoals);
            setIsEditorOpen(false);
          }}
          onCancel={() => setIsEditorOpen(false)}
        />
      </Modal>
    </div>
  );
}
