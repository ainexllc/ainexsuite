'use client';

import type { Habit, HabitCompletion } from '@ainexsuite/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isFuture } from 'date-fns';
import { createCompletion, deleteCompletion } from '@/lib/habits';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface HabitCalendarProps {
  habit: Habit;
  completions: HabitCompletion[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onUpdate: () => void;
}

export function HabitCalendar({ habit, completions, selectedDate, onSelectDate, onUpdate }: HabitCalendarProps) {
  const [loading, setLoading] = useState(false);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const isCompleted = (date: Date) => {
    return completions.some((c) => isSameDay(new Date(c.date), date));
  };

  const handleToggle = async (date: Date) => {
    if (isFuture(date)) return;

    setLoading(true);
    try {
      const existing = completions.find((c) => isSameDay(new Date(c.date), date));

      if (existing) {
        await deleteCompletion(existing.id);
      } else {
        await createCompletion(habit.id, date.getTime());
      }

      onUpdate();
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    } finally {
      setLoading(false);
    }
  };

  const completionRate = completions.length / days.length;

  return (
    <div className="surface-card rounded-lg p-6">
      <div className="mb-4">
        <h3 className="font-semibold mb-1" style={{ color: habit.color }}>
          {habit.name}
        </h3>
        <p className="text-sm text-ink-600">
          {completions.length}/{days.length} days ({Math.round(completionRate * 100)}%)
        </p>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-xs font-medium text-ink-600 p-1">
            {day}
          </div>
        ))}

        {days.map((day) => {
          const completed = isCompleted(day);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const future = isFuture(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => {
                onSelectDate(day);
                handleToggle(day);
              }}
              disabled={future || loading}
              className={cn(
                'aspect-square rounded-lg text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed',
                completed && 'text-white',
                !completed && 'hover:bg-surface-hover',
                isSelected && 'ring-2 ring-accent-500',
                isTodayDate && !isSelected && 'ring-1 ring-ink-600'
              )}
              style={{
                backgroundColor: completed ? habit.color : undefined,
              }}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
