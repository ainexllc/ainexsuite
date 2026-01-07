'use client';

import { useMemo, useCallback, useState } from 'react';
import { LayoutGrid, X } from 'lucide-react';
import {
  WorkspacePageLayout,
  WorkspaceToolbar,
  ActiveFilterChips,
  SpaceManagementModal,
  type ViewOption,
  type SortOption,
  type FilterChip,
  type FilterChipType,
  type UserSpace,
} from '@ainexsuite/ui';
import { WorkspaceLayoutWithInsights } from '@/components/layouts/workspace-layout-with-insights';
import type { SpaceType } from '@ainexsuite/types';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkflowBoard } from '@/components/workflows/workflow-board';
import { WorkflowComposer } from "@/components/workflows/workflow-composer";
import { useWorkflows } from "@/components/providers/workflows-provider";
import { useLabels } from "@/components/providers/labels-provider";
import { useSpaces } from "@/components/providers/spaces-provider";
import { SelectionProvider, useSelection } from "@/components/providers/selection-provider";
import { MemberManager } from "@/components/spaces/MemberManager";
import { BulkActionBar } from "@/components/bulk-action-bar";
import { batchDeleteWorkflows, batchUpdateWorkflows } from "@/lib/firebase/workflow-service";
import { useAuth } from "@ainexsuite/auth";
import type { WorkflowColor } from "@/lib/types/workflow";

type ViewMode = 'masonry';

const VIEW_OPTIONS: ViewOption<ViewMode>[] = [
  { value: 'masonry', icon: LayoutGrid, label: 'Grid view' },
];

const SORT_OPTIONS: SortOption[] = [
  { field: 'createdAt', label: 'Date created' },
  { field: 'updatedAt', label: 'Date modified' },
  { field: 'title', label: 'Title' },
];

const WORKFLOW_COLOR_MAP: Record<string, string> = {
  'default': '#71717a',
  'workflow-blue': '#3b82f6',
  'workflow-green': '#10b981',
  'workflow-amber': '#f59e0b',
  'workflow-purple': '#8b5cf6',
  'workflow-pink': '#ec4899',
  'workflow-cyan': '#06b6d4',
  'workflow-slate': '#64748b',
};

// Wrapper component that provides selection context and layout
export default function WorkflowsWorkspace() {
  const { user, handleSignOut, updatePreferences } = useWorkspaceAuth();

  if (!user) return null;

  return (
    <WorkspaceLayoutWithInsights
      user={user}
      onSignOut={handleSignOut}
      onUpdatePreferences={updatePreferences}
    >
      <SelectionProvider>
        <WorkflowsWorkspaceContent />
      </SelectionProvider>
    </WorkspaceLayoutWithInsights>
  );
}

function WorkflowsWorkspaceContent() {
  const { user } = useAuth();
  const { displayedOthers, filters, setFilters, sort, setSort, searchQuery, setSearchQuery } = useWorkflows();
  const { labels } = useLabels();
  const { allSpaces, createSpace, updateSpace, deleteSpace } = useSpaces();
  const {
    selectedIds,
    selectionCount,
    selectAll,
    deselectAll,
  } = useSelection();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSpaceManagement, setShowSpaceManagement] = useState(false);
  const [showMemberManager, setShowMemberManager] = useState(false);

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
    await batchDeleteWorkflows(user.uid, Array.from(selectedIds));
    deselectAll();
  }, [user?.uid, selectedIds, selectionCount, deselectAll]);

  const handleBulkPin = useCallback(async () => {
    if (!user?.uid || selectionCount === 0) return;
    await batchUpdateWorkflows(user.uid, Array.from(selectedIds), { pinned: true });
    deselectAll();
  }, [user?.uid, selectedIds, selectionCount, deselectAll]);

  const handleBulkUnpin = useCallback(async () => {
    if (!user?.uid || selectionCount === 0) return;
    await batchUpdateWorkflows(user.uid, Array.from(selectedIds), { pinned: false });
    deselectAll();
  }, [user?.uid, selectedIds, selectionCount, deselectAll]);

  const handleBulkArchive = useCallback(async () => {
    if (!user?.uid || selectionCount === 0) return;
    await batchUpdateWorkflows(user.uid, Array.from(selectedIds), { archived: true });
    deselectAll();
  }, [user?.uid, selectedIds, selectionCount, deselectAll]);

  const handleBulkColorChange = useCallback(async (color: WorkflowColor) => {
    if (!user?.uid || selectionCount === 0) return;
    await batchUpdateWorkflows(user.uid, Array.from(selectedIds), { color });
    deselectAll();
  }, [user?.uid, selectedIds, selectionCount, deselectAll]);

  const handleBulkLabelAdd = useCallback(async (labelId: string) => {
    if (!user?.uid || selectionCount === 0) return;
    // For now, just add the label - in production we'd merge with existing labels
    await batchUpdateWorkflows(user.uid, Array.from(selectedIds), { labelIds: [labelId] });
    deselectAll();
  }, [user?.uid, selectedIds, selectionCount, deselectAll]);

  const handleSelectAll = useCallback(() => {
    selectAll(displayedOthers.map(workflow => workflow.id));
  }, [selectAll, displayedOthers]);

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
          label: color.replace('workflow-', '').charAt(0).toUpperCase() + color.replace('workflow-', '').slice(1),
          type: 'color',
          colorValue: WORKFLOW_COLOR_MAP[color],
        });
      });
    }

    return chips;
  }, [filters, labels]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.labels && filters.labels.length > 0) count++;
    if (filters.colors && filters.colors.length > 0) count++;
    return count;
  }, [filters]);

  const handleFilterReset = useCallback(() => {
    setFilters({
      labels: [],
      colors: [],
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
    }
  }, [filters, setFilters]);

  const handleSearchToggle = useCallback(() => {
    setIsSearchOpen((prev) => {
      if (prev) {
        setSearchQuery('');
      }
      return !prev;
    });
  }, [setSearchQuery]);

  return (
    <>
      <WorkspacePageLayout
        composer={
          <WorkflowComposer />
        }
        toolbar={
          <div className="space-y-2">
            {isSearchOpen && (
              <div className="flex items-center gap-2 justify-center">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search workflows..."
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
                viewMode="masonry"
                onViewModeChange={() => {}}
                viewOptions={VIEW_OPTIONS}
                onSearchClick={handleSearchToggle}
                isSearchActive={isSearchOpen || !!searchQuery}
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
        <WorkflowBoard />

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selectionCount}
          totalCount={displayedOthers.length}
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
