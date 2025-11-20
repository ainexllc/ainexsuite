'use client';

import type { JournalEntry } from '@ainexsuite/types';
import { getMoodColor, getMoodIcon, getMoodLabel } from '@/lib/utils/mood';
import { formatDate } from '@/lib/utils/date';
import { plainText, truncate } from '@/lib/utils/text';
import { clsx } from 'clsx';
import { Lock } from 'lucide-react';

interface EntryCardProps {
  entry: JournalEntry;
  onClick?: () => void;
}

export function EntryCard({ entry, onClick }: EntryCardProps) {
  const MoodIcon = entry.mood ? getMoodIcon(entry.mood) : null;
  const moodColor = entry.mood ? getMoodColor(entry.mood) : '';
  const moodLabel = entry.mood ? getMoodLabel(entry.mood) : '';
  const contentPreview = truncate(plainText(entry.content), 200);

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 transition-all hover:border-purple-500 hover:shadow-lg"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {entry.title}
          </h3>
          <time className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(new Date(entry.createdAt))}
          </time>
        </div>

        {/* Mood Badge */}
        {entry.mood && MoodIcon && (
          <div className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium', moodColor)}>
            <MoodIcon className="h-4 w-4" />
            <span>{moodLabel}</span>
          </div>
        )}
      </div>

      {/* Content Preview */}
      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
        {contentPreview}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-wrap gap-2">
          {entry.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
            >
              {tag}
            </span>
          ))}
          {entry.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{entry.tags.length - 3} more
            </span>
          )}
        </div>

        {entry.isPrivate && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Lock className="h-3 w-3" />
            <span>Private</span>
          </div>
        )}
      </div>

      {/* Draft Badge */}
      {entry.isDraft && (
        <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
          Draft
        </div>
      )}
    </article>
  );
}
