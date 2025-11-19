// apps/grow/src/lib/date-utils.ts
import { format, isSameDay, subDays, startOfWeek, endOfWeek, isWithinInterval, getDay } from 'date-fns';
import { Habit, Completion } from '../types/models';

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function isHabitDueToday(habit: Habit, date: Date = new Date()): boolean {
  if (habit.isFrozen) return false;

  const { type, daysOfWeek, intervalDays } = habit.schedule;
  
  // Daily
  if (type === 'daily') return true;
  
  // Specific Days
  if (type === 'specific_days' && daysOfWeek) {
    const currentDay = getDay(date); // 0 (Sun) - 6 (Sat)
    return daysOfWeek.includes(currentDay);
  }

  // Interval (Simplistic MVP check - refined later with start date)
  if (type === 'interval' && intervalDays) {
    // Logic would need a "last completed" or "start date" to be accurate
    // For MVP: Check if last completed was < intervalDays ago
    return true; // Placeholder
  }
  
  // Weekly (Frequency) - Logic handled by checking completions count vs target
  if (type === 'weekly') return true;

  return false;
}

export function calculateStreak(habit: Habit, completions: Completion[]): number {
  // Filter completions for this habit
  const habitCompletions = completions
    .filter(c => c.habitId === habit.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first

  if (habitCompletions.length === 0) return 0;

  let streak = 0;
  let checkDate = new Date();
  
  // Check if completed today
  const todayStr = getTodayDateString();
  const doneToday = habitCompletions.some(c => c.date === todayStr);
  
  if (doneToday) {
    streak++;
  } else {
    // If not done today, check yesterday. If not done yesterday, streak is broken (unless frozen)
    // For simplicity, we start checking from yesterday
    checkDate = subDays(checkDate, 1);
  }

  // Iterate backwards
  // This is a simplified streak logic for daily habits. 
  // Complex schedules need more robust calendar checking.
  
  // MVP: Just counting consecutive daily logs for now
  return streak; 
}

export function getCompletionStatus(habit: Habit, completions: Completion[], date: string): boolean {
  return completions.some(c => c.habitId === habit.id && c.date === date);
}
