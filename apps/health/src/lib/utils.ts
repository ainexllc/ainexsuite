import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { HabitCompletion } from '@ainexsuite/types';
import { isSameDay, subDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateStreak(
  habitId: string,
  completions: HabitCompletion[]
): { current: number; best: number } {
  const habitCompletions = completions
    .filter((c) => c.habitId === habitId)
    .sort((a, b) => b.date - a.date);

  if (habitCompletions.length === 0) {
    return { current: 0, best: 0 };
  }

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  let checkDate = new Date();

  // Calculate current streak
  for (const completion of habitCompletions) {
    if (isSameDay(new Date(completion.date), checkDate)) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  // Calculate best streak
  checkDate = new Date(habitCompletions[0].date);
  tempStreak = 1;

  for (let i = 1; i < habitCompletions.length; i++) {
    const expectedDate = subDays(checkDate, 1);
    if (isSameDay(new Date(habitCompletions[i].date), expectedDate)) {
      tempStreak++;
      checkDate = expectedDate;
    } else {
      bestStreak = Math.max(bestStreak, tempStreak);
      tempStreak = 1;
      checkDate = new Date(habitCompletions[i].date);
    }
  }

  bestStreak = Math.max(bestStreak, tempStreak, currentStreak);

  return { current: currentStreak, best: bestStreak };
}
