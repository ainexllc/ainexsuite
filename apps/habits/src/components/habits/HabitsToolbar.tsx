'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, Check, ChevronDown, User } from 'lucide-react';
import { HABIT_CATEGORIES, type HabitCategory, type Member } from '@/types/models';
import type { HabitFilters, HabitStatus } from '@/hooks/use-habit-filters';
import { cn } from '@/lib/utils';

interface HabitsToolbarProps {
  filters: HabitFilters;
  onSearchChange: (query: string) => void;
  onCategoryToggle: (category: HabitCategory) => void;
  onAssigneeToggle: (assigneeId: string) => void;
  onStatusChange: (status: HabitStatus) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  members?: Member[];
}

const STATUS_OPTIONS: { value: HabitStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'due', label: 'Due Today' },
  { value: 'completed', label: 'Completed' },
  { value: 'frozen', label: 'Frozen' },
];

export function HabitsToolbar({
  filters,
  onSearchChange,
  onCategoryToggle,
  onAssigneeToggle,
  onStatusChange,
  onClearFilters,
  hasActiveFilters,
  activeFilterCount,
  members = [],
}: HabitsToolbarProps) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Close filter menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const handleSearchBlur = () => {
    if (!filters.searchQuery) {
      setIsSearchExpanded(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className={cn(
        'flex items-center transition-all duration-200',
        isSearchExpanded ? 'flex-1 min-w-[200px]' : 'w-auto'
      )}>
        {isSearchExpanded ? (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onBlur={handleSearchBlur}
              placeholder="Search habits..."
              className="w-full pl-9 pr-8 py-2 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsSearchExpanded(true)}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Button & Dropdown */}
      <div className="relative" ref={filterMenuRef}>
        <button
          onClick={() => setShowFilterMenu(!showFilterMenu)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
            'bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10',
            hasActiveFilters
              ? 'text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
              : 'text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white'
          )}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-500 text-white text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={cn(
            'h-3.5 w-3.5 transition-transform',
            showFilterMenu && 'rotate-180'
          )} />
        </button>

        {/* Filter Menu */}
        {showFilterMenu && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">Filters</span>
              {hasActiveFilters && (
                <button
                  onClick={onClearFilters}
                  className="text-xs text-indigo-500 hover:text-indigo-600 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {/* Status Filter */}
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                <h4 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Status
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onStatusChange(option.value)}
                      className={cn(
                        'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        filters.status === option.value
                          ? 'bg-indigo-500 text-white'
                          : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                <h4 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Categories
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {HABIT_CATEGORIES.map((cat) => {
                    const isSelected = filters.categories.includes(cat.value);
                    return (
                      <button
                        key={cat.value}
                        onClick={() => onCategoryToggle(cat.value)}
                        className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                          isSelected
                            ? 'text-white'
                            : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10'
                        )}
                        style={isSelected ? { backgroundColor: cat.color } : undefined}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                        {isSelected && <Check className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assignee Filter (if members available) */}
              {members.length > 0 && (
                <div className="p-4">
                  <h4 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Assigned To
                  </h4>
                  <div className="space-y-1">
                    {members.map((member) => {
                      const isSelected = filters.assigneeIds.includes(member.uid);
                      return (
                        <button
                          key={member.uid}
                          onClick={() => onAssigneeToggle(member.uid)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                            isSelected
                              ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                              : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5'
                          )}
                        >
                          <div className={cn(
                            'h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium',
                            isSelected
                              ? 'bg-indigo-500 text-white'
                              : 'bg-zinc-200 dark:bg-zinc-600 text-zinc-600 dark:text-zinc-200'
                          )}>
                            {member.displayName.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="flex-1 text-left">{member.displayName}</span>
                          {isSelected && <Check className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Active filter pills (optional, for quick visibility) */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.categories.map((cat) => {
            const category = HABIT_CATEGORIES.find(c => c.value === cat);
            return (
              <span
                key={cat}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: category?.color }}
              >
                {category?.icon} {category?.label}
                <button
                  onClick={() => onCategoryToggle(cat)}
                  className="ml-0.5 p-0.5 rounded-full hover:bg-white/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          {filters.assigneeIds.map((uid) => {
            const member = members.find(m => m.uid === uid);
            return (
              <span
                key={uid}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
              >
                <User className="h-3 w-3" />
                {member?.displayName || 'Unknown'}
                <button
                  onClick={() => onAssigneeToggle(uid)}
                  className="ml-0.5 p-0.5 rounded-full hover:bg-indigo-500/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
