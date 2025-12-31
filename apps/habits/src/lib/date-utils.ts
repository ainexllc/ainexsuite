// apps/grow/src/lib/date-utils.ts
import {
  format,
  getDay,
  subDays,
  differenceInDays,
  startOfDay,
  parseISO,
  isAfter,
  isBefore,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameDay
} from 'date-fns';
import { Habit, Completion } from '../types/models';

// ============================================
// DATE HELPERS
// ============================================

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function parseDate(dateStr: string): Date {
  return startOfDay(parseISO(dateStr));
}

// ============================================
// HABIT DUE LOGIC
// ============================================

/**
 * Determines if a habit is due on a given date based on its schedule type.
 * Handles: daily, specific_days, weekly (times per week), and interval scheduling.
 */
export function isHabitDueToday(
  habit: Habit,
  completions: Completion[] = [],
  date: Date = new Date()
): boolean {
  if (habit.isFrozen) return false;

  const { type, daysOfWeek, intervalDays, timesPerWeek } = habit.schedule;
  const today = startOfDay(date);

  switch (type) {
    case 'daily':
      return true;

    case 'specific_days': {
      if (!daysOfWeek || daysOfWeek.length === 0) return true;
      const currentDay = getDay(today); // 0 (Sun) - 6 (Sat)
      return daysOfWeek.includes(currentDay);
    }

    case 'interval':
      return isIntervalHabitDue(habit, completions, today, intervalDays || 1);

    case 'weekly':
      return isWeeklyHabitDue(habit, completions, today, timesPerWeek || 1);

    default:
      return true;
  }
}

/**
 * Interval habits are due if the last completion was >= intervalDays ago.
 * If never completed, it's due.
 */
function isIntervalHabitDue(
  habit: Habit,
  completions: Completion[],
  today: Date,
  intervalDays: number
): boolean {
  const habitCompletions = completions.filter(c => c.habitId === habit.id);

  if (habitCompletions.length === 0) {
    // Never completed - due today (or use createdAt as start)
    const createdDate = parseDate(habit.createdAt.split('T')[0]);
    const daysSinceCreation = differenceInDays(today, createdDate);
    return daysSinceCreation >= 0; // Due from creation day
  }

  // Find most recent completion
  const lastCompletion = habitCompletions
    .sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime())[0];

  const lastDate = parseDate(lastCompletion.date);
  const daysSinceLast = differenceInDays(today, lastDate);

  return daysSinceLast >= intervalDays;
}

/**
 * Weekly habits (X times per week) are due if not yet completed enough this week.
 */
function isWeeklyHabitDue(
  habit: Habit,
  completions: Completion[],
  today: Date,
  timesPerWeek: number
): boolean {
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 });

  const thisWeekCompletions = completions.filter(c => {
    if (c.habitId !== habit.id) return false;
    const compDate = parseDate(c.date);
    return !isBefore(compDate, weekStart) && !isAfter(compDate, weekEnd);
  });

  return thisWeekCompletions.length < timesPerWeek;
}

// ============================================
// COMPLETION STATUS
// ============================================

/**
 * Check if a habit was completed on a specific date.
 */
export function getCompletionStatus(
  habit: Habit,
  completions: Completion[],
  date: string
): boolean {
  return completions.some(c => c.habitId === habit.id && c.date === date);
}

/**
 * Check if habit is completed today.
 */
export function isCompletedToday(habit: Habit, completions: Completion[]): boolean {
  const today = getTodayDateString();
  return getCompletionStatus(habit, completions, today);
}

/**
 * Get today's completion for a habit (if exists).
 */
export function getTodayCompletion(
  habit: Habit,
  completions: Completion[]
): Completion | undefined {
  const today = getTodayDateString();
  return completions.find(c => c.habitId === habit.id && c.date === today);
}

// ============================================
// STREAK CALCULATION
// ============================================

/**
 * Calculate streak for a habit based on its schedule type.
 * Returns the current consecutive streak count.
 */
export function calculateStreak(habit: Habit, completions: Completion[]): number {
  const habitCompletions = completions
    .filter(c => c.habitId === habit.id)
    .sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());

  if (habitCompletions.length === 0) return 0;

  const { type, daysOfWeek, intervalDays, timesPerWeek } = habit.schedule;

  switch (type) {
    case 'daily':
      return calculateDailyStreak(habitCompletions, habit.isFrozen);

    case 'specific_days':
      return calculateSpecificDaysStreak(habitCompletions, daysOfWeek || [], habit.isFrozen);

    case 'interval':
      return calculateIntervalStreak(habitCompletions, intervalDays || 1, habit.isFrozen);

    case 'weekly':
      return calculateWeeklyStreak(habitCompletions, timesPerWeek || 1);

    default:
      return calculateDailyStreak(habitCompletions, habit.isFrozen);
  }
}

/**
 * Daily streak: count consecutive days with completions.
 * Streak breaks if a day is missed (unless frozen).
 */
function calculateDailyStreak(completions: Completion[], isFrozen: boolean): number {
  if (completions.length === 0) return 0;

  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);

  // Check if done today or yesterday (streak must be current)
  const mostRecentDate = parseDate(completions[0].date);

  // If not done today AND not done yesterday, streak is 0 (unless frozen)
  if (!isSameDay(mostRecentDate, today) && !isSameDay(mostRecentDate, yesterday)) {
    if (!isFrozen) return 0;
  }

  // Count consecutive days backwards
  let streak = 0;
  let checkDate = isSameDay(mostRecentDate, today) ? today : yesterday;

  const completionDates = new Set(completions.map(c => c.date));

  let continueLoop = true;
  while (continueLoop) {
    const dateStr = getDateString(checkDate);
    if (completionDates.has(dateStr)) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else {
      continueLoop = false;
    }
  }

  return streak;
}

/**
 * Specific days streak: count consecutive scheduled days completed.
 * Only counts days when habit was supposed to be done.
 */
function calculateSpecificDaysStreak(
  completions: Completion[],
  daysOfWeek: number[],
  isFrozen: boolean
): number {
  if (completions.length === 0 || daysOfWeek.length === 0) return 0;

  const today = startOfDay(new Date());
  const completionDates = new Set(completions.map(c => c.date));

  // Find scheduled days going backwards from today
  let streak = 0;
  let checkDate = today;
  let daysChecked = 0;
  const maxDaysToCheck = 365; // Safety limit

  while (daysChecked < maxDaysToCheck) {
    const dayOfWeek = getDay(checkDate);

    if (daysOfWeek.includes(dayOfWeek)) {
      // This was a scheduled day
      const dateStr = getDateString(checkDate);

      if (completionDates.has(dateStr)) {
        streak++;
      } else if (isSameDay(checkDate, today)) {
        // Today not done yet - that's ok, check previous
      } else {
        // Missed a scheduled day - streak broken
        if (!isFrozen) break;
      }
    }

    checkDate = subDays(checkDate, 1);
    daysChecked++;
  }

  return streak;
}

/**
 * Interval streak: count consecutive completions within interval windows.
 * Each completion must happen within intervalDays of the previous.
 */
function calculateIntervalStreak(
  completions: Completion[],
  intervalDays: number,
  isFrozen: boolean
): number {
  if (completions.length === 0) return 0;

  const today = startOfDay(new Date());
  const sortedCompletions = [...completions].sort(
    (a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime()
  );

  // Check if most recent completion is within interval from today
  const mostRecentDate = parseDate(sortedCompletions[0].date);
  const daysSinceLast = differenceInDays(today, mostRecentDate);

  if (daysSinceLast > intervalDays && !isFrozen) {
    return 0; // Streak broken - missed the interval
  }

  // Count consecutive completions within interval windows
  let streak = 1; // First completion counts

  for (let i = 1; i < sortedCompletions.length; i++) {
    const currentDate = parseDate(sortedCompletions[i - 1].date);
    const prevDate = parseDate(sortedCompletions[i].date);
    const gap = differenceInDays(currentDate, prevDate);

    if (gap <= intervalDays) {
      streak++;
    } else {
      break; // Gap too large
    }
  }

  return streak;
}

/**
 * Weekly streak: count consecutive weeks with required completions.
 */
function calculateWeeklyStreak(completions: Completion[], timesPerWeek: number): number {
  if (completions.length === 0) return 0;

  const today = startOfDay(new Date());
  const checkWeekStart = startOfWeek(today, { weekStartsOn: 0 });
  let streak = 0;
  const maxWeeksToCheck = 52; // 1 year

  for (let week = 0; week < maxWeeksToCheck; week++) {
    const weekStart = subDays(checkWeekStart, week * 7);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });

    const weekCompletions = completions.filter(c => {
      const compDate = parseDate(c.date);
      return !isBefore(compDate, weekStart) && !isAfter(compDate, weekEnd);
    });

    if (weekCompletions.length >= timesPerWeek) {
      streak++;
    } else if (week === 0) {
      // Current week not yet complete - that's ok, keep checking
      continue;
    } else {
      break; // Previous week wasn't completed
    }
  }

  return streak;
}

// ============================================
// STREAK UPDATES
// ============================================

/**
 * Calculate and return updated streak values after a new completion.
 */
export function getUpdatedStreakValues(
  habit: Habit,
  completions: Completion[]
): { currentStreak: number; bestStreak: number } {
  const newStreak = calculateStreak(habit, completions);
  const bestStreak = Math.max(habit.bestStreak, newStreak);

  return { currentStreak: newStreak, bestStreak };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get habit status for display.
 */
export type HabitStatus = 'completed' | 'due' | 'not_due' | 'frozen';

export function getHabitStatus(
  habit: Habit,
  completions: Completion[]
): HabitStatus {
  if (habit.isFrozen) return 'frozen';

  const completedToday = isCompletedToday(habit, completions);
  if (completedToday) return 'completed';

  const isDue = isHabitDueToday(habit, completions);
  return isDue ? 'due' : 'not_due';
}

/**
 * Check if a habit's streak is in danger (due but not completed today, with active streak).
 * Returns danger level: 'critical' (will break today), 'warning' (at risk), or null (safe).
 */
export function getStreakDangerLevel(
  habit: Habit,
  completions: Completion[]
): 'critical' | 'warning' | null {
  if (habit.isFrozen) return null;

  const streak = calculateStreak(habit, completions);
  if (streak === 0) return null; // No streak to lose

  const status = getHabitStatus(habit, completions);

  // If due today and not completed, streak is at risk
  if (status === 'due') {
    // Critical if it's late in the day or streak is significant
    if (streak >= 7) return 'critical';
    return 'warning';
  }

  return null;
}

/**
 * Get habits that are at risk of breaking their streak.
 */
export function getHabitsAtRisk(
  habits: Habit[],
  completions: Completion[]
): { habit: Habit; dangerLevel: 'critical' | 'warning'; streak: number }[] {
  return habits
    .filter(h => !h.isFrozen)
    .map(habit => {
      const dangerLevel = getStreakDangerLevel(habit, completions);
      if (!dangerLevel) return null;
      return {
        habit,
        dangerLevel,
        streak: calculateStreak(habit, completions),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => {
      // Critical first, then by streak length (higher first)
      if (a.dangerLevel !== b.dangerLevel) {
        return a.dangerLevel === 'critical' ? -1 : 1;
      }
      return b.streak - a.streak;
    });
}

/**
 * Get all scheduled dates for a habit within a range.
 */
export function getScheduledDates(
  habit: Habit,
  startDate: Date,
  endDate: Date
): Date[] {
  const { type, daysOfWeek } = habit.schedule;
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  switch (type) {
    case 'daily':
      return days;

    case 'specific_days':
      return days.filter(d => daysOfWeek?.includes(getDay(d)));

    default:
      return days;
  }
}
