'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import {
  LayoutGrid,
  X,
  LayoutList,
  PenTool,
} from 'lucide-react';
import {
  WorkspacePageLayout,
  SpaceTabSelector,
  WorkspaceToolbar,
  type ViewOption,
} from '@ainexsuite/ui';
import type { SortField } from '@/lib/types/project';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { ProjectsBoard } from '@/components/projects-board';
import { ProjectComposer } from '@/components/projects/project-composer';
import { ProjectBoard } from '@/components/projects/project-board';
import { ProjectEditor } from '@/components/projects/project-editor';
import { ProjectFilterContent } from '@/components/filters/project-filter-content';
import { KeyboardShortcutsModal } from '@/components/keyboard-shortcuts-modal';
import { BulkActionBar } from '@/components/bulk-action-bar';
import { useSpaces } from '@/components/providers/spaces-provider';
import { useProjects } from '@/components/providers/projects-provider';
import { usePreferences } from '@/components/providers/preferences-provider';
import { useSelection } from '@/components/providers/selection-provider';
import { useKeyboardShortcuts, type KeyboardShortcut } from '@/hooks/use-keyboard-shortcuts';
import type { Project, ViewMode, ProjectColor, ProjectStatus } from '@/lib/types/project';

// View options for toolbar
const VIEW_OPTIONS: ViewOption<ViewMode>[] = [
  { value: 'board', icon: LayoutGrid, label: 'Board view' },
  { value: 'list', icon: LayoutList, label: 'List view' },
  { value: 'whiteboard', icon: PenTool, label: 'Whiteboard' },
];

// Sort options for toolbar
const SORT_OPTIONS = [
  { field: 'updatedAt' as const, label: 'Date modified' },
  { field: 'createdAt' as const, label: 'Date created' },
  { field: 'dueDate' as const, label: 'Due date' },
  { field: 'title' as const, label: 'Title' },
  { field: 'priority' as const, label: 'Priority' },
  { field: 'status' as const, label: 'Status' },
];

export default function WorkspacePage() {
  const { user } = useWorkspaceAuth();
  const { spaces, currentSpaceId, setCurrentSpace } = useSpaces();
  const { preferences, setViewMode, setFilter, resetFilters, setSortConfig } = usePreferences();
  const {
    focusProjects,
    libraryProjects,
    batchUpdateProjects,
    batchDeleteProjects,
  } = useProjects();
  const {
    selectedIds,
    selectionMode,
    clearSelection,
    selectionCount,
    selectAll,
  } = useSelection();

  // Local UI state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Create space items for SpaceTabSelector
  const spaceItems = useMemo(() => {
    return spaces.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
    }));
  }, [spaces]);

  // Get current space name for placeholder
  const currentSpaceName = useMemo(() => {
    const space = spaces.find((s) => s.id === currentSpaceId);
    return space?.name || 'Personal';
  }, [spaces, currentSpaceId]);

  // Get all projects for bulk selection
  const allProjects = useMemo(() => {
    return [...focusProjects, ...libraryProjects];
  }, [focusProjects, libraryProjects]);

  // Check if user can delete all selected projects (must own all of them)
  const canBulkDelete = useMemo(() => {
    if (!user?.uid || selectionCount === 0) return false;
    const selectedProjects = allProjects.filter((p) => selectedIds.has(p.id));
    return selectedProjects.every((p) => p.ownerId === user.uid);
  }, [user?.uid, selectionCount, selectedIds, allProjects]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    const filter = preferences.filter;
    let count = 0;
    if (filter.labels?.length) count++;
    if (filter.colors?.length) count++;
    if (filter.status?.length) count++;
    if (filter.priority?.length) count++;
    if (filter.type?.length) count++;
    if (filter.dateRange?.start || filter.dateRange?.end) count++;
    if (filter.hasWhiteboard !== undefined) count++;
    return count;
  }, [preferences.filter]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setFilter({ ...preferences.filter, search: query || undefined });
  }, [preferences.filter, setFilter]);

  // Handle view mode change
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, [setViewMode]);

  // Handle project click (open editor)
  const handleProjectClick = useCallback((project: Project) => {
    setEditingProject(project);
  }, []);

  // Handle close editor
  const handleCloseEditor = useCallback(() => {
    setEditingProject(null);
  }, []);

  // Handle filter reset
  const handleFilterReset = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  // Handle sort change
  const handleSortChange = useCallback((sort: { field: string; direction: 'asc' | 'desc' }) => {
    setSortConfig({
      field: sort.field as SortField,
      direction: sort.direction,
    });
  }, [setSortConfig]);

  // Handle search toggle
  const handleSearchToggle = useCallback(() => {
    setSearchOpen((prev) => {
      if (prev) {
        handleSearch('');
      }
      return !prev;
    });
  }, [handleSearch]);

  // Bulk action handlers
  const handleBulkPin = useCallback(async () => {
    const ids = Array.from(selectedIds);
    await batchUpdateProjects(ids, { pinned: true });
    clearSelection();
  }, [selectedIds, batchUpdateProjects, clearSelection]);

  const handleBulkUnpin = useCallback(async () => {
    const ids = Array.from(selectedIds);
    await batchUpdateProjects(ids, { pinned: false });
    clearSelection();
  }, [selectedIds, batchUpdateProjects, clearSelection]);

  const handleBulkArchive = useCallback(async () => {
    const ids = Array.from(selectedIds);
    await batchUpdateProjects(ids, { archived: true });
    clearSelection();
  }, [selectedIds, batchUpdateProjects, clearSelection]);

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    await batchDeleteProjects(ids);
    clearSelection();
  }, [selectedIds, batchDeleteProjects, clearSelection]);

  const handleBulkColorChange = useCallback(async (color: ProjectColor) => {
    const ids = Array.from(selectedIds);
    await batchUpdateProjects(ids, { color });
    clearSelection();
  }, [selectedIds, batchUpdateProjects, clearSelection]);

  const handleBulkLabelAdd = useCallback(async (labelId: string) => {
    const ids = Array.from(selectedIds);
    // For each selected project, add the label if not already present
    for (const id of ids) {
      const project = allProjects.find((p) => p.id === id);
      if (project && !project.labelIds.includes(labelId)) {
        await batchUpdateProjects([id], { labelIds: [...project.labelIds, labelId] });
      }
    }
    clearSelection();
  }, [selectedIds, allProjects, batchUpdateProjects, clearSelection]);

  const handleBulkStatusChange = useCallback(async (status: ProjectStatus) => {
    const ids = Array.from(selectedIds);
    await batchUpdateProjects(ids, { status });
    clearSelection();
  }, [selectedIds, batchUpdateProjects, clearSelection]);

  const handleSelectAll = useCallback(() => {
    selectAll(allProjects.map((p) => p.id));
  }, [selectAll, allProjects]);

  // Define keyboard shortcuts
  const shortcuts = useMemo<KeyboardShortcut[]>(() => [
    {
      key: 'n',
      modifiers: { meta: true },
      action: () => {
        composerRef.current?.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      description: 'Create new project',
      category: 'actions',
      label: 'New Project',
    },
    {
      key: 'f',
      modifiers: { meta: true, shift: true },
      action: () => {
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      },
      description: 'Focus search',
      category: 'navigation',
      label: 'Search',
    },
    {
      key: '/',
      modifiers: { meta: true },
      action: () => setShortcutsOpen(true),
      description: 'Show keyboard shortcuts',
      category: 'navigation',
      label: 'Shortcuts',
    },
    {
      key: 'Escape',
      action: () => {
        if (shortcutsOpen) {
          setShortcutsOpen(false);
        } else if (editingProject) {
          setEditingProject(null);
        } else if (searchOpen) {
          setSearchOpen(false);
          setSearchQuery('');
        } else if (selectionMode) {
          clearSelection();
        }
      },
      description: 'Close modal / Clear selection',
      category: 'navigation',
      label: 'Escape',
    },
    {
      key: '1',
      modifiers: { meta: true },
      action: () => handleViewModeChange('board'),
      description: 'Switch to board view',
      category: 'navigation',
      label: 'Board View',
    },
    {
      key: '2',
      modifiers: { meta: true },
      action: () => handleViewModeChange('list'),
      description: 'Switch to list view',
      category: 'navigation',
      label: 'List View',
    },
    {
      key: 'w',
      modifiers: { meta: true },
      action: () => handleViewModeChange('whiteboard'),
      description: 'Switch to whiteboard view',
      category: 'navigation',
      label: 'Whiteboard View',
    },
    {
      key: 'r',
      modifiers: { meta: true, shift: true },
      action: handleFilterReset,
      description: 'Reset all filters',
      category: 'actions',
      label: 'Reset Filters',
    },
  ], [shortcutsOpen, editingProject, searchOpen, selectionMode, handleViewModeChange, handleFilterReset, clearSelection]);

  useKeyboardShortcuts({ shortcuts });

  if (!user) return null;

  // Render whiteboard view
  if (preferences.viewMode === 'whiteboard') {
    return (
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
        toolbar={
          <div className="flex items-center justify-center">
            <button
              onClick={() => handleViewModeChange('board')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-elevated border border-border hover:bg-surface-hover transition-colors text-sm font-medium text-text-secondary"
            >
              <LayoutGrid className="h-4 w-4" />
              Back to Board
            </button>
          </div>
        }
        maxWidth="full"
      >
        <div className="h-[calc(100vh-200px)] w-full">
          <ProjectsBoard />
        </div>
      </WorkspacePageLayout>
    );
  }

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
          <ProjectComposer placeholder={`Create a new project for ${currentSpaceName}...`} />
        }
        toolbar={
          <div className="space-y-2">
            {/* Search bar */}
            {searchOpen && (
              <div className="flex items-center gap-2 justify-center">
                <div className="relative flex-1 max-w-md">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search projects..."
                    autoFocus
                    className="w-full h-9 px-4 pr-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-white/20 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-center gap-2">
              <WorkspaceToolbar
                viewMode={preferences.viewMode}
                onViewModeChange={(mode) => handleViewModeChange(mode as ViewMode)}
                viewOptions={VIEW_OPTIONS}
                onSearchClick={handleSearchToggle}
                isSearchActive={searchOpen || !!searchQuery}
                filterContent={<ProjectFilterContent />}
                activeFilterCount={activeFilterCount}
                onFilterReset={handleFilterReset}
                sort={preferences.sortConfig}
                onSortChange={handleSortChange}
                sortOptions={SORT_OPTIONS}
                viewPosition="right"
              />
            </div>
          </div>
        }
        maxWidth="default"
      >
        {/* Project Board */}
        <ProjectBoard onProjectClick={handleProjectClick} />

        {/* Project Editor Modal */}
        {editingProject && (
          <ProjectEditor
            project={editingProject}
            isOpen={!!editingProject}
            onClose={handleCloseEditor}
          />
        )}

        {/* Keyboard Shortcuts Modal */}
        <KeyboardShortcutsModal
          isOpen={shortcutsOpen}
          onClose={() => setShortcutsOpen(false)}
          shortcuts={shortcuts}
        />
      </WorkspacePageLayout>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectionCount}
        totalCount={allProjects.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={clearSelection}
        onDelete={handleBulkDelete}
        onPin={handleBulkPin}
        onUnpin={handleBulkUnpin}
        onArchive={handleBulkArchive}
        onColorChange={handleBulkColorChange}
        onLabelAdd={handleBulkLabelAdd}
        onStatusChange={handleBulkStatusChange}
        canDelete={canBulkDelete}
      />
    </>
  );
}
