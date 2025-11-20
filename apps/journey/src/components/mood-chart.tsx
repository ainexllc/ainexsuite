'use client';

import type { JournalEntry, MoodType } from '@ainexsuite/types';

interface MoodChartProps {
  entries: JournalEntry[];
}

const MOOD_VALUES: Record<MoodType, number> = {
  happy: 5,
  excited: 5,
  grateful: 5,
  peaceful: 4,
  hopeful: 4,
  energetic: 4,
  confident: 4,
  loved: 5,
  inspired: 5,
  content: 4,
  neutral: 3,
  tired: 2,
  confused: 2,
  lonely: 1,
  bored: 2,
  sad: 1,
  anxious: 1,
  angry: 1,
  stressed: 1,
  frustrated: 1,
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
