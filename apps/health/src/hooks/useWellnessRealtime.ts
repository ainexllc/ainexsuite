'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from '@ainexsuite/firebase';
import type { HealthMetric } from '@ainexsuite/types';

export interface WellnessRealtimeData {
  metrics: HealthMetric[];
  todayMetrics: HealthMetric | null;
  weeklyMetrics: HealthMetric[];
}

export interface UseWellnessRealtimeOptions {
  /** Maximum number of metrics to fetch (default: 30) */
  limitCount?: number;
  /** Whether to enable the subscription (default: true) */
  enabled?: boolean;
}

export interface UseWellnessRealtimeResult {
  data: WellnessRealtimeData;
  loading: boolean;
  error: Error | null;
  /** Manually refresh the data */
  refresh: () => void;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get date from N days ago in YYYY-MM-DD format
 */
function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

/**
 * Real-time Firestore hook for health metrics
 *
 * Subscribes to health_metrics collection changes for the current user
 * and returns live updates with automatic cleanup on unmount.
 *
 * @example
 * ```tsx
 * function WellnessDisplay() {
 *   const { data, loading, error } = useWellnessRealtime();
 *
 *   if (loading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return (
 *     <div>
 *       <TodayMetrics data={data.todayMetrics} />
 *       <WeeklyChart data={data.weeklyMetrics} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useWellnessRealtime(
  options: UseWellnessRealtimeOptions = {}
): UseWellnessRealtimeResult {
  const { limitCount = 30, enabled = true } = options;

  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    // Get current user
    const user = auth.currentUser;

    if (!enabled || !user) {
      setLoading(false);
      setMetrics([]);
      return;
    }

    setLoading(true);
    setError(null);

    // Build query for health_metrics collection
    const metricsQuery = query(
      collection(db, 'health_metrics'),
      where('ownerId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(limitCount)
    );

    // Subscribe to real-time updates
    const unsubscribe: Unsubscribe = onSnapshot(
      metricsQuery,
      (snapshot) => {
        const metricsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as HealthMetric[];

        setMetrics(metricsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('[useWellnessRealtime] Error fetching health metrics:', err);
        setError(err instanceof Error ? err : new Error('Failed to load health metrics'));
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount or when dependencies change
    return () => {
      unsubscribe();
    };
  }, [limitCount, enabled, refreshKey]);

  // Derive today's metrics
  const today = getTodayDateString();
  const todayMetrics = metrics.find((m) => m.date === today) ?? null;

  // Derive weekly metrics (last 7 days)
  const weekAgo = getDateDaysAgo(7);
  const weeklyMetrics = metrics.filter((m) => m.date >= weekAgo && m.date <= today);

  const data: WellnessRealtimeData = {
    metrics,
    todayMetrics,
    weeklyMetrics,
  };

  return {
    data,
    loading,
    error,
    refresh,
  };
}

export default useWellnessRealtime;
