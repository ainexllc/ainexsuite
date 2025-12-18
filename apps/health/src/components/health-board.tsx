'use client';

import { useMemo } from 'react';
import { Activity } from 'lucide-react';
import Masonry from 'react-masonry-css';
import { EmptyState, ListSection } from '@ainexsuite/ui';
import { HealthCard } from '@/components/health-card';
import { useHealthMetrics } from '@/components/providers/health-metrics-provider';
import { usePreferences } from '@/components/providers/preferences-provider';
import type { HealthMetric } from '@ainexsuite/types';

const masonryBreakpoints = {
  default: 2,
  640: 1,
};

function HealthSkeleton() {
  return (
    <Masonry
      breakpointCols={masonryBreakpoints}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="mb-4 h-40 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse"
        />
      ))}
    </Masonry>
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

  // Separate today's check-in from others, sorted by latest updated
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

    // Sort by updatedAt descending (handles both Date and Firestore Timestamp)
    const getTime = (date: Date | { toDate: () => Date } | number | undefined) => {
      if (!date) return 0;
      if (typeof date === 'number') return date;
      if (date instanceof Date) return date.getTime();
      if (typeof date.toDate === 'function') return date.toDate().getTime();
      return 0;
    };
    const sortByUpdated = (a: HealthMetric, b: HealthMetric) =>
      getTime(b.updatedAt) - getTime(a.updatedAt);

    return {
      todayMetrics: todayItems.sort(sortByUpdated),
      pastMetrics: pastItems.sort(sortByUpdated)
    };
  }, [displayMetrics]);

  const hasMetrics = displayMetrics.length > 0;
  const viewMode = preferences.viewMode;

  const renderMasonry = (items: HealthMetric[]) => (
    <Masonry
      breakpointCols={masonryBreakpoints}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {items.map((metric) => (
        <div key={metric.id} className="mb-4">
          <HealthCard
            metric={metric}
            viewMode={viewMode}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </Masonry>
  );

  const renderList = (items: HealthMetric[]) => (
    <div className="space-y-2">
      {items.map((metric) => (
        <HealthCard
          key={metric.id}
          metric={metric}
          viewMode={viewMode}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-1 lg:px-0">
      {loading ? (
        <HealthSkeleton />
      ) : hasMetrics ? (
        <div className="space-y-10">
          {todayMetrics.length > 0 && (
            <ListSection title="Today" count={todayMetrics.length}>
              {viewMode === 'list' ? renderList(todayMetrics) : renderMasonry(todayMetrics)}
            </ListSection>
          )}

          {pastMetrics.length > 0 && (
            <ListSection
              title="History"
              count={todayMetrics.length > 0 ? pastMetrics.length : undefined}
            >
              {viewMode === 'list' ? renderList(pastMetrics) : renderMasonry(pastMetrics)}
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
