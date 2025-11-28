'use client';

import { Sparkles } from 'lucide-react';

export interface UsageMeterProps {
  queriesUsed: number;
  queriesLimit: number;
  tierName?: string;
}

export function UsageMeter({ queriesUsed, queriesLimit, tierName }: UsageMeterProps) {
  const percentage = (queriesUsed / queriesLimit) * 100;

  // Color coding based on usage
  const getColor = () => {
    if (percentage >= 90) return 'red';
    if (percentage >= 70) return 'yellow';
    return 'green';
  };

  const color = getColor();

  const colorClasses = {
    green: {
      bg: 'bg-emerald-500/20',
      bar: 'bg-emerald-500',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
    },
    yellow: {
      bg: 'bg-amber-500/20',
      bar: 'bg-amber-500',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
    },
    red: {
      bg: 'bg-red-500/20',
      bar: 'bg-red-500',
      text: 'text-red-400',
      border: 'border-red-500/30',
    },
  };

  const styles = colorClasses[color];

  return (
    <div className={`rounded-lg ${styles.bg} border ${styles.border} p-4`}>
      <div className="flex items-start gap-3">
        <Sparkles className={`h-5 w-5 ${styles.text} mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">AI Queries</h3>
            <span className={`text-xs font-medium ${styles.text}`}>
              {queriesUsed.toLocaleString()} / {queriesLimit.toLocaleString()}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-foreground/10 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 ${styles.bar} rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          {/* Status Text */}
          <p className="text-xs text-muted-foreground mt-2">
            {percentage >= 90
              ? 'Almost at your limit!'
              : percentage >= 70
              ? 'Getting close to your limit'
              : `${Math.round(queriesLimit - queriesUsed)} queries remaining this month`}
          </p>

          {/* Upgrade Link (if near limit and not on highest tier) */}
          {percentage >= 80 && tierName !== 'enterprise' && (
            <button className="mt-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition">
              Upgrade for more queries →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
