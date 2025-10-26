'use client';

import type { JournalEntry, Mood } from '@ainexsuite/types';
import { format } from 'date-fns';
import { Smile, Meh, Frown, Heart, Zap, type LucideIcon } from 'lucide-react';

interface EntryCardProps {
  entry: JournalEntry;
  onClick: () => void;
}

type MoodConfig = {
  icon: LucideIcon;
  color: string;
  label: string;
};

const MOOD_CONFIG: Record<Mood, MoodConfig> = {
  amazing: { icon: Heart, color: 'text-mood-amazing', label: 'Amazing' },
  good: { icon: Smile, color: 'text-mood-good', label: 'Good' },
  okay: { icon: Meh, color: 'text-mood-okay', label: 'Okay' },
  bad: { icon: Frown, color: 'text-mood-bad', label: 'Bad' },
  terrible: { icon: Zap, color: 'text-mood-terrible', label: 'Terrible' },
};

export function EntryCard({ entry, onClick }: EntryCardProps) {
  const moodConfig = MOOD_CONFIG[entry.mood];
  const Icon = moodConfig.icon;

  return (
    <div
      onClick={onClick}
      className="surface-card rounded-lg p-6 cursor-pointer hover:surface-hover transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm text-ink-600 mb-1">
            {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
          </div>
          {entry.title && (
            <h3 className="text-xl font-semibold">{entry.title}</h3>
          )}
        </div>

        <div className={`flex items-center gap-2 ${moodConfig.color}`}>
          <Icon className="h-5 w-5" />
          <span className="text-sm font-medium">{moodConfig.label}</span>
        </div>
      </div>

      <p className="text-ink-800 whitespace-pre-wrap line-clamp-3">
        {entry.content}
      </p>

      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 surface-elevated rounded-full text-ink-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
