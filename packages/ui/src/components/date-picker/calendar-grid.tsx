'use client';

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  getCalendarDays,
  isSameMonth,
  isSameDay,
  isToday,
  isInRange,
  isRangeStart,
  isRangeEnd,
  isDateDisabled,
  formatMonthYear,
  DAYS_SHORT,
} from './utils';
import type { CalendarGridProps } from './types';

interface CalendarGridFullProps extends CalendarGridProps {
  onPrevMonth: () => void;
  onNextMonth: () => void;
  showNavigation?: boolean;
}

export function CalendarGrid({
  currentMonth,
  selectedDate,
  selectedRange,
  hoverDate,
  onDateClick,
  onDateHover,
  onPrevMonth,
  onNextMonth,
  minDate,
  maxDate,
  isRangeMode = false,
  showNavigation = true,
  size = 'md',
}: CalendarGridFullProps) {
  const weeks = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  const sizeClasses = {
    sm: {
      container: 'p-2',
      header: 'mb-2',
      headerText: 'text-sm',
      navButton: 'p-1',
      navIcon: 'h-4 w-4',
      dayHeader: 'text-xs',
      dayCell: 'h-7 w-7 text-xs',
      gap: 'gap-0.5',
    },
    md: {
      container: 'p-3',
      header: 'mb-3',
      headerText: 'text-base',
      navButton: 'p-1.5',
      navIcon: 'h-4 w-4',
      dayHeader: 'text-xs',
      dayCell: 'h-9 w-9 text-sm',
      gap: 'gap-1',
    },
    lg: {
      container: 'p-4',
      header: 'mb-4',
      headerText: 'text-lg',
      navButton: 'p-2',
      navIcon: 'h-5 w-5',
      dayHeader: 'text-sm',
      dayCell: 'h-10 w-10 text-sm',
      gap: 'gap-1.5',
    },
  };

  const s = sizeClasses[size];

  // Helper to check if date is in range (including hover preview)
  const getDateRangeState = (date: Date) => {
    if (!isRangeMode) {
      return {
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
        isStart: false,
        isEnd: false,
        isInRange: false,
      };
    }

    // For range mode
    const range = selectedRange || { start: null, end: null };

    // If we have a start but no end, and we're hovering, show preview
    if (range.start && !range.end && hoverDate) {
      const actualStart = hoverDate > range.start ? range.start : hoverDate;
      const actualEnd = hoverDate > range.start ? hoverDate : range.start;

      return {
        isSelected: isSameDay(date, range.start),
        isStart: isSameDay(date, actualStart),
        isEnd: isSameDay(date, actualEnd),
        isInRange: isInRange(date, { start: actualStart, end: actualEnd }),
      };
    }

    return {
      isSelected: isRangeStart(date, range) || isRangeEnd(date, range),
      isStart: isRangeStart(date, range),
      isEnd: isRangeEnd(date, range),
      isInRange: isInRange(date, range),
    };
  };

  return (
    <div className={cn(s.container)}>
      {/* Header with navigation */}
      {showNavigation && (
        <div className={cn('flex items-center justify-between', s.header)}>
          <button
            type="button"
            onClick={onPrevMonth}
            className={cn(
              'rounded-full transition-colors',
              'text-muted-foreground hover:text-foreground hover:bg-foreground/10',
              s.navButton
            )}
            aria-label="Previous month"
          >
            <ChevronLeft className={s.navIcon} />
          </button>

          <span className={cn('font-semibold text-foreground', s.headerText)}>
            {formatMonthYear(currentMonth)}
          </span>

          <button
            type="button"
            onClick={onNextMonth}
            className={cn(
              'rounded-full transition-colors',
              'text-muted-foreground hover:text-foreground hover:bg-foreground/10',
              s.navButton
            )}
            aria-label="Next month"
          >
            <ChevronRight className={s.navIcon} />
          </button>
        </div>
      )}

      {/* Day headers */}
      <div className={cn('grid grid-cols-7', s.gap, 'mb-1')}>
        {DAYS_SHORT.map((day) => (
          <div
            key={day}
            className={cn(
              'text-center font-medium text-muted-foreground',
              s.dayHeader
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={cn('grid grid-cols-7', s.gap)}>
        {weeks.map((week, weekIdx) =>
          week.map((date, dayIdx) => {
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const dateIsToday = isToday(date);
            const disabled = isDateDisabled(date, minDate, maxDate);
            const { isSelected, isStart, isEnd, isInRange: inRange } = getDateRangeState(date);

            return (
              <button
                key={`${weekIdx}-${dayIdx}`}
                type="button"
                onClick={() => !disabled && onDateClick(date)}
                onMouseEnter={() => onDateHover?.(date)}
                onMouseLeave={() => onDateHover?.(null)}
                disabled={disabled}
                className={cn(
                  'rounded-lg flex items-center justify-center transition-all',
                  s.dayCell,
                  // Base states
                  !isCurrentMonth && 'text-muted-foreground opacity-40',
                  isCurrentMonth && !isSelected && !inRange && 'text-foreground',
                  // Today indicator
                  dateIsToday && !isSelected && 'ring-2 ring-[var(--color-primary)]',
                  // Selected state
                  isSelected && 'bg-[var(--color-primary)] text-white font-medium',
                  // Range states
                  inRange && !isSelected && 'bg-[var(--color-primary)]/20',
                  isStart && 'rounded-l-lg rounded-r-none',
                  isEnd && 'rounded-r-lg rounded-l-none',
                  isStart && isEnd && 'rounded-lg',
                  // Hover state
                  !isSelected && !disabled && 'hover:bg-foreground/10',
                  // Disabled state
                  disabled && 'opacity-30 cursor-not-allowed',
                )}
                aria-label={date.toDateString()}
                aria-pressed={isSelected}
                aria-disabled={disabled}
              >
                {date.getDate()}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
