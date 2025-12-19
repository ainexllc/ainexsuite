'use client';

import { useMemo, useCallback, useState } from 'react';
import { List, LayoutGrid, Calendar, X, Inbox, Archive } from 'lucide-react';
import { clsx } from 'clsx';
import {
  WorkspacePageLayout,
  WorkspaceToolbar,
  ActivityCalendar,
  ActiveFilterChips,
  type ViewOption,
  type SortOption,
  type FilterChip,
  type FilterChipType,
} from '@ainexsuite/ui';
import { NoteBoard } from '@/components/notes/note-board';
import { NoteComposer } from "@/components/notes/note-composer";
import { usePreferences } from "@/components/providers/preferences-provider";
import { useNotes } from "@/components/providers/notes-provider";
import { useLabels } from "@/components/providers/labels-provider";
import { NoteFilterContent } from "@/components/notes/note-filter-content";
import type { ViewMode } from "@/lib/types/settings";

const VIEW_OPTIONS: ViewOption<ViewMode>[] = [
  { value: 'list', icon: List, label: 'List view' },
  { value: 'masonry', icon: LayoutGrid, label: 'Masonry view' },
  { value: 'calendar', icon: Calendar, label: 'Calendar view' },
];

const SORT_OPTIONS: SortOption[] = [
  { field: 'createdAt', label: 'Date created' },
  { field: 'updatedAt', label: 'Date modified' },
  { field: 'noteDate', label: 'Note date' },
  { field: 'title', label: 'Title' },
];

const NOTE_COLOR_MAP: Record<string, string> = {
  'default': '#1f2937',
  'note-white': '#ffffff',
  'note-lemon': '#fff9c4',
  'note-peach': '#ffe0b2',
  'note-tangerine': '#ffccbc',
  'note-mint': '#c8e6c9',
  'note-fog': '#cfd8dc',
  'note-lavender': '#d1c4e9',
  'note-blush': '#f8bbd0',
  'note-sky': '#b3e5fc',
  'note-moss': '#dcedc8',
  'note-coal': '#455a64',
};

export default function NotesWorkspace() {
  const { preferences, updatePreferences } = usePreferences();
  const { notes, filters, setFilters, sort, setSort, searchQuery, setSearchQuery, showArchived, setShowArchived } = useNotes();
  const { labels } = useLabels();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Calculate activity data for calendar view
  const activityData = useMemo(() => {
    const data: Record<string, number> = {};
    notes.forEach((note) => {
      const date = note.createdAt.toISOString().split('T')[0];
      data[date] = (data[date] || 0) + 1;
    });
    return data;
  }, [notes]);

  // Generate filter chips for active filters
  const filterChips = useMemo(() => {
    const chips: FilterChip[] = [];

    // Label chips
    if (filters.labels && filters.labels.length > 0) {
      filters.labels.forEach((labelId) => {
        const label = labels.find((l) => l.id === labelId);
        if (label) {
          chips.push({
            id: labelId,
            label: label.name,
            type: 'label',
          });
        }
      });
    }

    // Color chips
    if (filters.colors && filters.colors.length > 0) {
      filters.colors.forEach((color) => {
        chips.push({
          id: color,
          label: color.replace('note-', '').charAt(0).toUpperCase() + color.replace('note-', '').slice(1),
          type: 'color',
          colorValue: NOTE_COLOR_MAP[color],
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
        type: 'date',
      });
    }

    // Note type chip
    if (filters.noteType && filters.noteType !== 'all') {
      chips.push({
        id: filters.noteType,
        label: filters.noteType === 'text' ? 'Text Notes' : 'Checklists',
        type: 'noteType',
      });
    }

    return chips;
  }, [filters, labels]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.labels && filters.labels.length > 0) count++;
    if (filters.colors && filters.colors.length > 0) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    if (filters.noteType && filters.noteType !== 'all') count++;
    return count;
  }, [filters]);

  const handleFilterReset = useCallback(() => {
    setFilters({
      labels: [],
      colors: [],
      dateRange: { start: null, end: null },
      datePreset: undefined,
      dateField: 'createdAt',
      noteType: 'all',
    });
  }, [setFilters]);

  const handleRemoveChip = useCallback((chipId: string, chipType: FilterChipType) => {
    switch (chipType) {
      case 'label':
        setFilters({
          ...filters,
          labels: filters.labels?.filter((id) => id !== chipId) || [],
        });
        break;
      case 'color':
        setFilters({
          ...filters,
          colors: filters.colors?.filter((c) => c !== chipId) || [],
        });
        break;
      case 'date':
        setFilters({
          ...filters,
          dateRange: { start: null, end: null },
          datePreset: undefined,
        });
        break;
      case 'noteType':
        setFilters({
          ...filters,
          noteType: 'all',
        });
        break;
    }
  }, [filters, setFilters]);

  const isCalendarView = preferences.viewMode === 'calendar';

  const handleSearchToggle = useCallback(() => {
    setIsSearchOpen((prev) => {
      if (prev) {
        // Clear search when closing
        setSearchQuery('');
      }
      return !prev;
    });
  }, [setSearchQuery]);

  return (
    <WorkspacePageLayout
      composer={showArchived ? null : <NoteComposer />}
      toolbar={
        <div className="space-y-2">
          {isSearchOpen && (
            <div className="flex items-center gap-2 justify-center">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes..."
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
          <div className="flex items-center justify-center gap-2">
            <WorkspaceToolbar
              viewMode={preferences.viewMode}
              onViewModeChange={(mode) => updatePreferences({ viewMode: mode })}
              viewOptions={VIEW_OPTIONS}
              onSearchClick={handleSearchToggle}
              isSearchActive={isSearchOpen || !!searchQuery}
              filterContent={<NoteFilterContent filters={filters} onFiltersChange={setFilters} sort={sort} />}
              activeFilterCount={activeFilterCount}
              onFilterReset={handleFilterReset}
              sort={sort}
              onSortChange={setSort}
              sortOptions={SORT_OPTIONS}
              viewPosition="right"
              viewTrailingContent={
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={clsx(
                    'h-8 w-8 inline-flex items-center justify-center rounded-full transition-all',
                    showArchived
                      ? 'bg-[#f97316] text-white shadow-md'
                      : 'text-zinc-400 hover:bg-white/10 hover:text-white'
                  )}
                  title={showArchived ? 'Exit archive view' : 'View archived notes'}
                  aria-label={showArchived ? 'Exit archive view' : 'View archived notes'}
                >
                  <Inbox className="h-4 w-4" />
                </button>
              }
            />
          </div>
          {showArchived && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
              <Archive className="h-4 w-4" />
              <span className="text-sm font-medium">Viewing archived notes</span>
              <span className="text-xs text-amber-600 dark:text-amber-400">({notes.length} notes)</span>
              <button
                onClick={() => setShowArchived(false)}
                className="ml-auto text-xs font-medium hover:underline"
              >
                Back to notes
              </button>
            </div>
          )}
          {filterChips.length > 0 && !showArchived && (
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
      {isCalendarView ? (
        <ActivityCalendar
          activityData={activityData}
          size="large"
          view={preferences.calendarView || 'month'}
          onViewChange={(view) => updatePreferences({ calendarView: view })}
        />
      ) : (
        <NoteBoard />
      )}
    </WorkspacePageLayout>
  );
}
