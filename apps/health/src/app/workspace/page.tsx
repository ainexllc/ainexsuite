'use client';

import { useState, useMemo, useCallback } from 'react';
import { List, LayoutGrid, Calendar, Activity, X, Sparkles, Pill, BarChart3, Apple, Stethoscope, Dumbbell } from 'lucide-react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import type { HealthMetric } from '@ainexsuite/types';
import {
  WorkspacePageLayout,
  WorkspaceToolbar,
  WorkspaceLoadingScreen,
  ActivityCalendar,
  ActiveFilterChips,
  SpaceTabSelector,
  type ViewOption,
  type FilterChip,
  type FilterChipType,
} from '@ainexsuite/ui';
import { getTodayDate } from '@/lib/health-metrics';
import { useHealthMetrics } from '@/components/providers/health-metrics-provider';
import { usePreferences } from '@/components/providers/preferences-provider';
import { useSpaces } from '@/components/providers/spaces-provider';
import { HealthCheckinComposer } from '@/components/health-checkin-composer';
import { HealthEditModal } from '@/components/health-edit-modal';
import { HealthBoard } from '@/components/health-board';
import { HealthFilterContent } from '@/components/health-filter-content';
import { WellnessBoard } from '@/components/wellness-board';
import { MedicationDashboard } from '@/components/medications';
import { AnalyticsBoard } from '@/components/analytics';
import { NutritionDashboard } from '@/components/nutrition';
import { MedicalDashboard } from '@/components/medical';
import { FitnessBoard } from '@/components/workouts';
import { WorkoutsProvider } from '@/components/providers/workouts-provider';
import type { ViewMode, SortField } from '@/lib/types/settings';

const VIEW_OPTIONS: ViewOption<ViewMode>[] = [
  { value: 'wellness', icon: Sparkles, label: 'Wellness hub' },
  { value: 'fitness', icon: Dumbbell, label: 'Fitness' },
  { value: 'analytics', icon: BarChart3, label: 'Analytics' },
  { value: 'nutrition', icon: Apple, label: 'Nutrition' },
  { value: 'medical', icon: Stethoscope, label: 'Medical' },
  { value: 'medications', icon: Pill, label: 'Medications' },
  { value: 'list', icon: List, label: 'List view' },
  { value: 'masonry', icon: LayoutGrid, label: 'Masonry view' },
  { value: 'calendar', icon: Calendar, label: 'Calendar view' },
];

// Health-specific sort options
interface HealthSortOption {
  field: SortField;
  label: string;
}

const SORT_OPTIONS: HealthSortOption[] = [
  { field: 'date', label: 'Date' },
  { field: 'weight', label: 'Weight' },
  { field: 'sleep', label: 'Sleep' },
  { field: 'water', label: 'Water' },
  { field: 'energy', label: 'Energy' },
];

const MOOD_LABELS: Record<string, string> = {
  energetic: 'Great',
  happy: 'Good',
  neutral: 'Okay',
  stressed: 'Low',
  tired: 'Bad',
};

export default function HealthWorkspacePage() {
  const { user } = useWorkspaceAuth();
  const {
    metrics,
    todayMetric,
    loading,
    filters,
    setFilters,
    sort,
    setSort,
    searchQuery,
    setSearchQuery,
    createMetric,
    updateMetric,
    deleteMetric,
  } = useHealthMetrics();
  const { preferences, updatePreferences } = usePreferences();
  const { spaces, currentSpaceId, setCurrentSpace } = useSpaces();

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
  const [editingMetric, setEditingMetric] = useState<HealthMetric | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSaveCheckin = async (data: Partial<HealthMetric>) => {
    try {
      if (todayMetric && data.date === getTodayDate()) {
        await updateMetric(todayMetric.id, data);
      } else {
        await createMetric({
          date: data.date || getTodayDate(),
          spaceId: data.spaceId || currentSpaceId || 'personal',
          sleep: data.sleep ?? null,
          water: data.water ?? null,
          exercise: data.exercise ?? null,
          mood: data.mood ?? null,
          energy: data.energy ?? null,
          weight: data.weight ?? null,
          heartRate: data.heartRate ?? null,
          bloodPressure: data.bloodPressure ?? null,
          customMetrics: {},
          notes: data.notes || '',
        });
      }
    } catch (error) {
      console.error('Failed to save check-in:', error);
    }
  };

  const handleEditMetric = async (data: Partial<HealthMetric>) => {
    if (!editingMetric) return;
    try {
      await updateMetric(editingMetric.id, data);
      setEditingMetric(null);
    } catch (error) {
      console.error('Failed to update check-in:', error);
    }
  };

  const handleDeleteMetric = async (id: string) => {
    try {
      await deleteMetric(id);
    } catch (error) {
      console.error('Failed to delete metric:', error);
    }
  };

  // Calculate activity data for calendar view
  const activityData = useMemo(() => {
    const data: Record<string, number> = {};
    metrics.forEach((metric) => {
      const date = metric.date;
      data[date] = (data[date] || 0) + 1;
    });
    return data;
  }, [metrics]);

  // Generate filter chips
  const filterChips = useMemo(() => {
    const chips: FilterChip[] = [];

    // Mood chips
    if (filters.moods && filters.moods.length > 0) {
      filters.moods.forEach((mood) => {
        chips.push({
          id: mood,
          label: MOOD_LABELS[mood] || mood,
          type: 'label' as FilterChipType,
        });
      });
    }

    // Date range chip
    if (filters.dateRange?.start || filters.dateRange?.end) {
      const dateLabel =
        filters.datePreset && filters.datePreset !== 'custom'
          ? filters.datePreset
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')
          : 'Custom Date';
      chips.push({
        id: 'dateRange',
        label: dateLabel,
        type: 'date' as FilterChipType,
      });
    }

    // Metric presence chips
    if (filters.hasWeight) {
      chips.push({ id: 'hasWeight', label: 'Has Weight', type: 'noteType' as FilterChipType });
    }
    if (filters.hasSleep) {
      chips.push({ id: 'hasSleep', label: 'Has Sleep', type: 'noteType' as FilterChipType });
    }
    if (filters.hasWater) {
      chips.push({ id: 'hasWater', label: 'Has Water', type: 'noteType' as FilterChipType });
    }
    if (filters.hasEnergy) {
      chips.push({ id: 'hasEnergy', label: 'Has Energy', type: 'noteType' as FilterChipType });
    }

    return chips;
  }, [filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.moods && filters.moods.length > 0) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    if (filters.hasWeight || filters.hasSleep || filters.hasWater || filters.hasEnergy) count++;
    return count;
  }, [filters]);

  const handleFilterReset = useCallback(() => {
    setFilters({});
  }, [setFilters]);

  const handleRemoveChip = useCallback(
    (chipId: string, chipType: FilterChipType) => {
      switch (chipType) {
        case 'label':
          // Remove mood
          setFilters({
            ...filters,
            moods: filters.moods?.filter((m) => m !== chipId) || [],
          });
          break;
        case 'date':
          setFilters({
            ...filters,
            dateRange: { start: null, end: null },
            datePreset: undefined,
          });
          break;
        case 'noteType': {
          // Remove metric filter
          const newFilters = { ...filters };
          if (chipId === 'hasWeight') newFilters.hasWeight = undefined;
          if (chipId === 'hasSleep') newFilters.hasSleep = undefined;
          if (chipId === 'hasWater') newFilters.hasWater = undefined;
          if (chipId === 'hasEnergy') newFilters.hasEnergy = undefined;
          setFilters(newFilters);
          break;
        }
      }
    },
    [filters, setFilters]
  );

  const isCalendarView = preferences.viewMode === 'calendar';
  const isWellnessView = preferences.viewMode === 'wellness';
  const isFitnessView = preferences.viewMode === 'fitness';
  const isMedicationsView = preferences.viewMode === 'medications';
  const isAnalyticsView = preferences.viewMode === 'analytics';
  const isNutritionView = preferences.viewMode === 'nutrition';
  const isMedicalView = preferences.viewMode === 'medical';
  const isSpecialView = isWellnessView || isFitnessView || isMedicationsView || isAnalyticsView || isNutritionView || isMedicalView;

  const handleSearchToggle = useCallback(() => {
    setIsSearchOpen((prev) => {
      if (prev) {
        // Clear search when closing
        setSearchQuery('');
      }
      return !prev;
    });
  }, [setSearchQuery]);

  // Show standardized loading screen if internal data is loading
  if (loading) {
    return <WorkspaceLoadingScreen />;
  }

  if (!user) return null;

  return (
    <>
      <WorkspacePageLayout
        className="pt-[17px]"
        maxWidth="default"
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
          <HealthCheckinComposer
            existingMetric={todayMetric}
            date={getTodayDate()}
            onSave={handleSaveCheckin}
            placeholder={`Log health for ${currentSpaceName}...`}
          />
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
                    placeholder="Search check-ins..."
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
              viewMode={preferences.viewMode}
              onViewModeChange={(mode) => updatePreferences({ viewMode: mode })}
              viewOptions={VIEW_OPTIONS}
              onSearchClick={handleSearchToggle}
              isSearchActive={isSearchOpen || !!searchQuery}
              filterContent={
                <HealthFilterContent filters={filters} onFiltersChange={setFilters} />
              }
              activeFilterCount={activeFilterCount}
              onFilterReset={handleFilterReset}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              sort={sort as any}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onSortChange={setSort as any}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              sortOptions={SORT_OPTIONS as any}
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
      >
        {/* Empty State (not shown in special views) */}
        {!isSpecialView && metrics.length === 0 && (
          <div className="text-center py-12 rounded-2xl bg-foreground/5 border border-border">
            <Activity className="h-16 w-16 mx-auto mb-4 text-primary/50" />
            <p className="text-foreground/70 mb-2">No health data yet</p>
            <p className="text-muted-foreground text-sm">
              Click above to start tracking your wellness journey
            </p>
          </div>
        )}

        {/* Wellness Hub View */}
        {isWellnessView && <WellnessBoard />}

        {/* Fitness View */}
        {isFitnessView && (
          <WorkoutsProvider>
            <FitnessBoard />
          </WorkoutsProvider>
        )}

        {/* Analytics View */}
        {isAnalyticsView && <AnalyticsBoard />}

        {/* Nutrition View */}
        {isNutritionView && <NutritionDashboard />}

        {/* Medical View */}
        {isMedicalView && <MedicalDashboard />}

        {/* Medications View */}
        {isMedicationsView && <MedicationDashboard />}

        {/* Health Data Views */}
        {!isSpecialView && metrics.length > 0 && (
          isCalendarView ? (
            <ActivityCalendar
              activityData={activityData}
              size="large"
              view={preferences.calendarView || 'month'}
              onViewChange={(view) => updatePreferences({ calendarView: view })}
            />
          ) : (
            <HealthBoard onEdit={setEditingMetric} onDelete={handleDeleteMetric} />
          )
        )}
      </WorkspacePageLayout>

      {/* Edit Modal */}
      {editingMetric && (
        <HealthEditModal
          metric={editingMetric}
          onSave={handleEditMetric}
          onClose={() => setEditingMetric(null)}
        />
      )}
    </>
  );
}
