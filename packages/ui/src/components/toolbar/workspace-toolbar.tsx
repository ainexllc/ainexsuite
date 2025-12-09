'use client';

import { type ReactNode } from 'react';
import { clsx } from 'clsx';
import { ViewToggleGroup, type ViewToggleGroupProps } from './view-toggle-group';
import { FilterDropdown, type FilterDropdownProps } from './filter-dropdown';
import { SortDropdown, type SortDropdownProps } from './sort-dropdown';
import type { ViewOption, SortConfig, SortOption } from './types';

export interface WorkspaceToolbarProps<TViewMode extends string> {
  // View Toggle (required)
  viewMode: TViewMode;
  onViewModeChange: (mode: TViewMode) => void;
  viewOptions: ViewOption<TViewMode>[];

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

  // Styling
  className?: string;
}

export function WorkspaceToolbar<TViewMode extends string>({
  viewMode,
  onViewModeChange,
  viewOptions,
  filterContent,
  activeFilterCount = 0,
  onFilterReset,
  sort,
  onSortChange,
  sortOptions,
  leftSlot,
  rightSlot,
  className,
}: WorkspaceToolbarProps<TViewMode>) {
  const hasFilters = !!filterContent;
  const hasSort = !!sort && !!onSortChange && !!sortOptions?.length;

  return (
    <div className={clsx('flex items-center justify-between gap-4', className)}>
      {/* Left side: View toggles + leftSlot */}
      <div className="flex items-center gap-3">
        <ViewToggleGroup
          value={viewMode}
          onChange={onViewModeChange}
          options={viewOptions}
        />
        {leftSlot}
      </div>

      {/* Right side: Filter + Sort + rightSlot */}
      <div className="flex items-center gap-2">
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

        {rightSlot}
      </div>
    </div>
  );
}
