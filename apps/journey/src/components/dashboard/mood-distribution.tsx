'use client';

import type { JournalEntry, MoodType } from '@ainexsuite/types';
import { getMoodColor, getMoodIcon, getMoodLabel } from '@/lib/utils/mood';
import { clsx } from 'clsx';

interface MoodDistributionProps {
  entries: JournalEntry[];
}

export function MoodDistribution({ entries }: MoodDistributionProps) {
  // Calculate mood distribution
  const moodCounts = entries.reduce((acc, entry) => {
    if (entry.mood) {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    }
    return acc;
  }, {} as Record<MoodType, number>);

  // Sort by count and take top 5
  const topMoods = Object.entries(moodCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([mood, count]) => ({
      mood: mood as MoodType,
      count,
      percentage: Math.round((count / entries.length) * 100),
    }));

  if (topMoods.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-border bg-surface-base p-6">
        <h3 className="text-lg font-semibold mb-4">Mood Distribution</h3>
        <p className="text-muted-foreground text-center py-8">
          No mood data yet. Start logging your moods!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-border bg-surface-base p-6">
      <h3 className="text-lg font-semibold mb-4">Mood Distribution</h3>

      <div className="space-y-3">
        {topMoods.map(({ mood, count, percentage }) => {
          const Icon = getMoodIcon(mood);
          const color = getMoodColor(mood);
          const label = getMoodLabel(mood);

          return (
            <div key={mood} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={clsx('p-1.5 rounded-lg', color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {label}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {count} ({percentage}%)
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={clsx('h-full rounded-full', color)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
