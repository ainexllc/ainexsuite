'use client';

import { useMemo, useCallback, useState } from 'react';
import { LayoutGrid, X } from 'lucide-react';
import {
  WorkspacePageLayout,
  WorkspaceToolbar,
  ActiveFilterChips,
  SettingsModal,
  SpaceTabSelector,
  type ViewOption,
  type SortOption,
  type FilterChip,
  type FilterChipType,
} from '@ainexsuite/ui';
import { WorkspaceLayoutWithInsights } from '@/components/layouts/workspace-layout-with-insights';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkflowBoard } from '@/components/workflows/workflow-board';
import { WorkflowComposer } from "@/components/workflows/workflow-composer";
import { useWorkflows } from "@/components/providers/workflows-provider";
import { useLabels } from "@/components/providers/labels-provider";
import { SelectionProvider, useSelection } from "@/components/providers/selection-provider";
import { useSpaces } from "@/components/providers/spaces-provider";
import { BulkActionBar } from "@/components/bulk-action-bar";
import type { SpaceSettingsItem } from "@ainexsuite/ui";
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
  const {
    user,
    handleSignOut,
    updatePreferences,
    updateProfile,
    updateProfileImage,
    removeProfileImage,
    generateAnimatedAvatar,
    saveAnimatedAvatar,
    toggleAnimatedAvatar,
    removeAnimatedAvatar,
    pollAnimationStatus,
  } = useWorkspaceAuth();
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const { spaces, updateSpace, deleteSpace } = useSpaces();

  // Map spaces to SpaceSettingsItem format
  const spaceSettingsItems = useMemo<SpaceSettingsItem[]>(() => {
    return spaces
      .filter((s) => s.id !== 'personal')
      .map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        isGlobal: (s as { isGlobal?: boolean }).isGlobal,
        hiddenInApps: (s as { hiddenInApps?: string[] }).hiddenInApps || [],
        memberCount: s.memberUids?.length || 1,
        isOwner: ((s as { ownerId?: string; createdBy?: string }).ownerId || (s as { ownerId?: string; createdBy?: string }).createdBy) === user?.uid,
      }));
  }, [spaces, user?.uid]);

  // Handle updating space visibility
  const handleUpdateSpaceVisibility = useCallback(async (spaceId: string, hiddenInApps: string[]) => {
    await updateSpace(spaceId, { hiddenInApps });
  }, [updateSpace]);

  if (!user) return null;

  return (
    <>
      <WorkspaceLayoutWithInsights
        user={user}
        onSignOut={handleSignOut}
        onUpdatePreferences={updatePreferences}
        onSettingsClick={() => setSettingsModalOpen(true)}
      >
        <SelectionProvider>
          <WorkflowsWorkspaceContent />
        </SelectionProvider>
      </WorkspaceLayoutWithInsights>

      {/* Global Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        user={user ? {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          iconURL: user.iconURL,
          animatedAvatarURL: user.animatedAvatarURL,
          animatedAvatarStyle: user.animatedAvatarStyle,
          useAnimatedAvatar: user.useAnimatedAvatar,
        } : null}
        preferences={user?.preferences ?? {
          theme: 'dark',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notifications: { email: true, push: false, inApp: true },
        }}
        onUpdatePreferences={updatePreferences}
        onUpdateProfile={updateProfile}
        onUpdateProfileImage={updateProfileImage}
        onRemoveProfileImage={removeProfileImage}
        profileImageApiEndpoint="/api/generate-profile-image"
        onGenerateAnimatedAvatar={generateAnimatedAvatar}
        onSaveAnimatedAvatar={saveAnimatedAvatar}
        onToggleAnimatedAvatar={toggleAnimatedAvatar}
        onRemoveAnimatedAvatar={removeAnimatedAvatar}
        onPollAnimationStatus={pollAnimationStatus}
        animateAvatarApiEndpoint="/api/animate-avatar"
        spaces={spaceSettingsItems}
        currentAppId="flow"
        onUpdateSpaceVisibility={handleUpdateSpaceVisibility}
        onDeleteSpace={deleteSpace}
      />
    </>
  );
}

function WorkflowsWorkspaceContent() {
  const { user } = useAuth();
  const { displayedOthers, filters, setFilters, sort, setSort, searchQuery, setSearchQuery } = useWorkflows();
  const { labels } = useLabels();
  const { spaces, currentSpaceId, setCurrentSpace } = useSpaces();
  const {
    selectedIds,
    selectionCount,
    selectAll,
    deselectAll,
  } = useSelection();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
        composer={<WorkflowComposer placeholder={`Create a workflow for ${currentSpaceName}...`} />}
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
    </>
  );
}
