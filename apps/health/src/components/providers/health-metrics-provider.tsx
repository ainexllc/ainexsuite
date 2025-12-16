"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useWorkspaceAuth } from "@ainexsuite/auth";
import type { HealthMetric } from "@ainexsuite/types";
import {
  getHealthMetrics,
  getHealthMetricByDate,
  createHealthMetric,
  updateHealthMetric,
  deleteHealthMetric,
  getTodayDate,
} from "@/lib/health-metrics";
import type { CreateHealthMetricInput, UpdateHealthMetricInput } from "@ainexsuite/types";
import type { HealthFilterValue } from "@/components/health-filter-content";
import type { SortConfig } from "@/lib/types/settings";

interface HealthMetricsContextValue {
  metrics: HealthMetric[];
  filteredMetrics: HealthMetric[];
  todayMetric: HealthMetric | null;
  loading: boolean;
  error: string | null;
  filters: HealthFilterValue;
  setFilters: (filters: HealthFilterValue) => void;
  sort: SortConfig;
  setSort: (sort: SortConfig) => void;
  refreshData: () => Promise<void>;
  createMetric: (data: Omit<CreateHealthMetricInput, "ownerId">) => Promise<HealthMetric>;
  updateMetric: (id: string, data: UpdateHealthMetricInput) => Promise<void>;
  deleteMetric: (id: string) => Promise<void>;
}

const HealthMetricsContext = createContext<HealthMetricsContextValue | null>(null);

interface HealthMetricsProviderProps {
  children: ReactNode;
}

const DEFAULT_FILTERS: HealthFilterValue = {};
const DEFAULT_SORT: SortConfig = { field: 'date', direction: 'desc' };

export function HealthMetricsProvider({ children }: HealthMetricsProviderProps) {
  const { user } = useWorkspaceAuth();
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [todayMetric, setTodayMetric] = useState<HealthMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HealthFilterValue>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortConfig>(DEFAULT_SORT);

  const refreshData = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const [fetchedMetrics, todayData] = await Promise.all([
        getHealthMetrics(user.uid),
        getHealthMetricByDate(user.uid, getTodayDate()),
      ]);
      setMetrics(fetchedMetrics);
      setTodayMetric(todayData);
    } catch (err) {
      console.error("Failed to load health data:", err);
      setError("Failed to load health data");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Apply filters and sorting
  const filteredMetrics = useMemo(() => {
    let result = [...metrics];

    // Apply date filter
    if (filters.dateRange?.start || filters.dateRange?.end) {
      result = result.filter((m) => {
        const date = new Date(m.date);
        if (filters.dateRange?.start && date < filters.dateRange.start) return false;
        if (filters.dateRange?.end && date > filters.dateRange.end) return false;
        return true;
      });
    }

    // Apply mood filter
    if (filters.moods && filters.moods.length > 0) {
      result = result.filter((m) => m.mood && filters.moods!.includes(m.mood));
    }

    // Apply metric presence filters
    if (filters.hasWeight) {
      result = result.filter((m) => m.weight !== null && m.weight !== undefined);
    }
    if (filters.hasSleep) {
      result = result.filter((m) => m.sleep !== null && m.sleep !== undefined);
    }
    if (filters.hasWater) {
      result = result.filter((m) => m.water !== null && m.water !== undefined);
    }
    if (filters.hasEnergy) {
      result = result.filter((m) => m.energy !== null && m.energy !== undefined);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sort.field) {
        case 'date':
          aVal = a.date;
          bVal = b.date;
          break;
        case 'weight':
          aVal = a.weight ?? 0;
          bVal = b.weight ?? 0;
          break;
        case 'sleep':
          aVal = a.sleep ?? 0;
          bVal = b.sleep ?? 0;
          break;
        case 'water':
          aVal = a.water ?? 0;
          bVal = b.water ?? 0;
          break;
        case 'energy':
          aVal = a.energy ?? 0;
          bVal = b.energy ?? 0;
          break;
        default:
          aVal = a.date;
          bVal = b.date;
      }

      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [metrics, filters, sort]);

  useEffect(() => {
    if (user) {
      void refreshData();
    }
  }, [user, refreshData]);

  const createMetric = useCallback(
    async (data: Omit<CreateHealthMetricInput, "ownerId">) => {
      if (!user?.uid) throw new Error("User not authenticated");
      const result = await createHealthMetric(user.uid, data);
      await refreshData();
      return result;
    },
    [user?.uid, refreshData]
  );

  const updateMetric = useCallback(
    async (id: string, data: UpdateHealthMetricInput) => {
      await updateHealthMetric(id, data);
      await refreshData();
    },
    [refreshData]
  );

  const deleteMetric = useCallback(
    async (id: string) => {
      await deleteHealthMetric(id);
      await refreshData();
    },
    [refreshData]
  );

  const value: HealthMetricsContextValue = {
    metrics,
    filteredMetrics,
    todayMetric,
    loading,
    error,
    filters,
    setFilters,
    sort,
    setSort,
    refreshData,
    createMetric,
    updateMetric,
    deleteMetric,
  };

  return (
    <HealthMetricsContext.Provider value={value}>
      {children}
    </HealthMetricsContext.Provider>
  );
}

export function useHealthMetrics() {
  const context = useContext(HealthMetricsContext);
  if (!context) {
    throw new Error("useHealthMetrics must be used within a HealthMetricsProvider");
  }
  return context;
}
