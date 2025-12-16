'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { List, LayoutGrid, Calendar } from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import {
  WorkspacePageLayout,
  WorkspaceToolbar,
  type ViewOption,
  type SortOption,
  type SortConfig,
} from '@ainexsuite/ui';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { JournalComposer } from '@/components/journal/journal-composer';
import { SpaceSwitcher } from '@/components/spaces/SpaceSwitcher';
import {
  JournalFilterContent,
  type JournalFilterValue,
} from '@/components/journal/journal-filter-content';

type ViewMode = 'list' | 'masonry' | 'calendar';

const VIEW_OPTIONS: ViewOption<ViewMode>[] = [
  { value: 'list', icon: List, label: 'List view' },
  { value: 'masonry', icon: LayoutGrid, label: 'Masonry view' },
  { value: 'calendar', icon: Calendar, label: 'Calendar view' },
];

const SORT_OPTIONS: SortOption[] = [
  { field: 'createdAt', label: 'Date created' },
  { field: 'updatedAt', label: 'Date modified' },
  { field: 'title', label: 'Title' },
];

const DEFAULT_FILTERS: JournalFilterValue = {
  moods: [],
  tags: [],
  colors: [],
  dateRange: { start: null, end: null },
  datePreset: undefined,
  dateField: 'createdAt',
};

export default function WorkspacePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const dateFilter = searchParams.get('date');
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');
  const [filters, setFilters] = useState<JournalFilterValue>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortConfig>({ field: 'createdAt', direction: 'desc' });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleEntryCreated = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleSearchToggle = useCallback(() => {
    setIsSearchOpen((prev) => !prev);
    if (isSearchOpen) {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.moods && filters.moods.length > 0) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.colors && filters.colors.length > 0) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    return count;
  }, [filters]);

  const handleFilterReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  if (!user) {
    return null;
  }

  return (
    <WorkspacePageLayout
      composer={<JournalComposer onEntryCreated={handleEntryCreated} />}
      composerActions={<SpaceSwitcher />}
      toolbar={
        <div className="space-y-2">
          <WorkspaceToolbar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            viewOptions={VIEW_OPTIONS}
            onSearchClick={handleSearchToggle}
            isSearchActive={isSearchOpen || !!searchQuery}
            filterContent={
              <JournalFilterContent
                filters={filters}
                onFiltersChange={setFilters}
                sort={sort}
              />
            }
            activeFilterCount={activeFilterCount}
            onFilterReset={handleFilterReset}
            sort={sort}
            onSortChange={setSort}
            sortOptions={SORT_OPTIONS}
            viewPosition="right"
          />
        </div>
      }
      maxWidth="default"
    >
      <DashboardView
        dateFilter={dateFilter || undefined}
        refreshKey={refreshKey}
        filters={filters}
        sort={sort}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        isSearchOpen={isSearchOpen}
        viewMode={viewMode}
      />
    </WorkspacePageLayout>
  );
}
