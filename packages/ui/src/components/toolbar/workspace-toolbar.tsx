'use client';

import { type ReactNode } from 'react';
import { Search } from 'lucide-react';
import { clsx } from 'clsx';
import { ViewToggleGroup } from './view-toggle-group';
import { FilterDropdown } from './filter-dropdown';
import { SortDropdown } from './sort-dropdown';
import type { ViewOption, SortConfig, SortOption } from './types';

export interface WorkspaceToolbarProps<TViewMode extends string> {
  // View Toggle (required)
  viewMode: TViewMode;
  onViewModeChange: (mode: TViewMode) => void;
  viewOptions: ViewOption<TViewMode>[];

  // Search (optional)
  onSearchClick?: () => void;
  isSearchActive?: boolean;

  // Filtering (optional)
  filterContent?: ReactNode;
  activeFilterCount?: number;
  onFilterReset?: () => void;

  // Sorting (optional)
  sort?: SortConfig;
  onSortChange?: (sort: SortConfig) => void;
  sortOptions?: SortOption[];

  // Slots for app-specific additions
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;

  // Layout control
  /**
   * Position of view toggle icons
   * - 'left': View toggles on left, filter/sort on right (default)
   * - 'right': All controls on right with view toggles furthest right
   */
  viewPosition?: 'left' | 'right';

  // Styling
  className?: string;
}

export function WorkspaceToolbar<TViewMode extends string>({
  viewMode,
  onViewModeChange,
  viewOptions,
  onSearchClick,
  isSearchActive = false,
  filterContent,
  activeFilterCount = 0,
  onFilterReset,
  sort,
  onSortChange,
  sortOptions,
  leftSlot,
  rightSlot,
  viewPosition = 'left',
  className,
}: WorkspaceToolbarProps<TViewMode>) {
  const hasSearch = !!onSearchClick;
  const hasFilters = !!filterContent;
  const hasSort = !!sort && !!onSortChange && !!sortOptions?.length;

  const viewToggle = (
    <ViewToggleGroup
      value={viewMode}
      onChange={onViewModeChange}
      options={viewOptions}
    />
  );

  // Filter & Sort controls grouped in a pill container
  const filterSortControls = (hasSearch || hasFilters || hasSort) ? (
    <div
      className={clsx(
        'inline-flex items-center gap-1 rounded-full p-1 shadow-sm border',
        'bg-white/5 dark:bg-white/5 backdrop-blur-sm border-white/10 dark:border-white/10',
        'light:bg-zinc-900/5 light:border-zinc-900/10'
      )}
    >
      {hasSearch && (
        <button
          onClick={onSearchClick}
          aria-label="Search"
          title="Search"
          className={clsx(
            'h-8 w-8 inline-flex items-center justify-center rounded-full transition-all',
            isSearchActive
              ? 'bg-[var(--color-primary)] text-white shadow-md'
              : 'text-zinc-400 hover:bg-white/10 hover:text-white dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white'
          )}
        >
          <Search className="h-4 w-4" />
        </button>
      )}

      {hasFilters && (
        <FilterDropdown
          activeCount={activeFilterCount}
          onReset={onFilterReset}
        >
          {filterContent}
        </FilterDropdown>
      )}

      {hasSort && (
        <SortDropdown
          value={sort}
          onChange={onSortChange}
          options={sortOptions}
        />
      )}
    </div>
  ) : null;

  // Centered layout: all controls centered horizontally with view toggles furthest right
  if (viewPosition === 'right') {
    return (
      <div className={clsx('flex w-full items-center justify-center gap-2', className)}>
        {filterSortControls}
        {rightSlot}
        {viewToggle}
      </div>
    );
  }

  // Default left-aligned layout
  return (
    <div className={clsx('flex items-center justify-between gap-4', className)}>
      {/* Left side: View toggles + leftSlot */}
      <div className="flex items-center gap-3">
        {viewToggle}
        {leftSlot}
      </div>

      {/* Right side: Filter + Sort + rightSlot */}
      <div className="flex items-center gap-2">
        {filterSortControls}
        {rightSlot}
      </div>
    </div>
  );
}
