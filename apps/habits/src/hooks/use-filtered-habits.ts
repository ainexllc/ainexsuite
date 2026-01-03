'use client';

import { useMemo } from 'react';
import type { Habit, Completion } from '@/types/models';
import type { HabitFilters } from './use-habit-filters';
import { getHabitStatus, getTodayDateString } from '@/lib/date-utils';

interface UseFilteredHabitsOptions {
  habits: Habit[];
  filters: HabitFilters;
  completions?: Completion[];
}

export function useFilteredHabits({ habits, filters, completions = [] }: UseFilteredHabitsOptions): Habit[] {
  return useMemo(() => {
    const today = getTodayDateString();

    return habits.filter(habit => {
      // Search query matches title or description
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesTitle = habit.title.toLowerCase().includes(query);
        const matchesDesc = habit.description?.toLowerCase().includes(query) ?? false;
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Category filter
      if (filters.categories.length > 0) {
        if (!habit.category || !filters.categories.includes(habit.category)) {
          return false;
        }
      }

      // Assignee filter
      if (filters.assigneeIds.length > 0) {
        const hasMatchingAssignee = habit.assigneeIds.some(
          id => filters.assigneeIds.includes(id)
        );
        if (!hasMatchingAssignee) return false;
      }

      // Status filter
      if (filters.status !== 'all') {
        switch (filters.status) {
          case 'frozen':
            if (!habit.isFrozen) return false;
            break;
          case 'due': {
            if (habit.isFrozen) return false;
            const status = getHabitStatus(habit, completions);
            // Due means it's scheduled for today and not completed
            if (status !== 'due') return false;
            break;
          }
          case 'completed': {
            // Completed today
            const isCompletedToday = completions.some(
              c => c.habitId === habit.id && c.date === today
            );
            if (!isCompletedToday) return false;
            break;
          }
        }
      }

      return true;
    });
  }, [habits, filters, completions]);
}
