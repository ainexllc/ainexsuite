'use client';

import type { JournalEntry, MoodType } from '@ainexsuite/types';

interface MoodChartProps {
  entries: JournalEntry[];
}

// Reduced analytically meaningful mood set with sentiment values
// Positive (4-5), Neutral (3), Negative (1-2)
const MOOD_VALUES: Record<MoodType, number> = {
  happy: 5,
  excited: 5,
  grateful: 5,
  peaceful: 4,
  neutral: 3,
  anxious: 2,
  sad: 1,
  frustrated: 2,
  tired: 2,
};

export function MoodChart({ entries }: MoodChartProps) {
  if (entries.length === 0) {
    return <div className="text-center text-ink-600 py-8">No entries yet</div>;
  }

  const entriesWithMood = entries.filter((e) => e.mood);
  const averageMood =
    entriesWithMood.reduce((sum, e) => sum + MOOD_VALUES[e.mood!], 0) / entriesWithMood.length;

  const moodCounts = entries.reduce((acc, e) => {
    if (e.mood) {
      acc[e.mood] = (acc[e.mood] || 0) + 1;
    }
    return acc;
  }, {} as Record<MoodType, number>);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-3xl font-bold">{averageMood.toFixed(1)}</div>
        <div className="text-sm text-ink-600">Average Mood</div>
      </div>

      <div className="space-y-2">
        {(Object.entries(moodCounts) as [MoodType, number][]).map(([mood, count]) => (
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
