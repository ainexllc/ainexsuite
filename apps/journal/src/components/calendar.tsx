'use client';

import type { JournalEntry } from '@ainexsuite/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';

interface CalendarProps {
  entries: JournalEntry[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onCreateEntry: (date: Date) => void;
}

export function Calendar({ entries, selectedDate, onSelectDate, onCreateEntry }: CalendarProps) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const hasEntry = (date: Date) => {
    return entries.some((e) => isSameDay(new Date(e.date), date));
  };

  return (
    <div className="surface-card rounded-lg p-6">
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-ink-600 p-2">
            {day}
          </div>
        ))}

        {days.map((day) => {
          const hasEntryOnDay = hasEntry(day);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => {
                onSelectDate(day);
                if (!hasEntryOnDay) {
                  onCreateEntry(day);
                }
              }}
              className={`
                aspect-square rounded-lg p-2 text-sm font-medium transition-all relative
                ${isSelected ? 'bg-accent-500 text-white' : 'hover:bg-surface-hover'}
                ${isTodayDate && !isSelected ? 'ring-2 ring-accent-500' : ''}
              `}
            >
              {format(day, 'd')}
              {hasEntryOnDay && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-current rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
