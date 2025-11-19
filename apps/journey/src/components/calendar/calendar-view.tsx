'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { JournalEntry } from '@ainexsuite/types';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface CalendarViewProps {
  entries: JournalEntry[];
}

export function CalendarView({ entries }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const entriesByDay = useMemo(() => {
    const map = new Map<string, JournalEntry[]>();
    entries.forEach(entry => {
      // Ensure entry.date is treated as a string 'YYYY-MM-DD'
      const entryDate = typeof entry.date === 'number'
        ? new Date(entry.date).toISOString().split('T')[0]
        : entry.date;

      if (entryDate) {
        const existing = map.get(entryDate) || [];
        map.set(entryDate, [...existing, entry]);
      }
    });
    return map;
  }, [entries]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday, etc.

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const numDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];

    // Empty leading days
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-prev-${i}`} className="calendar-day empty" />);
    }

    // Days of the month
    for (let i = 1; i <= numDays; i++) {
      const day = new Date(year, month, i);
      const dayKey = day.toISOString().split('T')[0];
      const hasEntries = entriesByDay.has(dayKey);
      const isToday = dayKey === todayKey;

      days.push(
        <Link 
          key={`day-${i}`}
          href={hasEntries ? `/workspace/entries?date=${dayKey}` : '#'}
          className={cn(
            "calendar-day relative flex aspect-square items-center justify-center rounded-lg text-sm font-medium",
            "transition-colors duration-200",
            isToday && "border-2 border-accent-500",
            hasEntries
              ? "bg-accent-500/20 text-text-primary hover:bg-accent-500/40 cursor-pointer"
              : "text-text-muted-foreground hover:bg-surface-hover",
            !hasEntries && "pointer-events-none"
          )}
        >
          {i}
          {hasEntries && (
            <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-accent-500" />
          )}
        </Link>
      );
    }
    return days;
  };

  return (
    <Card className="p-6 border-theme-border bg-theme-surface">
      <div className="flex items-center justify-between mb-6">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-surface-hover">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-xl font-semibold">
          {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-surface-hover">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-text-muted-foreground">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 mt-2">
        {renderCalendarDays()}
      </div>
    </Card>
  );
}
