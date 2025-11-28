'use client';

import type { LearningGoal } from '@ainexsuite/types';
import { format } from 'date-fns';
import { Calendar, Book, CheckCircle2, Circle, Edit } from 'lucide-react';
import { updateLearningGoal } from '@/lib/learning';
import { ListSection } from '@ainexsuite/ui';

interface GoalListProps {
  goals: LearningGoal[];
  onEdit: (goal: LearningGoal) => void;
  onUpdate: () => void;
}

export function GoalList({ goals, onEdit, onUpdate }: GoalListProps) {
  const handleToggleActive = async (goal: LearningGoal) => {
    try {
      await updateLearningGoal(goal.id, { active: !goal.active });
      onUpdate();
    } catch (error) {
      console.error('Failed to toggle goal:', error);
    }
  };

  const activeGoals = goals.filter((g) => g.active);
  const completedGoals = goals.filter((g) => !g.active);

  return (
    <div className="space-y-8">
      {activeGoals.length > 0 && (
        <ListSection title="Active Goals" count={activeGoals.length}>
          <div className="grid gap-4">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={onEdit}
                onToggle={handleToggleActive}
              />
            ))}
          </div>
        </ListSection>
      )}

      {completedGoals.length > 0 && (
        <ListSection title="Completed Goals" count={completedGoals.length}>
          <div className="grid gap-4">
            {completedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={onEdit}
                onToggle={handleToggleActive}
              />
            ))}
          </div>
        </ListSection>
      )}
    </div>
  );
}

function GoalCard({
  goal,
  onEdit,
  onToggle,
}: {
  goal: LearningGoal;
  onEdit: (goal: LearningGoal) => void;
  onToggle: (goal: LearningGoal) => void;
}) {
  const progress = ((goal.currentLevel / goal.targetLevel) * 100) || 0;

  return (
    <div className="surface-card rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => onToggle(goal)}
              className="text-accent-500 hover:text-accent-600 transition-colors"
            >
              {goal.active ? (
                <Circle className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
            </button>
            <h3 className="text-lg font-semibold">{goal.title}</h3>
            <span className="px-2 py-1 surface-elevated rounded text-xs">
              {goal.category}
            </span>
          </div>
          {goal.description && (
            <p className="text-sm text-ink-700 ml-8">{goal.description}</p>
          )}
        </div>

        <button
          onClick={() => onEdit(goal)}
          className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
        >
          <Edit className="h-4 w-4 text-ink-600" />
        </button>
      </div>

      <div className="ml-8 space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-ink-700">Progress</span>
            <span className="font-medium">
              {goal.currentLevel}/{goal.targetLevel} ({Math.round(progress)}%)
            </span>
          </div>
          <div className="w-full h-2 surface-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-500 progress-bar"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        {goal.targetDate && (
          <div className="flex items-center gap-2 text-sm text-ink-700">
            <Calendar className="h-4 w-4" />
            <span>Target: {format(new Date(goal.targetDate), 'MMM d, yyyy')}</span>
          </div>
        )}

        {goal.resources && goal.resources.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-ink-700">
            <Book className="h-4 w-4" />
            <span>
              {goal.resources.filter((r) => r.completed).length}/{goal.resources.length} resources completed
            </span>
          </div>
        )}

        {goal.skills && goal.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {goal.skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 surface-elevated rounded-full text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
