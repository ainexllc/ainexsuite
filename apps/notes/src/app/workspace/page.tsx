'use client';

import { useMemo, useCallback, useState, useRef } from 'react';
import { LayoutGrid, Calendar, X, Settings, Trash2 } from 'lucide-react';
import {
  WorkspacePageLayout,
  WorkspaceToolbar,
  ActivityCalendar,
  ActiveFilterChips,
  SpaceTabSelector,
  ToolbarButton,
  type ViewOption,
  type SortOption,
  type FilterChip,
  type FilterChipType,
} from '@ainexsuite/ui';
import { useSpaces } from '@/components/providers/spaces-provider';
import { NoteBoard } from '@/components/notes/note-board';
import { NoteComposer } from "@/components/notes/note-composer";
import { usePreferences } from "@/components/providers/preferences-provider";
import { useNotes } from "@/components/providers/notes-provider";
import { useLabels } from "@/components/providers/labels-provider";
import { NoteFilterContent } from "@/components/notes/note-filter-content";
import { KeyboardShortcutsModal } from "@/components/keyboard-shortcuts-modal";
import { AppSettingsModal } from "@/components/notes/app-settings-modal";
import { TrashModal } from "@/components/notes/trash-modal";
import { useKeyboardShortcuts, type KeyboardShortcut } from "@/hooks/use-keyboard-shortcuts";
import type { ViewMode } from "@/lib/types/settings";

const VIEW_OPTIONS: ViewOption<ViewMode>[] = [
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
  const { notes, trashed, filters, setFilters, sort, setSort, searchQuery, setSearchQuery, includeTrashInSearch, setIncludeTrashInSearch } = useNotes();
  const { labels } = useLabels();
  const { spaces, currentSpaceId, setCurrentSpace } = useSpaces();

  // Create space items for SpaceTabSelector
  const spaceItems = useMemo(() => {
    return spaces.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
    }));
  }, [spaces]);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isAppSettingsOpen, setIsAppSettingsOpen] = useState(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Define keyboard shortcuts
  const shortcuts = useMemo<KeyboardShortcut[]>(() => [
    {
      key: 'n',
      modifiers: { meta: true },
      action: () => {
        // Focus the composer
        composerRef.current?.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      description: 'Create new note',
      category: 'actions',
      label: 'New Note',
    },
    {
      key: 'f',
      modifiers: { meta: true, shift: true },
      action: () => {
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      },
      description: 'Focus search',
      category: 'navigation',
      label: 'Search',
    },
    {
      key: '/',
      modifiers: { meta: true },
      action: () => setIsShortcutsModalOpen(true),
      description: 'Show keyboard shortcuts',
      category: 'navigation',
      label: 'Shortcuts',
    },
    {
      key: 'Escape',
      action: () => {
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
        } else if (isSearchOpen) {
          setIsSearchOpen(false);
          setSearchQuery('');
        }
      },
      description: 'Close modal / Clear search',
      category: 'navigation',
      label: 'Escape',
    },
    {
      key: '1',
      modifiers: { meta: true },
      action: () => updatePreferences({ viewMode: 'masonry' }),
      description: 'Switch to masonry view',
      category: 'navigation',
      label: 'Masonry View',
    },
    {
      key: '2',
      modifiers: { meta: true },
      action: () => updatePreferences({ viewMode: 'calendar' }),
      description: 'Switch to calendar view',
      category: 'navigation',
      label: 'Calendar View',
    },
    {
      key: 'r',
      modifiers: { meta: true, shift: true },
      action: handleFilterReset,
      description: 'Reset all filters',
      category: 'actions',
      label: 'Reset Filters',
    },
    {
      key: ',',
      modifiers: { meta: true },
      action: () => setIsAppSettingsOpen((prev) => !prev),
      description: 'Open app settings',
      category: 'navigation',
      label: 'App Settings',
    },
  ], [isShortcutsModalOpen, isSearchOpen, setSearchQuery, updatePreferences, handleFilterReset]);

  useKeyboardShortcuts({ shortcuts });

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
    <>
    <WorkspacePageLayout
      className="pt-[17px]"
      spaceSelector={
        spaceItems.length > 1 && (
          <SpaceTabSelector
            spaces={spaceItems}
            currentSpaceId={currentSpaceId}
            onSpaceChange={setCurrentSpace}
          />
        )
      }
      composer={
        <NoteComposer />
      }
      toolbar={
        <div className="space-y-2">
          {isSearchOpen && (
            <div className="flex items-center gap-2 justify-center">
              <div className="relative flex-1 max-w-md">
                <input
                  ref={searchInputRef}
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

              {/* Include Trash Toggle - only show when there's a search query */}
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => setIncludeTrashInSearch(!includeTrashInSearch)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-full transition-all border whitespace-nowrap ${
                    includeTrashInSearch
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      : "bg-white/5 text-muted-foreground border-white/10 hover:border-white/20"
                  }`}
                  title={includeTrashInSearch ? "Showing trash in search" : "Include trash in search"}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {includeTrashInSearch ? "Trash On" : "Trash Off"}
                </button>
              )}
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
                <div className="ml-1 pl-1 border-l border-zinc-300/50 dark:border-zinc-600/50 flex items-center gap-1">
                  <ToolbarButton
                    variant="toggle"
                    size="md"
                    isActive={isAppSettingsOpen}
                    onClick={() => setIsAppSettingsOpen(true)}
                    aria-label="App settings"
                  >
                    <Settings className="h-4 w-4" />
                  </ToolbarButton>
                  {trashed.length > 0 && (
                    <ToolbarButton
                      variant="toggle"
                      size="md"
                      isActive={isTrashModalOpen}
                      onClick={() => setIsTrashModalOpen(true)}
                      aria-label="Trash"
                    >
                      <Trash2 className="h-4 w-4" />
                    </ToolbarButton>
                  )}
                </div>
              }
            />
          </div>
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

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        shortcuts={shortcuts}
      />
    </WorkspacePageLayout>

    {/* App Settings Modal - Outside WorkspacePageLayout to avoid z-index stacking context issues */}
    <AppSettingsModal
      isOpen={isAppSettingsOpen}
      onClose={() => setIsAppSettingsOpen(false)}
    />

    {/* Trash Modal */}
    <TrashModal
      isOpen={isTrashModalOpen}
      onClose={() => setIsTrashModalOpen(false)}
    />
    </>
  );
}
