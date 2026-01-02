'use client';

import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import type { SymptomPattern } from '@ainexsuite/types';

interface SymptomPatternsProps {
  patterns: SymptomPattern[];
}

export function SymptomPatterns({ patterns }: SymptomPatternsProps) {
  if (patterns.length === 0) {
    return (
      <div className="p-6 bg-surface-elevated border border-outline-subtle rounded-xl text-center">
        <AlertTriangle className="w-8 h-8 text-ink-300 mx-auto mb-2" />
        <p className="text-ink-500">No patterns detected yet</p>
        <p className="text-sm text-ink-400">Log more symptoms to see patterns emerge</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-ink-900">Symptom Patterns</h3>

      <div className="grid gap-4">
        {patterns.map((pattern) => (
          <div
            key={pattern.symptom}
            className="p-4 bg-surface-elevated border border-outline-subtle rounded-xl"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-ink-900">{pattern.symptom}</h4>
                <p className="text-sm text-ink-500">
                  {pattern.occurrences} occurrence{pattern.occurrences !== 1 ? 's' : ''} recorded
                </p>
              </div>
              <div className="flex items-center gap-1">
                {pattern.trend === 'increasing' && (
                  <TrendingUp className="w-5 h-5 text-red-500" />
                )}
                {pattern.trend === 'decreasing' && (
                  <TrendingDown className="w-5 h-5 text-green-500" />
                )}
                {pattern.trend === 'stable' && (
                  <Minus className="w-5 h-5 text-amber-500" />
                )}
                <span
                  className={`text-sm font-medium ${
                    pattern.trend === 'increasing'
                      ? 'text-red-500'
                      : pattern.trend === 'decreasing'
                      ? 'text-green-500'
                      : 'text-amber-500'
                  }`}
                >
                  {pattern.trend.charAt(0).toUpperCase() + pattern.trend.slice(1)}
                </span>
              </div>
            </div>

            {/* Average Severity */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-ink-500">Avg. Severity</span>
                <span className="font-medium text-ink-700">
                  {pattern.averageSeverity.toFixed(1)} / 5
                </span>
              </div>
              <div className="h-2 bg-surface-subtle rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    pattern.averageSeverity <= 2
                      ? 'bg-green-500'
                      : pattern.averageSeverity <= 3
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${(pattern.averageSeverity / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Common Triggers */}
            {pattern.commonTriggers.length > 0 && (
              <div>
                <span className="text-sm text-ink-500">Common triggers: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {pattern.commonTriggers.map((trigger) => (
                    <span
                      key={trigger}
                      className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-full"
                    >
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Insights</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          {patterns.filter((p) => p.trend === 'increasing').length > 0 && (
            <li>
              • {patterns.filter((p) => p.trend === 'increasing').length} symptom(s) are increasing in frequency
            </li>
          )}
          {patterns.filter((p) => p.averageSeverity >= 4).length > 0 && (
            <li>
              • {patterns.filter((p) => p.averageSeverity >= 4).length} symptom(s) have high average severity
            </li>
          )}
          {patterns.some((p) => p.commonTriggers.includes('Stress')) && (
            <li>• Stress appears to be a common trigger across multiple symptoms</li>
          )}
          {patterns.some((p) => p.commonTriggers.includes('Poor sleep')) && (
            <li>• Sleep quality may be affecting your symptoms</li>
          )}
        </ul>
      </div>
    </div>
  );
}
