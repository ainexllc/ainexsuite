'use client';

import { useState, useMemo, useCallback } from 'react';
import { Dumbbell, UtensilsCrossed, ChefHat, Pill, Scale, LayoutDashboard } from 'lucide-react';
import {
  WorkspacePageLayout,
  WorkspaceToolbar,
  EmptyState,
  SpaceManagementModal,
  type ViewOption,
  type SortOption,
  type SortConfig,
} from '@ainexsuite/ui';
import type { SpaceType } from '@ainexsuite/types';

// Components
import { FitDashboard } from '@/components/views/FitDashboard';
import { FitComposer } from '@/components/FitComposer';
import { MemberManager } from '@/components/spaces/MemberManager';
import { FitnessBoard } from '@/components/workouts';
import { NutritionDashboard } from '@/components/nutrition';
import { RecipeDashboard } from '@/components/recipes';
import { SupplementsDashboard } from '@/components/supplements';
import { useSpaces } from '@/components/providers/spaces-provider';
import { useFitStore } from '@/lib/store';

type ViewType = 'dashboard' | 'workouts' | 'nutrition' | 'recipes' | 'supplements' | 'body-metrics';

const VIEW_OPTIONS: ViewOption<ViewType>[] = [
  { value: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { value: 'workouts', icon: Dumbbell, label: 'Workouts' },
  { value: 'nutrition', icon: UtensilsCrossed, label: 'Nutrition' },
  { value: 'recipes', icon: ChefHat, label: 'Recipes' },
  { value: 'supplements', icon: Pill, label: 'Supplements' },
  { value: 'body-metrics', icon: Scale, label: 'Body Metrics' },
];

const SORT_OPTIONS: SortOption[] = [
  { field: 'createdAt', label: 'Date created' },
  { field: 'updatedAt', label: 'Date modified' },
  { field: 'date', label: 'Date' },
];

export default function FitWorkspacePage() {
  const { currentSpaceId, viewPreferences, setViewPreference } = useFitStore();
  const { allSpaces, createSpace, updateSpace, deleteSpace } = useSpaces();

  const [showMemberManager, setShowMemberManager] = useState(false);
  const [showSpaceManagement, setShowSpaceManagement] = useState(false);
  const [sort, setSort] = useState<SortConfig>({ field: 'createdAt', direction: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Resolve view from preference or default
  const view = (viewPreferences[currentSpaceId] as ViewType) || 'dashboard';

  const handleSetView = useCallback((newView: ViewType) => {
    if (currentSpaceId) {
      setViewPreference(currentSpaceId, newView);
    }
  }, [currentSpaceId, setViewPreference]);

  // Map spaces for SpaceManagementModal
  const userSpaces = useMemo(() => {
    return allSpaces
      .filter((s) => s.id !== 'personal')
      .map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        isGlobal: (s as { isGlobal?: boolean }).isGlobal || false,
        hiddenInApps: (s as { hiddenInApps?: string[] }).hiddenInApps || [],
        memberCount: s.memberUids?.length || 1,
        isOwner: (s as { ownerId?: string; createdBy?: string }).ownerId === undefined,
      }));
  }, [allSpaces]);

  // Space management handlers
  const handleJoinGlobalSpace = useCallback(async (type: SpaceType, _hiddenInApps: string[]) => {
    await createSpace({ name: type === 'family' ? 'Family' : 'Partner', type });
  }, [createSpace]);

  const handleLeaveGlobalSpace = useCallback(async (spaceId: string) => {
    await deleteSpace(spaceId);
  }, [deleteSpace]);

  const handleCreateCustomSpace = useCallback(async (name: string, _hiddenInApps: string[]) => {
    await createSpace({ name, type: 'project' });
  }, [createSpace]);

  const handleRenameCustomSpace = useCallback(async (spaceId: string, name: string) => {
    await updateSpace(spaceId, { name });
  }, [updateSpace]);

  const handleDeleteCustomSpace = useCallback(async (spaceId: string) => {
    await deleteSpace(spaceId);
  }, [deleteSpace]);

  const handleUpdateSpaceVisibility = useCallback(async (spaceId: string, hiddenInApps: string[]) => {
    await updateSpace(spaceId, { hiddenInApps });
  }, [updateSpace]);

  const handleSearchToggle = useCallback(() => {
    setIsSearchOpen((prev) => {
      if (prev) {
        setSearchQuery('');
      }
      return !prev;
    });
  }, []);

  return (
    <>
      <WorkspacePageLayout
        composer={
          <FitComposer
            onManagePeople={() => setShowMemberManager(true)}
            onManageSpaces={() => setShowSpaceManagement(true)}
          />
        }
        toolbar={
          <WorkspaceToolbar
            viewMode={view}
            onViewModeChange={handleSetView}
            viewOptions={VIEW_OPTIONS}
            onSearchClick={handleSearchToggle}
            isSearchActive={isSearchOpen || !!searchQuery}
            activeFilterCount={0}
            sort={sort}
            onSortChange={setSort}
            sortOptions={SORT_OPTIONS}
            viewPosition="right"
          />
        }
        maxWidth="default"
      >
        {/* Content Area */}
        <div className="min-h-[60vh]">
          {view === 'dashboard' && (
            <FitDashboard />
          )}

          {view === 'workouts' && (
            <FitnessBoard />
          )}

          {view === 'nutrition' && (
            <NutritionDashboard />
          )}

          {view === 'recipes' && (
            <RecipeDashboard />
          )}

          {view === 'supplements' && (
            <SupplementsDashboard />
          )}

          {view === 'body-metrics' && (
            <EmptyState
              icon={Scale}
              title="Body metrics coming soon"
              description="Track weight, water intake, and other body measurements."
              variant="default"
            />
          )}
        </div>
      </WorkspacePageLayout>

      {/* Member Manager Modal */}
      <MemberManager
        isOpen={showMemberManager}
        onClose={() => setShowMemberManager(false)}
      />

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
    </>
  );
}
