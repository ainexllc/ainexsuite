'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { LayoutGrid, Calendar, X } from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import {
  WorkspacePageLayout,
  WorkspaceToolbar,
  ActiveFilterChips,
  type ViewOption,
  type SortOption,
  type SortConfig,
  type FilterChip,
  type FilterChipType,
} from '@ainexsuite/ui';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { JournalComposer } from '@/components/journal/journal-composer';
import {
  JournalFilterContent,
  type JournalFilterValue,
} from '@/components/journal/journal-filter-content';
import { moodConfig } from '@/lib/utils/mood';

type ViewMode = 'masonry' | 'calendar';

const VIEW_OPTIONS: ViewOption<ViewMode>[] = [
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
  status: 'all',
};

const ENTRY_COLOR_MAP: Record<string, string> = {
  'default': '#1f2937',
  'entry-white': '#ffffff',
  'entry-lemon': '#fff9c4',
  'entry-peach': '#ffe0b2',
  'entry-tangerine': '#ffccbc',
  'entry-mint': '#c8e6c9',
  'entry-fog': '#cfd8dc',
  'entry-lavender': '#d1c4e9',
  'entry-blush': '#f8bbd0',
  'entry-sky': '#b3e5fc',
  'entry-moss': '#dcedc8',
  'entry-coal': '#455a64',
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
    setIsSearchOpen((prev) => {
      if (prev) {
        setSearchQuery('');
      }
      return !prev;
    });
  }, []);

  // Generate filter chips for active filters (matching Notes pattern)
  const filterChips = useMemo(() => {
    const chips: FilterChip[] = [];

    // Mood chips (prefixed to identify type)
    if (filters.moods && filters.moods.length > 0) {
      filters.moods.forEach((mood) => {
        chips.push({
          id: `mood:${mood}`,
          label: moodConfig[mood]?.label || mood,
          type: 'label' as FilterChipType,
        });
      });
    }

    // Tag chips (prefixed to identify type)
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach((tag) => {
        chips.push({
          id: `tag:${tag}`,
          label: tag,
          type: 'label' as FilterChipType,
        });
      });
    }

    // Color chips
    if (filters.colors && filters.colors.length > 0) {
      filters.colors.forEach((color) => {
        chips.push({
          id: color,
          label: color.replace('entry-', '').charAt(0).toUpperCase() + color.replace('entry-', '').slice(1),
          type: 'color' as FilterChipType,
          colorValue: ENTRY_COLOR_MAP[color],
        });
      });
    }

    // Date range chip
    if (filters.dateRange?.start || filters.dateRange?.end) {
      const dateLabel = filters.datePreset && filters.datePreset !== 'custom'
        ? filters.datePreset.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : 'Custom Date';
      chips.push({
        id: 'dateRange',
        label: dateLabel,
        type: 'date' as FilterChipType,
      });
    }

    // Status chip (only show when not 'all')
    if (filters.status && filters.status !== 'all') {
      chips.push({
        id: `status:${filters.status}`,
        label: filters.status === 'drafts' ? 'Drafts' : 'Published',
        type: 'label' as FilterChipType,
      });
    }

    return chips;
  }, [filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.moods && filters.moods.length > 0) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.colors && filters.colors.length > 0) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    if (filters.status && filters.status !== 'all') count++;
    return count;
  }, [filters]);

  const handleFilterReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleRemoveChip = useCallback((chipId: string, chipType: FilterChipType) => {
    // Parse chipId to determine actual filter type
    if (chipId.startsWith('mood:')) {
      const mood = chipId.substring(5);
      setFilters({
        ...filters,
        moods: filters.moods?.filter((id) => id !== mood) || [],
      });
    } else if (chipId.startsWith('tag:')) {
      const tag = chipId.substring(4);
      setFilters({
        ...filters,
        tags: filters.tags?.filter((t) => t !== tag) || [],
      });
    } else if (chipId.startsWith('status:')) {
      setFilters({
        ...filters,
        status: 'all',
      });
    } else if (chipType === 'color') {
      setFilters({
        ...filters,
        colors: filters.colors?.filter((c) => c !== chipId) || [],
      });
    } else if (chipType === 'date') {
      setFilters({
        ...filters,
        dateRange: { start: null, end: null },
        datePreset: undefined,
      });
    }
  }, [filters]);

  if (!user) {
    return null;
  }

  return (
    <WorkspacePageLayout
      composer={<JournalComposer onEntryCreated={handleEntryCreated} />}
      toolbar={
        <div className="space-y-2">
          {isSearchOpen && (
            <div className="flex items-center gap-2 justify-center">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search entries..."
                  autoFocus
                  className="w-full h-9 px-4 pr-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-white/20 transition-colors"
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
            </div>
          )}
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
          {filterChips.length > 0 && (
            <ActiveFilterChips
              chips={filterChips}
              onRemove={handleRemoveChip}
              onClearAll={handleFilterReset}
              className="px-1"
            />
          )}
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
