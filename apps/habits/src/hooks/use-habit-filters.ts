'use client';

import { useState, useCallback, useMemo } from 'react';
import type { HabitCategory } from '@/types/models';

export type HabitStatus = 'all' | 'due' | 'completed' | 'frozen';

export interface HabitFilters {
  searchQuery: string;
  categories: HabitCategory[];
  assigneeIds: string[];
  status: HabitStatus;
}

const DEFAULT_FILTERS: HabitFilters = {
  searchQuery: '',
  categories: [],
  assigneeIds: [],
  status: 'all',
};

interface UseHabitFiltersResult {
  filters: HabitFilters;
  setSearchQuery: (query: string) => void;
  setCategories: (categories: HabitCategory[]) => void;
  toggleCategory: (category: HabitCategory) => void;
  setAssigneeIds: (assigneeIds: string[]) => void;
  toggleAssignee: (assigneeId: string) => void;
  setStatus: (status: HabitStatus) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export function useHabitFilters(): UseHabitFiltersResult {
  const [filters, setFilters] = useState<HabitFilters>(DEFAULT_FILTERS);

  const setSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setCategories = useCallback((categories: HabitCategory[]) => {
    setFilters(prev => ({ ...prev, categories }));
  }, []);

  const toggleCategory = useCallback((category: HabitCategory) => {
    setFilters(prev => {
      const newCategories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories: newCategories };
    });
  }, []);

  const setAssigneeIds = useCallback((assigneeIds: string[]) => {
    setFilters(prev => ({ ...prev, assigneeIds }));
  }, []);

  const toggleAssignee = useCallback((assigneeId: string) => {
    setFilters(prev => {
      const newAssigneeIds = prev.assigneeIds.includes(assigneeId)
        ? prev.assigneeIds.filter(id => id !== assigneeId)
        : [...prev.assigneeIds, assigneeId];
      return { ...prev, assigneeIds: newAssigneeIds };
    });
  }, []);

  const setStatus = useCallback((status: HabitStatus) => {
    setFilters(prev => ({ ...prev, status }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchQuery !== '' ||
      filters.categories.length > 0 ||
      filters.assigneeIds.length > 0 ||
      filters.status !== 'all'
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.categories.length > 0) count++;
    if (filters.assigneeIds.length > 0) count++;
    if (filters.status !== 'all') count++;
    return count;
  }, [filters]);

  return {
    filters,
    setSearchQuery,
    setCategories,
    toggleCategory,
    setAssigneeIds,
    toggleAssignee,
    setStatus,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
  };
}
