'use client';

import { useMemo } from 'react';
import { List, LayoutGrid, Calendar } from 'lucide-react';
import { WorkspacePageLayout, WorkspaceToolbar, ActivityCalendar, type ViewOption, type SortOption } from '@ainexsuite/ui';
import { NoteBoard } from '@/components/notes/note-board';
import { WorkspaceInsights } from '@/components/notes/workspace-insights';
import { NoteComposer } from "@/components/notes/note-composer";
import { SpaceSwitcher } from "@/components/spaces";
import { usePreferences } from "@/components/providers/preferences-provider";
import { useNotes } from "@/components/providers/notes-provider";
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
  { field: 'title', label: 'Title' },
];

export default function NotesWorkspace() {
  const { preferences, updatePreferences } = usePreferences();
  const { notes, filters, setFilters, sort, setSort } = useNotes();

  // Calculate activity data for calendar view
  const activityData = useMemo(() => {
    const data: Record<string, number> = {};
    notes.forEach((note) => {
      const date = note.createdAt.toISOString().split('T')[0];
      data[date] = (data[date] || 0) + 1;
    });
    return data;
  }, [notes]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.labels && filters.labels.length > 0) count++;
    if (filters.colors && filters.colors.length > 0) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    return count;
  }, [filters]);

  const handleFilterReset = () => {
    setFilters({ labels: [], colors: [], dateRange: { start: null, end: null } });
  };

  const isCalendarView = preferences.viewMode === 'calendar';

  return (
    <WorkspacePageLayout
      insightsBanner={<WorkspaceInsights variant="sidebar" />}
      composer={<NoteComposer />}
      composerActions={<SpaceSwitcher />}
      toolbar={
        <WorkspaceToolbar
          viewMode={preferences.viewMode}
          onViewModeChange={(mode) => updatePreferences({ viewMode: mode })}
          viewOptions={VIEW_OPTIONS}
          filterContent={<NoteFilterContent filters={filters} onFiltersChange={setFilters} />}
          activeFilterCount={activeFilterCount}
          onFilterReset={handleFilterReset}
          sort={sort}
          onSortChange={setSort}
          sortOptions={SORT_OPTIONS}
        />
      }
      maxWidth="default"
    >
      {isCalendarView ? (
        <ActivityCalendar
          activityData={activityData}
          size="large"
        />
      ) : (
        <NoteBoard />
      )}
    </WorkspacePageLayout>
  );
}
