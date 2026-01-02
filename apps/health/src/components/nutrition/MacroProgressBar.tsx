'use client';

interface MacroProgressBarProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: 'emerald' | 'blue' | 'amber' | 'red' | 'purple';
}

const colorClasses = {
  emerald: {
    bg: 'bg-emerald-500',
    light: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  blue: {
    bg: 'bg-blue-500',
    light: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
  },
  amber: {
    bg: 'bg-amber-500',
    light: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
  },
  red: {
    bg: 'bg-red-500',
    light: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
  },
  purple: {
    bg: 'bg-purple-500',
    light: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
  },
};

export function MacroProgressBar({ label, current, goal, unit, color }: MacroProgressBarProps) {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const isOverGoal = current > goal && goal > 0;
  const colors = colorClasses[color];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-ink-700">{label}</span>
        <span className={isOverGoal ? 'text-red-500' : colors.text}>
          {Math.round(current)} / {goal} {unit}
        </span>
      </div>
      <div className={`h-2 rounded-full ${colors.light}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ${isOverGoal ? 'bg-red-500' : colors.bg}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isOverGoal && (
        <p className="text-xs text-red-500">
          {Math.round(current - goal)} {unit} over goal
        </p>
      )}
    </div>
  );
}
