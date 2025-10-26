'use client';

import type { JournalEntry, Mood } from '@ainexsuite/types';

interface MoodChartProps {
  entries: JournalEntry[];
}

const MOOD_VALUES: Record<Mood, number> = {
  amazing: 5,
  good: 4,
  okay: 3,
  bad: 2,
  terrible: 1,
};

export function MoodChart({ entries }: MoodChartProps) {
  if (entries.length === 0) {
    return <div className="text-center text-ink-600 py-8">No entries yet</div>;
  }

  const averageMood =
    entries.reduce((sum, e) => sum + MOOD_VALUES[e.mood], 0) / entries.length;

  const moodCounts = entries.reduce((acc, e) => {
    acc[e.mood] = (acc[e.mood] || 0) + 1;
    return acc;
  }, {} as Record<Mood, number>);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-3xl font-bold">{averageMood.toFixed(1)}</div>
        <div className="text-sm text-ink-600">Average Mood</div>
      </div>

      <div className="space-y-2">
        {(Object.entries(moodCounts) as [Mood, number][]).map(([mood, count]) => (
          <div key={mood} className="flex items-center gap-2">
            <div className="w-16 text-sm capitalize">{mood}</div>
            <div className="flex-1 h-2 bg-surface-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-500"
                style={{ width: `${(count / entries.length) * 100}%` }}
              />
            </div>
            <div className="w-8 text-sm text-ink-600">{count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
