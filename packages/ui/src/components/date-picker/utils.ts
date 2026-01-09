import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
  isWithinInterval,
  addMonths,
  subMonths,
  addDays,
  addWeeks,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  getHours,
  getMinutes,
  startOfWeek as getStartOfWeek,
  endOfWeek as getEndOfWeek,
} from 'date-fns';
import type { DateRange, PresetOption, RangePresetOption } from './types';

// ============================================
// Calendar Generation
// ============================================

/**
 * Generate an array of weeks (each week is an array of dates) for a given month
 */
export function getCalendarDays(month: Date): Date[][] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Split into weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return weeks;
}

// ============================================
// Date Comparison
// ============================================

export { isSameMonth, isSameDay, isToday };

/**
 * Check if a date is within a range
 */
export function isInRange(date: Date, range: DateRange): boolean {
  if (!range.start || !range.end) return false;
  return isWithinInterval(date, {
    start: startOfDay(range.start),
    end: endOfDay(range.end)
  });
}

/**
 * Check if a date is the start of a range
 */
export function isRangeStart(date: Date, range: DateRange): boolean {
  if (!range.start) return false;
  return isSameDay(date, range.start);
}

/**
 * Check if a date is the end of a range
 */
export function isRangeEnd(date: Date, range: DateRange): boolean {
  if (!range.end) return false;
  return isSameDay(date, range.end);
}

/**
 * Check if a date is disabled (outside min/max bounds)
 */
export function isDateDisabled(date: Date, minDate?: Date, maxDate?: Date): boolean {
  if (minDate && isBefore(date, startOfDay(minDate))) return true;
  if (maxDate && isAfter(date, endOfDay(maxDate))) return true;
  return false;
}

// ============================================
// Date Navigation
// ============================================

export { addMonths, subMonths };

// ============================================
// Date Formatting
// ============================================

/**
 * Format date for display in the input
 */
export function formatDisplayDate(date: Date | null, includeTime = false): string {
  if (!date) return '';

  if (includeTime) {
    return format(date, 'MMM d, yyyy h:mm a');
  }
  return format(date, 'MMM d, yyyy');
}

/**
 * Format date range for display
 */
export function formatDisplayRange(range: DateRange): string {
  if (!range.start && !range.end) return '';
  if (range.start && !range.end) return format(range.start, 'MMM d, yyyy') + ' - ...';
  if (!range.start && range.end) return '... - ' + format(range.end, 'MMM d, yyyy');

  // Same day
  if (range.start && range.end && isSameDay(range.start, range.end)) {
    return format(range.start, 'MMM d, yyyy');
  }

  // Same month
  if (range.start && range.end && isSameMonth(range.start, range.end)) {
    return format(range.start, 'MMM d') + ' - ' + format(range.end, 'd, yyyy');
  }

  // Different months
  return format(range.start!, 'MMM d') + ' - ' + format(range.end!, 'MMM d, yyyy');
}

/**
 * Format month/year header
 */
export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy');
}

/**
 * Format time for display
 */
export function formatTime(date: Date, format12h = true): string {
  return format(date, format12h ? 'h:mm a' : 'HH:mm');
}

// ============================================
// Time Manipulation
// ============================================

/**
 * Set time on a date
 */
export function setTime(date: Date, hours: number, minutes: number, seconds = 0): Date {
  return setSeconds(setMinutes(setHours(date, hours), minutes), seconds);
}

/**
 * Get hours and minutes from a date
 */
export function getTime(date: Date): { hours: number; minutes: number } {
  return {
    hours: getHours(date),
    minutes: getMinutes(date),
  };
}

/**
 * Generate time options for dropdown
 */
export function generateTimeOptions(step: number = 15, format12h = true): string[] {
  const options: string[] = [];

  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += step) {
      const date = setMinutes(setHours(new Date(), h), m);
      options.push(format(date, format12h ? 'h:mm a' : 'HH:mm'));
    }
  }

  return options;
}

// ============================================
// Smart Presets
// ============================================

/**
 * Get smart preset options for single date picker
 */
export function getSmartPresets(): PresetOption[] {
  const today = new Date();

  return [
    { label: 'Today', getValue: () => startOfDay(today) },
    { label: 'Tomorrow', getValue: () => startOfDay(addDays(today, 1)) },
    { label: 'Next week', getValue: () => startOfDay(addWeeks(today, 1)) },
    { label: 'Next month', getValue: () => startOfDay(addMonths(today, 1)) },
  ];
}

/**
 * Get basic preset options for single date picker
 */
export function getBasicPresets(): PresetOption[] {
  const today = new Date();

  return [
    { label: 'Today', getValue: () => startOfDay(today) },
    { label: 'Tomorrow', getValue: () => startOfDay(addDays(today, 1)) },
  ];
}

/**
 * Get smart preset options for date range picker
 */
export function getSmartRangePresets(): RangePresetOption[] {
  const today = new Date();

  return [
    {
      label: 'Today',
      getValue: () => ({ start: startOfDay(today), end: endOfDay(today) })
    },
    {
      label: 'This week',
      getValue: () => ({
        start: getStartOfWeek(today, { weekStartsOn: 0 }),
        end: getEndOfWeek(today, { weekStartsOn: 0 })
      })
    },
    {
      label: 'This month',
      getValue: () => ({ start: startOfMonth(today), end: endOfMonth(today) })
    },
    {
      label: 'Last 7 days',
      getValue: () => ({ start: startOfDay(addDays(today, -6)), end: endOfDay(today) })
    },
    {
      label: 'Last 30 days',
      getValue: () => ({ start: startOfDay(addDays(today, -29)), end: endOfDay(today) })
    },
  ];
}

// ============================================
// Day Labels
// ============================================

export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAYS_MINI = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
