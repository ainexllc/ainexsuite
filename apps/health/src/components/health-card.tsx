'use client';

import { useState, useCallback } from 'react';
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
  Trash2,
  Edit2,
} from 'lucide-react';
import { ConfirmationDialog } from '@ainexsuite/ui';

type ViewMode = 'list' | 'masonry' | 'calendar';

interface HealthCardProps {
  metric: HealthMetric;
  viewMode: ViewMode;
  onEdit: (metric: HealthMetric) => void;
  onDelete: (id: string) => Promise<void>;
}

function getMoodIcon(mood: string | null) {
  switch (mood) {
    case 'excited':
    case 'happy':
    case 'grateful':
    case 'peaceful':
      return Smile;
    case 'neutral':
      return Meh;
    case 'anxious':
    case 'sad':
    case 'frustrated':
    case 'tired':
      return Frown;
    default:
      return null;
  }
}

function getMoodColor(mood: string | null) {
  switch (mood) {
    case 'excited':
      return 'text-green-500';
    case 'happy':
    case 'grateful':
    case 'peaceful':
      return 'text-green-400';
    case 'neutral':
      return 'text-yellow-500';
    case 'anxious':
    case 'frustrated':
      return 'text-orange-500';
    case 'sad':
    case 'tired':
      return 'text-red-500';
    default:
      return 'text-muted-foreground';
  }
}

function getMoodLabel(mood: string | null) {
  switch (mood) {
    case 'excited':
      return 'Great';
    case 'happy':
    case 'grateful':
    case 'peaceful':
      return 'Good';
    case 'neutral':
      return 'Okay';
    case 'anxious':
    case 'frustrated':
      return 'Low';
    case 'sad':
    case 'tired':
      return 'Bad';
    default:
      return '--';
  }
}

export function HealthCard({ metric, viewMode, onEdit, onDelete }: HealthCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const date = new Date(metric.date);
  const MoodIcon = getMoodIcon(metric.mood);

  const handleCardClick = () => {
    onEdit(metric);
  };

  const handleDeleteClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(metric.id);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setShowDeleteConfirm(false);
  };

  const isListView = viewMode === 'list';

  return (
    <>
      <article
        className={clsx(
          // Clean card backgrounds
          "bg-white dark:bg-zinc-800",
          "border border-zinc-200/80 dark:border-zinc-700/50",
          "group relative cursor-pointer overflow-hidden rounded-2xl",
          "transition-[border-color,box-shadow] duration-200",
          "hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-lg",
          isListView ? "px-4 py-4" : "px-6 py-6"
        )}
        onClick={handleCardClick}
      >
        {/* Header Section */}
        <div className={clsx(
          "relative z-10 -mx-6 -mt-6 px-6 py-4 rounded-t-2xl border-b mb-4",
          "bg-zinc-50/90 dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-700/40"
        )}>
          <div className="flex items-center justify-between">
            <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-100">
              {date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </h3>
            {metric.mood && MoodIcon && (
              <div className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-xl border',
                'bg-zinc-100/90 dark:bg-zinc-700/50 border-zinc-200/60 dark:border-zinc-600/40',
                getMoodColor(metric.mood)
              )}>
                <MoodIcon className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{getMoodLabel(metric.mood)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="relative z-10 w-full">
          {/* Metrics Grid with Glass Pill Styling */}
          <div className={clsx(
            'gap-2',
            isListView ? 'flex flex-wrap' : 'grid grid-cols-2'
          )}>
            {metric.weight && (
              <MetricBadge
                icon={Scale}
                value={metric.weight}
                unit="lbs"
              />
            )}
            {metric.sleep && (
              <MetricBadge
                icon={Moon}
                value={metric.sleep}
                unit="hrs"
              />
            )}
            {metric.water && (
              <MetricBadge
                icon={Droplets}
                value={metric.water}
                unit="glasses"
              />
            )}
            {metric.energy && (
              <MetricBadge
                icon={Activity}
                value={metric.energy}
                unit="/10"
              />
            )}
            {metric.heartRate && (
              <MetricBadge
                icon={Heart}
                value={metric.heartRate}
                unit="bpm"
              />
            )}
          </div>

          {/* Notes */}
          {metric.notes && !isListView && (
            <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 tracking-[-0.01em] line-clamp-3 text-zinc-600 dark:text-zinc-400">
              {metric.notes}
            </p>
          )}
        </div>

        {/* Footer Section */}
        <footer className={clsx(
          "mt-4 flex items-center justify-between pt-3 -mx-6 -mb-6 px-6 pb-4 rounded-b-2xl border-t",
          "bg-zinc-50/90 dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-700/40"
        )}>
          {/* Glass pill for date info */}
          <div className={clsx(
            "flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-xl border",
            "bg-zinc-100/90 dark:bg-zinc-700/50 border-zinc-200/60 dark:border-zinc-600/40"
          )}>
            <span className="h-7 flex items-center px-2.5 rounded-full text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {new Date(metric.updatedAt !== metric.createdAt ? metric.updatedAt : metric.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              {' · '}
              {metric.updatedAt !== metric.createdAt ? 'Edited' : 'Created'}
            </span>
          </div>

          {/* Glass pill for actions */}
          <div className={clsx(
            "flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-xl border",
            "bg-zinc-100/90 dark:bg-zinc-700/50 border-zinc-200/60 dark:border-zinc-600/40"
          )}>
            {/* Edit button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(metric);
              }}
              className="h-7 w-7 rounded-full flex items-center justify-center transition text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              aria-label="Edit check-in"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            {/* Delete button */}
            <button
              type="button"
              onClick={handleDeleteClick}
              className="h-7 w-7 rounded-full flex items-center justify-center transition text-red-400 hover:bg-red-500/20 hover:text-red-500"
              aria-label="Delete check-in"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </footer>
      </article>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete this check-in?"
        description="This action cannot be undone. Your health data will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}

function MetricBadge({
  icon: Icon,
  value,
  unit,
}: {
  icon: React.ElementType;
  value: number;
  unit: string;
}) {
  return (
    <div className={clsx(
      "flex items-center gap-2 p-3 rounded-xl border",
      "bg-zinc-50/80 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-700/30"
    )}>
      <Icon className="w-4 h-4 text-emerald-500" />
      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        {value}
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 ml-0.5">{unit}</span>
      </span>
    </div>
  );
}
