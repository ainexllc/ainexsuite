'use client';

import { useState } from 'react';
import type { HealthMetric } from '@ainexsuite/types';
import {
  Scale,
  Moon,
  Droplets,
  Activity,
  Heart,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
} from 'lucide-react';

interface HealthHistoryProps {
  metrics: HealthMetric[];
  onEdit: (metric: HealthMetric) => void;
  onDelete: (id: string) => Promise<void>;
}

function getMoodEmoji(mood: string | null): string {
  switch (mood) {
    case 'excited':
      return '😄';
    case 'happy':
    case 'grateful':
      return '😊';
    case 'neutral':
    case 'peaceful':
      return '😐';
    case 'anxious':
    case 'frustrated':
      return '😟';
    case 'tired':
    case 'sad':
      return '😔';
    default:
      return '--';
  }
}

export function HealthHistory({ metrics, onEdit, onDelete }: HealthHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (metrics.length === 0) {
    return (
      <div className="text-center py-8 text-ink-500">
        <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No health check-ins yet</p>
        <p className="text-sm">Start tracking your wellness today!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-ink-900">Recent Check-ins</h3>

      <div className="space-y-2">
        {metrics.map((metric) => {
          const isExpanded = expandedId === metric.id;
          const date = new Date(metric.date);

          return (
            <div
              key={metric.id}
              className="bg-surface-elevated rounded-xl border border-outline-subtle overflow-hidden"
            >
              {/* Summary Row */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : metric.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <p className="font-medium text-ink-900">
                      {date.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-ink-500 mt-1">
                      {metric.weight && (
                        <span className="flex items-center gap-1">
                          <Scale className="h-3 w-3" />
                          {metric.weight}
                        </span>
                      )}
                      {metric.sleep && (
                        <span className="flex items-center gap-1">
                          <Moon className="h-3 w-3" />
                          {metric.sleep}h
                        </span>
                      )}
                      {metric.water && (
                        <span className="flex items-center gap-1">
                          <Droplets className="h-3 w-3" />
                          {metric.water}
                        </span>
                      )}
                      {metric.mood && (
                        <span>{getMoodEmoji(metric.mood)}</span>
                      )}
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-ink-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-ink-400" />
                )}
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-outline-subtle pt-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <MetricItem
                      icon={Scale}
                      label="Weight"
                      value={metric.weight}
                      unit="lbs"
                    />
                    <MetricItem
                      icon={Moon}
                      label="Sleep"
                      value={metric.sleep}
                      unit="hrs"
                    />
                    <MetricItem
                      icon={Droplets}
                      label="Water"
                      value={metric.water}
                      unit="glasses"
                    />
                    <MetricItem
                      icon={Activity}
                      label="Energy"
                      value={metric.energy}
                      unit="/10"
                    />
                    <MetricItem
                      icon={Heart}
                      label="Heart Rate"
                      value={metric.heartRate}
                      unit="bpm"
                    />
                    <div className="p-2 bg-surface-muted rounded-lg">
                      <p className="text-xs text-ink-500">Mood</p>
                      <p className="text-lg">
                        {getMoodEmoji(metric.mood)} {metric.mood || '--'}
                      </p>
                    </div>
                  </div>

                  {metric.notes && (
                    <div className="p-3 bg-surface-muted rounded-lg">
                      <p className="text-xs text-ink-500 mb-1">Notes</p>
                      <p className="text-sm text-ink-700">{metric.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => onEdit(metric)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-ink-600 hover:bg-surface-muted rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(metric.id)}
                      disabled={deletingId === metric.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === metric.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricItem({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: React.ElementType;
  label: string;
  value: number | null;
  unit: string;
}) {
  return (
    <div className="p-2 bg-surface-muted rounded-lg">
      <p className="text-xs text-ink-500 flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className="text-lg font-medium text-ink-900">
        {value ?? '--'}
        {value !== null && <span className="text-sm text-ink-500 ml-1">{unit}</span>}
      </p>
    </div>
  );
}
