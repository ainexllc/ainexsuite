'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import type { ActivityData } from './types';

export interface ActivityCalendarProps {
  activityData: ActivityData;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  currentMonth?: Date;
  onMonthChange?: (date: Date) => void;
  className?: string;
  /** Size variant - compact for small spaces, default for normal, large for full-width */
  size?: 'compact' | 'default' | 'large';
}

const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_MINI = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function isSameDay(a: Date, b: Date): boolean {
  return toISODateString(a) === toISODateString(b);
}

export function ActivityCalendar({
  activityData,
  onDateSelect,
  selectedDate,
  currentMonth: controlledMonth,
  onMonthChange,
  className,
  size = 'default',
}: ActivityCalendarProps) {
  const [internalMonth, setInternalMonth] = useState(() => new Date());

  const currentMonth = controlledMonth ?? internalMonth;
  const setCurrentMonth = onMonthChange ?? setInternalMonth;

  const today = useMemo(() => new Date(), []);

  const { weeks, monthStart } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    // Start from the Sunday before the first day of the month
    const calendarStart = new Date(monthStart);
    calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay());

    // End on the Saturday after the last day of the month
    const calendarEnd = new Date(monthEnd);
    calendarEnd.setDate(calendarEnd.getDate() + (6 - calendarEnd.getDay()));

    const weeks: Date[][] = [];
    let currentDate = new Date(calendarStart);

    while (currentDate <= calendarEnd) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }

    return { weeks, monthStart };
  }, [currentMonth]);

  const goToPreviousMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonth(prev);
  };

  const goToNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };

  const getActivityLevel = (date: Date): number => {
    const dateStr = toISODateString(date);
    return activityData[dateStr] || 0;
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === monthStart.getMonth();
  };

  // Calculate stats for the month
  const monthStats = useMemo(() => {
    let totalItems = 0;
    let activeDays = 0;

    weeks.forEach(week => {
      week.forEach(date => {
        if (isCurrentMonth(date)) {
          const activity = getActivityLevel(date);
          if (activity > 0) {
            activeDays++;
            totalItems += activity;
          }
        }
      });
    });

    return { totalItems, activeDays };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weeks, activityData, monthStart]);

  return (
    <div className={clsx(
      'bg-background/40 backdrop-blur-sm rounded-xl border border-border',
      size === 'compact' && 'p-3',
      size === 'default' && 'p-4 md:p-6',
      size === 'large' && 'p-6 md:p-8',
      className
    )}>
      {/* Header */}
      <div className={clsx(
        'flex items-center justify-between',
        size === 'compact' && 'mb-3',
        size === 'default' && 'mb-4 md:mb-6',
        size === 'large' && 'mb-6 md:mb-8',
      )}>
        <button
          onClick={goToPreviousMonth}
          className={clsx(
            'hover:bg-foreground/10 rounded-full transition-colors',
            size === 'compact' && 'p-1',
            size === 'default' && 'p-1.5 md:p-2',
            size === 'large' && 'p-2 md:p-3',
          )}
          aria-label="Previous month"
        >
          <ChevronLeft className={clsx(
            'text-muted-foreground',
            size === 'compact' && 'h-4 w-4',
            size === 'default' && 'h-4 w-4 md:h-5 md:w-5',
            size === 'large' && 'h-5 w-5 md:h-6 md:w-6',
          )} />
        </button>
        <div className="text-center">
          <h3 className={clsx(
            'font-semibold text-foreground',
            size === 'compact' && 'text-sm',
            size === 'default' && 'text-sm md:text-lg',
            size === 'large' && 'text-lg md:text-xl',
          )}>
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          {size !== 'compact' && (
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              {monthStats.activeDays} active days, {monthStats.totalItems} items
            </p>
          )}
        </div>
        <button
          onClick={goToNextMonth}
          className={clsx(
            'hover:bg-foreground/10 rounded-full transition-colors',
            size === 'compact' && 'p-1',
            size === 'default' && 'p-1.5 md:p-2',
            size === 'large' && 'p-2 md:p-3',
          )}
          aria-label="Next month"
        >
          <ChevronRight className={clsx(
            'text-muted-foreground',
            size === 'compact' && 'h-4 w-4',
            size === 'default' && 'h-4 w-4 md:h-5 md:w-5',
            size === 'large' && 'h-5 w-5 md:h-6 md:w-6',
          )} />
        </button>
      </div>

      {/* Days of week header */}
      <div className={clsx(
        'grid grid-cols-7',
        size === 'compact' && 'gap-0.5 mb-1',
        size === 'default' && 'gap-1 md:gap-2 mb-2 md:mb-3',
        size === 'large' && 'gap-2 md:gap-3 mb-3 md:mb-4',
      )}>
        {(size === 'compact' ? DAYS_MINI : DAYS_SHORT).map((day, idx) => (
          <div
            key={day + idx}
            className={clsx(
              'text-center font-medium text-muted-foreground uppercase',
              size === 'compact' && 'text-[9px]',
              size === 'default' && 'text-[10px] md:text-xs',
              size === 'large' && 'text-xs md:text-sm',
            )}
            title={DAYS_FULL[idx]}
          >
            <span className="hidden md:inline">{size === 'large' ? DAYS_FULL[idx].slice(0, 3) : day}</span>
            <span className="md:hidden">{size === 'compact' ? day : DAYS_MINI[idx]}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={clsx(
        'grid grid-cols-7',
        size === 'compact' && 'gap-0.5',
        size === 'default' && 'gap-1 md:gap-2',
        size === 'large' && 'gap-2 md:gap-3',
      )}>
        {weeks.map((week, weekIndex) =>
          week.map((date, dayIndex) => {
            const activity = getActivityLevel(date);
            const isToday = isSameDay(date, today);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const inMonth = isCurrentMonth(date);

            return (
              <button
                key={`${weekIndex}-${dayIndex}`}
                onClick={() => onDateSelect?.(date)}
                disabled={!onDateSelect}
                className={clsx(
                  'relative aspect-square flex items-center justify-center rounded-lg transition-all',
                  size === 'compact' && 'text-xs rounded-md',
                  size === 'default' && 'text-xs md:text-sm',
                  size === 'large' && 'text-sm md:text-base',
                  !inMonth && 'opacity-30',
                  isToday && 'ring-2 ring-[var(--color-primary)]',
                  isSelected && 'bg-[var(--color-primary)] text-foreground',
                  !isSelected && onDateSelect && 'hover:bg-foreground/10',
                  !isSelected && inMonth && !activity && 'text-foreground',
                  !isSelected && !inMonth && 'text-muted-foreground',
                  // Activity background - fill the day cell with color
                  !isSelected && activity > 0 && inMonth && 'bg-[var(--color-primary)]/15 text-foreground',
                  !isSelected && activity >= 3 && inMonth && 'bg-[var(--color-primary)]/25',
                  !isSelected && activity >= 5 && inMonth && 'bg-[var(--color-primary)]/40',
                  !isSelected && activity >= 8 && inMonth && 'bg-[var(--color-primary)]/55',
                )}
              >
                <span>{date.getDate()}</span>
                {/* Activity indicator - show count on larger sizes */}
                {activity > 0 && !isSelected && size === 'large' && (
                  <span className={clsx(
                    'absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-medium',
                    'text-[var(--color-primary)]'
                  )}>
                    {activity}
                  </span>
                )}
                {/* Activity dot for smaller sizes */}
                {activity > 0 && !isSelected && size !== 'large' && (
                  <span
                    className={clsx(
                      'absolute rounded-full',
                      size === 'compact' && 'bottom-0 left-1/2 -translate-x-1/2',
                      size === 'default' && 'bottom-0.5 md:bottom-1 left-1/2 -translate-x-1/2',
                      activity === 1 && 'w-1 h-1 bg-[var(--color-primary)]/60',
                      activity === 2 && 'w-1 h-1 md:w-1.5 md:h-1.5 bg-[var(--color-primary)]/80',
                      activity >= 3 && 'w-1.5 h-1.5 md:w-2 md:h-2 bg-[var(--color-primary)]'
                    )}
                  />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className={clsx(
        'flex items-center justify-center text-muted-foreground',
        size === 'compact' && 'gap-2 mt-2 text-[9px]',
        size === 'default' && 'gap-3 mt-4 md:mt-6 text-[10px] md:text-xs',
        size === 'large' && 'gap-4 mt-6 md:mt-8 text-xs md:text-sm',
      )}>
        <div className="flex items-center gap-1.5">
          <span className={clsx(
            'rounded-md bg-[var(--color-primary)]/15',
            size === 'compact' && 'w-3 h-3',
            size === 'default' && 'w-4 h-4 md:w-5 md:h-5',
            size === 'large' && 'w-5 h-5 md:w-6 md:h-6',
          )} />
          <span>1-2</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={clsx(
            'rounded-md bg-[var(--color-primary)]/25',
            size === 'compact' && 'w-3 h-3',
            size === 'default' && 'w-4 h-4 md:w-5 md:h-5',
            size === 'large' && 'w-5 h-5 md:w-6 md:h-6',
          )} />
          <span>3-4</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={clsx(
            'rounded-md bg-[var(--color-primary)]/40',
            size === 'compact' && 'w-3 h-3',
            size === 'default' && 'w-4 h-4 md:w-5 md:h-5',
            size === 'large' && 'w-5 h-5 md:w-6 md:h-6',
          )} />
          <span>5-7</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={clsx(
            'rounded-md bg-[var(--color-primary)]/55',
            size === 'compact' && 'w-3 h-3',
            size === 'default' && 'w-4 h-4 md:w-5 md:h-5',
            size === 'large' && 'w-5 h-5 md:w-6 md:h-6',
          )} />
          <span>8+</span>
        </div>
      </div>
    </div>
  );
}
