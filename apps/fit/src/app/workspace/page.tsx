'use client';

import { useState, useCallback, useMemo } from 'react';
import { Dumbbell, UtensilsCrossed, ChefHat, Pill, Scale, LayoutDashboard } from 'lucide-react';
import {
  WorkspacePageLayout,
  WorkspaceToolbar,
  EmptyState,
  SpaceTabSelector,
  type ViewOption,
  type SortOption,
  type SortConfig,
} from '@ainexsuite/ui';

// Components
import { FitDashboard } from '@/components/views/FitDashboard';
import { FitComposer } from '@/components/FitComposer';
import { FitnessBoard } from '@/components/workouts';
import { NutritionDashboard } from '@/components/nutrition';
import { RecipeDashboard } from '@/components/recipes';
import { SupplementsDashboard } from '@/components/supplements';
import { useFitStore } from '@/lib/store';
import { useSpaces } from '@/components/providers/spaces-provider';

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
  const { currentSpaceId, setCurrentSpace, viewPreferences, setViewPreference } = useFitStore();
  const { spaces } = useSpaces();

  const [sort, setSort] = useState<SortConfig>({ field: 'createdAt', direction: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Build space items for SpaceTabSelector
  const spaceItems = useMemo(() =>
    spaces.filter((s) => s.id !== 'personal').map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
    })),
  [spaces]);

  // Get current space name for placeholder
  const currentSpaceName = useMemo(() => {
    if (currentSpaceId === 'personal') return 'My Fitness';
    const space = spaces.find((s) => s.id === currentSpaceId);
    return space?.name || 'My Fitness';
  }, [currentSpaceId, spaces]);

  // Resolve view from preference or default
  const view = (viewPreferences[currentSpaceId] as ViewType) || 'dashboard';

  const handleSetView = useCallback((newView: ViewType) => {
    if (currentSpaceId) {
      setViewPreference(currentSpaceId, newView);
    }
  }, [currentSpaceId, setViewPreference]);

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
        className="pt-[17px]"
        spaceSelector={spaceItems.length > 0 ? (
          <SpaceTabSelector
            spaces={spaceItems}
            currentSpaceId={currentSpaceId}
            onSpaceChange={setCurrentSpace}
            personalLabel="My Fitness"
          />
        ) : undefined}
        composer={
          <FitComposer placeholder={`Log a workout for ${currentSpaceName}...`} />
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
    </>
  );
}
