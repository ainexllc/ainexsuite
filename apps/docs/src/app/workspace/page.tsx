'use client';

import { useMemo, useCallback, useState, useRef } from 'react';
import { LayoutGrid, Calendar, X } from 'lucide-react';
import {
  WorkspacePageLayout,
  WorkspaceToolbar,
  ActivityCalendar,
  ActiveFilterChips,
  SpaceManagementModal,
  type ViewOption,
  type SortOption,
  type FilterChip,
  type FilterChipType,
  type UserSpace,
} from '@ainexsuite/ui';
import type { SpaceType } from '@ainexsuite/types';
import { DocBoard } from '@/components/docs/doc-board';
import { DocComposer } from "@/components/docs/doc-composer";
import { usePreferences } from "@/components/providers/preferences-provider";
import { useDocs } from "@/components/providers/docs-provider";
import { useLabels } from "@/components/providers/labels-provider";
import { useSpaces } from "@/components/providers/spaces-provider";
import { MemberManager } from "@/components/spaces/MemberManager";
import { DocFilterContent } from "@/components/docs/doc-filter-content";
import { KeyboardShortcutsModal } from "@/components/keyboard-shortcuts-modal";
import { BulkActionBar } from "@/components/bulk-action-bar";
import { SelectionProvider, useDocSelection } from "@/components/providers/selection-provider";
import { useKeyboardShortcuts, type KeyboardShortcut } from "@/hooks/use-keyboard-shortcuts";
import { batchDeleteDocs, batchUpdateDocs } from "@/lib/firebase/doc-service";
import { useAuth } from "@ainexsuite/auth";
import type { ViewMode } from "@/lib/types/settings";
import type { DocColor } from "@/lib/types/doc";

const VIEW_OPTIONS: ViewOption<ViewMode>[] = [
  { value: 'masonry', icon: LayoutGrid, label: 'Masonry view' },
  { value: 'calendar', icon: Calendar, label: 'Calendar view' },
];

const SORT_OPTIONS: SortOption[] = [
  { field: 'createdAt', label: 'Date created' },
  { field: 'updatedAt', label: 'Date modified' },
  { field: 'noteDate', label: 'Doc date' },
  { field: 'title', label: 'Title' },
];

const DOC_COLOR_MAP: Record<string, string> = {
  'default': '#1f2937',
  'doc-white': '#ffffff',
  'doc-lemon': '#fff9c4',
  'doc-peach': '#ffe0b2',
  'doc-tangerine': '#ffccbc',
  'doc-mint': '#c8e6c9',
  'doc-fog': '#cfd8dc',
  'doc-lavender': '#d1c4e9',
  'doc-blush': '#f8bbd0',
  'doc-sky': '#b3e5fc',
  'doc-moss': '#dcedc8',
  'doc-coal': '#455a64',
};

// Wrapper component that provides selection context
export default function DocsWorkspace() {
  return (
    <SelectionProvider>
      <DocsWorkspaceContent />
    </SelectionProvider>
  );
}

function DocsWorkspaceContent() {
  const { user } = useAuth();
  const { preferences, updatePreferences } = usePreferences();
  const { docs, others, filters, setFilters, sort, setSort, searchQuery, setSearchQuery } = useDocs();
  const { labels } = useLabels();
  const { allSpaces, createSpace, updateSpace, deleteSpace } = useSpaces();
  const {
    selectedIds,
    selectionCount,
    selectAll,
    deselectAll,
  } = useDocSelection();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [showSpaceManagement, setShowSpaceManagement] = useState(false);
  const [showMemberManager, setShowMemberManager] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Map spaces to UserSpace format for SpaceManagementModal
  const userSpaces = useMemo<UserSpace[]>(() => {
    return allSpaces
      .filter((s) => s.id !== 'personal')
      .map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type as SpaceType,
        isGlobal: (s as { isGlobal?: boolean }).isGlobal ?? false,
        isOwner: ((s as { ownerId?: string; createdBy?: string }).ownerId || (s as { ownerId?: string; createdBy?: string }).createdBy) === user?.uid,
        hiddenInApps: (s as { hiddenInApps?: string[] }).hiddenInApps || [],
      }));
  }, [allSpaces, user?.uid]);

  // Space management callbacks
  const handleJoinGlobalSpace = useCallback(async (type: SpaceType, hiddenInApps: string[]) => {
    if (!user) return;
    const globalSpaceNames: Record<string, string> = {
      family: 'Family',
      couple: 'Couple',
      squad: 'Team',
      work: 'Group',
    };
    const spaceId = await createSpace({
      name: globalSpaceNames[type] || type,
      type,
    });
    await updateSpace(spaceId, { isGlobal: true, hiddenInApps });
  }, [user, createSpace, updateSpace]);

  const handleLeaveGlobalSpace = useCallback(async (spaceId: string) => {
    await deleteSpace(spaceId);
  }, [deleteSpace]);

  const handleCreateCustomSpace = useCallback(async (name: string, hiddenInApps: string[]) => {
    if (!user) return;
    const spaceId = await createSpace({
      name,
      type: 'work',
    });
    if (hiddenInApps.length > 0) {
      await updateSpace(spaceId, { hiddenInApps });
    }
  }, [user, createSpace, updateSpace]);

  const handleRenameCustomSpace = useCallback(async (spaceId: string, name: string) => {
    await updateSpace(spaceId, { name });
  }, [updateSpace]);

  const handleDeleteCustomSpace = useCallback(async (spaceId: string) => {
    await deleteSpace(spaceId);
  }, [deleteSpace]);

  const handleUpdateSpaceVisibility = useCallback(async (spaceId: string, hiddenInApps: string[]) => {
    await updateSpace(spaceId, { hiddenInApps });
  }, [updateSpace]);

  // Bulk action handlers
  const handleBulkDelete = useCallback(async () => {
    if (!user?.uid || selectionCount === 0) return;
    await batchDeleteDocs(user.uid, Array.from(selectedIds));
    deselectAll();
  }, [user?.uid, selectedIds, selectionCount, deselectAll]);

  const handleBulkPin = useCallback(async () => {
    if (!user?.uid || selectionCount === 0) return;
    await batchUpdateDocs(user.uid, Array.from(selectedIds), { pinned: true });
    deselectAll();
  }, [user?.uid, selectedIds, selectionCount, deselectAll]);

  const handleBulkUnpin = useCallback(async () => {
    if (!user?.uid || selectionCount === 0) return;
    await batchUpdateDocs(user.uid, Array.from(selectedIds), { pinned: false });
    deselectAll();
  }, [user?.uid, selectedIds, selectionCount, deselectAll]);

  const handleBulkArchive = useCallback(async () => {
    if (!user?.uid || selectionCount === 0) return;
    await batchUpdateDocs(user.uid, Array.from(selectedIds), { archived: true });
    deselectAll();
  }, [user?.uid, selectedIds, selectionCount, deselectAll]);

  const handleBulkColorChange = useCallback(async (color: DocColor) => {
    if (!user?.uid || selectionCount === 0) return;
    await batchUpdateDocs(user.uid, Array.from(selectedIds), { color });
    deselectAll();
  }, [user?.uid, selectedIds, selectionCount, deselectAll]);

  const handleBulkLabelAdd = useCallback(async (labelId: string) => {
    if (!user?.uid || selectionCount === 0) return;
    // For adding labels, we need to get current labels and add the new one
    // This is a simplified version - in production you'd want to handle this more carefully
    const docIds = Array.from(selectedIds);
    for (const docId of docIds) {
      const doc = docs.find(d => d.id === docId);
      if (doc && !doc.labelIds.includes(labelId)) {
        await batchUpdateDocs(user.uid, [docId], { labelIds: [...doc.labelIds, labelId] });
      }
    }
    deselectAll();
  }, [user?.uid, selectedIds, selectionCount, docs, deselectAll]);

  const handleSelectAll = useCallback(() => {
    selectAll(others.map(doc => doc.id));
  }, [selectAll, others]);

  // Calculate activity data for calendar view
  const activityData = useMemo(() => {
    const data: Record<string, number> = {};
    docs.forEach(doc => {
      const date = doc.createdAt.toISOString().split('T')[0];
      data[date] = (data[date] || 0) + 1;
    });
    return data;
  }, [docs]);

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
          label: color.replace('doc-', '').charAt(0).toUpperCase() + color.replace('doc-', '').slice(1),
          type: 'color',
          colorValue: DOC_COLOR_MAP[color],
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

    // Doc type chip
    if (filters.noteType && filters.noteType !== 'all') {
      chips.push({
        id: filters.noteType,
        label: filters.noteType === 'text' ? 'Text Docs' : 'Checklists',
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
      description: 'Create new doc',
      category: 'actions',
      label: 'New Doc',
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
      composer={
        <DocComposer
          onManagePeople={() => setShowMemberManager(true)}
          onManageSpaces={() => setShowSpaceManagement(true)}
        />
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
                  placeholder="Search docs..."
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
              filterContent={<DocFilterContent filters={filters} onFiltersChange={setFilters} sort={sort} />}
              activeFilterCount={activeFilterCount}
              onFilterReset={handleFilterReset}
              sort={sort}
              onSortChange={setSort}
              sortOptions={SORT_OPTIONS}
              viewPosition="right"
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
        <DocBoard />
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        shortcuts={shortcuts}
      />

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectionCount}
        totalCount={others.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={deselectAll}
        onDelete={handleBulkDelete}
        onPin={handleBulkPin}
        onUnpin={handleBulkUnpin}
        onArchive={handleBulkArchive}
        onColorChange={handleBulkColorChange}
        onLabelAdd={handleBulkLabelAdd}
      />
    </WorkspacePageLayout>

    {/* Space Management Modal */}
    <SpaceManagementModal
      isOpen={showSpaceManagement}
      onClose={() => setShowSpaceManagement(false)}
      userSpaces={userSpaces}
      onJoinGlobalSpace={handleJoinGlobalSpace}
      onLeaveGlobalSpace={handleLeaveGlobalSpace}
      onCreateCustomSpace={handleCreateCustomSpace}
      onRenameCustomSpace={handleRenameCustomSpace}
      onDeleteCustomSpace={handleDeleteCustomSpace}
      onUpdateSpaceVisibility={handleUpdateSpaceVisibility}
    />

    {/* Member Manager Modal */}
    <MemberManager
      isOpen={showMemberManager}
      onClose={() => setShowMemberManager(false)}
    />
    </>
  );
}
