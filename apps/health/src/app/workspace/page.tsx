'use client';

import { useState, useMemo, useCallback } from 'react';
import { List, LayoutGrid, Calendar, Activity } from 'lucide-react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import type { HealthMetric } from '@ainexsuite/types';
import {
  WorkspacePageLayout,
  WorkspaceToolbar,
  WorkspaceLoadingScreen,
  ActivityCalendar,
  ActiveFilterChips,
  type ViewOption,
  type FilterChip,
  type FilterChipType,
} from '@ainexsuite/ui';
import { getTodayDate } from '@/lib/health-metrics';
import { useHealthMetrics } from '@/components/providers/health-metrics-provider';
import { usePreferences } from '@/components/providers/preferences-provider';
import { HealthCheckinComposer } from '@/components/health-checkin-composer';
import { HealthEditModal } from '@/components/health-edit-modal';
import { HealthBoard } from '@/components/health-board';
import { HealthFilterContent } from '@/components/health-filter-content';
import { SpaceSwitcher } from '@/components/spaces';
import type { ViewMode } from '@/lib/types/settings';

const VIEW_OPTIONS: ViewOption<ViewMode>[] = [
  { value: 'list', icon: List, label: 'List view' },
  { value: 'masonry', icon: LayoutGrid, label: 'Masonry view' },
  { value: 'calendar', icon: Calendar, label: 'Calendar view' },
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
    createMetric,
    updateMetric,
    deleteMetric,
  } = useHealthMetrics();
  const { preferences, updatePreferences } = usePreferences();
  const [editingMetric, setEditingMetric] = useState<HealthMetric | null>(null);

  const handleSaveCheckin = async (data: Partial<HealthMetric>) => {
    try {
      if (todayMetric && data.date === getTodayDate()) {
        await updateMetric(todayMetric.id, data);
      } else {
        await createMetric({
          date: data.date || getTodayDate(),
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

  // Show standardized loading screen if internal data is loading
  if (loading) {
    return <WorkspaceLoadingScreen />;
  }

  if (!user) return null;

  return (
    <>
      <WorkspacePageLayout
        maxWidth="default"
        composer={
          <HealthCheckinComposer
            existingMetric={todayMetric}
            date={getTodayDate()}
            onSave={handleSaveCheckin}
          />
        }
        composerActions={<SpaceSwitcher />}
        toolbar={
          <div className="space-y-2">
            <WorkspaceToolbar
              viewMode={preferences.viewMode}
              onViewModeChange={(mode) => updatePreferences({ viewMode: mode })}
              viewOptions={VIEW_OPTIONS}
              filterContent={
                <HealthFilterContent filters={filters} onFiltersChange={setFilters} />
              }
              activeFilterCount={activeFilterCount}
              onFilterReset={handleFilterReset}
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
        {/* Empty State */}
        {metrics.length === 0 && (
          <div className="text-center py-12 rounded-2xl bg-foreground/5 border border-border">
            <Activity className="h-16 w-16 mx-auto mb-4 text-primary/50" />
            <p className="text-foreground/70 mb-2">No health data yet</p>
            <p className="text-muted-foreground text-sm">
              Click above to start tracking your wellness journey
            </p>
          </div>
        )}

        {/* Views */}
        {metrics.length > 0 && (
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
