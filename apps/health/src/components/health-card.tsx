'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import type { HealthMetric } from '@ainexsuite/types';
import {
  Scale,
  Moon,
  Droplets,
  Activity,
  Heart,
  Smile,
  Meh,
  Frown,
  MoreHorizontal,
  Edit2,
  Trash2,
} from 'lucide-react';

type ViewMode = 'list' | 'masonry' | 'calendar';

interface HealthCardProps {
  metric: HealthMetric;
  viewMode: ViewMode;
  onEdit: (metric: HealthMetric) => void;
  onDelete: (id: string) => Promise<void>;
}

function getMoodIcon(mood: string | null) {
  switch (mood) {
    case 'energetic':
    case 'happy':
      return Smile;
    case 'neutral':
      return Meh;
    case 'stressed':
    case 'tired':
      return Frown;
    default:
      return null;
  }
}

function getMoodColor(mood: string | null) {
  switch (mood) {
    case 'energetic':
      return 'text-green-500';
    case 'happy':
      return 'text-green-400';
    case 'neutral':
      return 'text-yellow-500';
    case 'stressed':
      return 'text-orange-500';
    case 'tired':
      return 'text-red-500';
    default:
      return 'text-muted-foreground';
  }
}

function getMoodLabel(mood: string | null) {
  switch (mood) {
    case 'energetic':
      return 'Great';
    case 'happy':
      return 'Good';
    case 'neutral':
      return 'Okay';
    case 'stressed':
      return 'Low';
    case 'tired':
      return 'Bad';
    default:
      return '--';
  }
}

export function HealthCard({ metric, viewMode, onEdit, onDelete }: HealthCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const date = new Date(metric.date);
  const MoodIcon = getMoodIcon(metric.mood);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(metric.id);
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const isListView = viewMode === 'list';

  return (
    <div
      className={clsx(
        'group relative rounded-2xl border transition-all hover:shadow-md',
        'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800',
        isListView ? 'p-4' : 'p-5'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
            {date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          {metric.mood && MoodIcon && (
            <div className={clsx('flex items-center gap-1 mt-1 text-sm', getMoodColor(metric.mood))}>
              <MoodIcon className="w-4 h-4" />
              <span>{getMoodLabel(metric.mood)}</span>
            </div>
          )}
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
          >
            <MoreHorizontal className="w-4 h-4 text-zinc-500" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 z-20 w-32 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    onEdit(metric);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className={clsx(
        'gap-2',
        isListView ? 'flex flex-wrap' : 'grid grid-cols-2'
      )}>
        {metric.weight && (
          <MetricBadge
            icon={Scale}
            value={metric.weight}
            unit="lbs"
            isListView={isListView}
          />
        )}
        {metric.sleep && (
          <MetricBadge
            icon={Moon}
            value={metric.sleep}
            unit="hrs"
            isListView={isListView}
          />
        )}
        {metric.water && (
          <MetricBadge
            icon={Droplets}
            value={metric.water}
            unit="glasses"
            isListView={isListView}
          />
        )}
        {metric.energy && (
          <MetricBadge
            icon={Activity}
            value={metric.energy}
            unit="/10"
            isListView={isListView}
          />
        )}
        {metric.heartRate && (
          <MetricBadge
            icon={Heart}
            value={metric.heartRate}
            unit="bpm"
            isListView={isListView}
          />
        )}
      </div>

      {/* Notes */}
      {metric.notes && !isListView && (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
          {metric.notes}
        </p>
      )}
    </div>
  );
}

function MetricBadge({
  icon: Icon,
  value,
  unit,
  isListView,
}: {
  icon: React.ElementType;
  value: number;
  unit: string;
  isListView: boolean;
}) {
  return (
    <div
      className={clsx(
        'flex items-center gap-1.5 rounded-lg',
        isListView
          ? 'px-2 py-1 bg-zinc-100 dark:bg-zinc-800'
          : 'p-2 bg-zinc-100 dark:bg-zinc-800'
      )}
    >
      <Icon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {value}
        <span className="text-xs text-zinc-500 dark:text-zinc-500 ml-0.5">{unit}</span>
      </span>
    </div>
  );
}
