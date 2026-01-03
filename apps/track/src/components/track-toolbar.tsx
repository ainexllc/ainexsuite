"use client";

import { LayoutGrid, List, Calendar, X } from "lucide-react";
import {
  WorkspaceToolbar,
  ActiveFilterChips,
  type ViewOption,
  type SortOption,
} from "@ainexsuite/ui";
import { useSubscriptions } from "@/components/providers/subscription-provider";
import type { ViewType, SortField } from "@/types";

const VIEW_OPTIONS: ViewOption<ViewType>[] = [
  { value: 'grid', icon: LayoutGrid, label: 'Grid view' },
  { value: 'list', icon: List, label: 'List view' },
  { value: 'calendar', icon: Calendar, label: 'Calendar view' },
];

const SORT_OPTIONS: SortOption[] = [
  { field: 'nextPaymentDate', label: 'Next Payment' },
  { field: 'cost', label: 'Cost' },
  { field: 'name', label: 'Name' },
  { field: 'createdAt', label: 'Date Added' },
];

interface TrackToolbarProps {
  viewMode: ViewType;
  onViewModeChange: (mode: ViewType) => void;
}

export function TrackToolbar({ viewMode, onViewModeChange }: TrackToolbarProps) {
  const { 
    searchQuery, 
    setSearchQuery, 
    filters, 
    setFilters, 
    sort, 
    setSort 
  } = useSubscriptions();

  // Convert filters to chips
  const filterChips = [];
  if (filters.category) {
    filterChips.push({ id: 'category', label: filters.category, type: 'filter' });
  }
  if (filters.billingCycle) {
    filterChips.push({ id: 'cycle', label: filters.billingCycle === 'monthly' ? 'Monthly' : 'Yearly', type: 'filter' });
  }
  if (filters.status) {
    filterChips.push({ id: 'status', label: filters.status, type: 'filter' });
  }

  const handleRemoveChip = (id: string) => {
    if (id === 'category') setFilters({ ...filters, category: undefined });
    if (id === 'cycle') setFilters({ ...filters, billingCycle: undefined });
    if (id === 'status') setFilters({ ...filters, status: undefined });
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  return (
    <div className="space-y-2 mb-6">
      <div className="flex items-center justify-between gap-4">
        {/* Search Input - If not in toolbar, put it here or use the one inside WorkspaceToolbar if it supports it properly */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subscriptions..."
            className="w-full h-9 px-4 pr-10 rounded-full bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <WorkspaceToolbar
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          viewOptions={VIEW_OPTIONS}
          sort={{ field: sort.field, direction: sort.order }}
          onSortChange={(newSort) => setSort({ field: newSort.field as SortField, order: newSort.direction })}
          sortOptions={SORT_OPTIONS}
          viewPosition="right"
        />
      </div>

      {filterChips.length > 0 && (
        <ActiveFilterChips
          chips={filterChips}
          onRemove={handleRemoveChip}
          onClearAll={handleResetFilters}
          className="px-1"
        />
      )}
    </div>
  );
}
