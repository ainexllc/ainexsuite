'use client';

import { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { EmptyState, ListSection } from '@ainexsuite/ui';
import { HealthCard } from '@/components/health-card';
import { useHealthMetrics } from '@/components/providers/health-metrics-provider';
import { usePreferences } from '@/components/providers/preferences-provider';
import type { HealthMetric } from '@ainexsuite/types';

function HealthSkeleton() {
  return (
    <div className="columns-1 sm:columns-2 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="mb-4 h-40 break-inside-avoid rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse"
        />
      ))}
    </div>
  );
}

interface HealthBoardProps {
  onEdit: (metric: HealthMetric) => void;
  onDelete: (id: string) => Promise<void>;
}

export function HealthBoard({ onEdit, onDelete }: HealthBoardProps) {
  const { metrics, loading, filteredMetrics } = useHealthMetrics();
  const { preferences } = usePreferences();

  const displayMetrics = filteredMetrics ?? metrics;

  // Separate today's check-in from others
  const { todayMetrics, pastMetrics } = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayItems: HealthMetric[] = [];
    const pastItems: HealthMetric[] = [];

    displayMetrics.forEach((metric) => {
      if (metric.date === today) {
        todayItems.push(metric);
      } else {
        pastItems.push(metric);
      }
    });

    return { todayMetrics: todayItems, pastMetrics: pastItems };
  }, [displayMetrics]);

  const hasMetrics = displayMetrics.length > 0;
  const viewMode = preferences.viewMode;
  const masonryClasses = 'columns-1 sm:columns-2 gap-4';

  return (
    <div className="space-y-1 lg:px-0">
      {loading ? (
        <HealthSkeleton />
      ) : hasMetrics ? (
        <div className="space-y-10">
          {todayMetrics.length > 0 && (
            <ListSection title="Today" count={todayMetrics.length}>
              <div className={viewMode === 'list' ? 'space-y-2' : masonryClasses}>
                {todayMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className={viewMode === 'list' ? '' : 'mb-4 break-inside-avoid'}
                  >
                    <HealthCard
                      metric={metric}
                      viewMode={viewMode}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                ))}
              </div>
            </ListSection>
          )}

          {pastMetrics.length > 0 && (
            <ListSection
              title="History"
              count={todayMetrics.length > 0 ? pastMetrics.length : undefined}
            >
              <div className={viewMode === 'list' ? 'space-y-2' : masonryClasses}>
                {pastMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className={viewMode === 'list' ? '' : 'mb-4 break-inside-avoid'}
                  >
                    <HealthCard
                      metric={metric}
                      viewMode={viewMode}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                ))}
              </div>
            </ListSection>
          )}
        </div>
      ) : metrics.length === 0 ? (
        <EmptyState
          title="No health check-ins yet"
          description="Start tracking your wellness journey by logging your first check-in above."
          icon={Activity}
          variant="default"
        />
      ) : (
        <EmptyState
          title="No check-ins match your filters"
          description="Try adjusting your filters to see more results."
          icon={Activity}
          variant="default"
        />
      )}
    </div>
  );
}
