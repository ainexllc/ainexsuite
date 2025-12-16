"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useInsightsPulldownExpanded } from "../components/ai/ai-insights-pulldown";
import type {
  WorkspaceInsightsConfig,
  WorkspaceInsightsResult,
  InsightsCacheData,
} from "./use-workspace-insights.types";

/**
 * Check if cache should be refreshed based on data changes.
 * Cache is kept valid until data actually changes - no time-based expiration.
 */
function shouldRefreshCache<TInsights>(
  cache: InsightsCacheData<TInsights>,
  currentHash: string | undefined,
  currentCount: number,
  itemCountThreshold: number
): { refresh: boolean; reason: string } {
  // 1. Hash changed → data is different, refresh
  if (currentHash && cache.dataHash && cache.dataHash !== currentHash) {
    return { refresh: true, reason: "data_changed" };
  }

  // 2. Item count changed significantly → refresh
  if (
    cache.itemCount !== undefined &&
    Math.abs(currentCount - cache.itemCount) >= itemCountThreshold
  ) {
    return { refresh: true, reason: "count_changed" };
  }

  // 3. No hash stored but count is same → keep cache
  // 4. No data change detected → keep cache (even if days old)
  return { refresh: false, reason: "cache_valid" };
}

/**
 * Shared workspace insights hook for all AinexSuite apps.
 *
 * Features:
 * - Daily caching with localStorage
 * - Lazy loading (skips fetch if panel is collapsed)
 * - Smart refresh when data changes significantly
 * - Space-aware caching
 *
 * @example
 * ```tsx
 * const insights = useWorkspaceInsights(notes, notesLoading, {
 *   appName: 'notes',
 *   expandedStorageKey: 'notes-ai-insights-expanded',
 *   spaceId: currentSpaceId,
 *   apiEndpoint: '/api/ai/workspace-insights',
 *   preparePayload: (notes) => notes.map(n => ({ title: n.title, content: n.body })),
 *   buildSections: (data, color) => [...],
 *   title: 'AI Insights',
 *   loadingMessage: 'Analyzing...',
 *   minimumDataCount: 2,
 * });
 * ```
 */
export function useWorkspaceInsights<TData, TInsights>(
  data: TData[],
  dataLoading: boolean,
  config: WorkspaceInsightsConfig<TData, TInsights>,
  spaceName?: string,
  primaryColor: string = "#eab308"
): WorkspaceInsightsResult<TInsights> {
  const {
    appName,
    expandedStorageKey,
    spaceId,
    apiEndpoint,
    preparePayload,
    buildSections,
    title,
    loadingMessage,
    minimumDataCount,
    generateDataHash,
    calculateLocalStats,
    itemCountThreshold = 5,
  } = config;

  // Check if insights panel is expanded (for lazy loading)
  const isExpanded = useInsightsPulldownExpanded(expandedStorageKey);

  // State
  const [loading, setLoading] = useState(false);
  const [insightsData, setInsightsData] = useState<TInsights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Refs for tracking
  const previousSpaceIdRef = useRef<string | null>(null);
  const dataHashRef = useRef<string>("");

  // Compute cache key (space-aware)
  const cacheKey = spaceId
    ? `ainex-${appName}-workspace-insights-${spaceId}`
    : `ainex-${appName}-workspace-insights`;

  // Check if we have enough data
  const hasEnoughData = data.length >= minimumDataCount;

  // Generate current data hash if configured
  const currentDataHash = useMemo(() => {
    if (!generateDataHash) return undefined;
    return generateDataHash(data);
  }, [data, generateDataHash]);

  // Calculate local stats if configured
  const localStats = useMemo(() => {
    if (!calculateLocalStats) return undefined;
    return calculateLocalStats(data);
  }, [data, calculateLocalStats]);

  // Save to cache
  const saveToCache = useCallback(
    (insights: TInsights) => {
      const cacheData: InsightsCacheData<TInsights> = {
        insights,
        timestamp: Date.now(),
        dataHash: currentDataHash,
        itemCount: data.length,
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      setLastUpdated(new Date());
      if (currentDataHash) {
        dataHashRef.current = currentDataHash;
      }
    },
    [cacheKey, currentDataHash, data.length]
  );

  // Generate insights via API
  const generateInsights = useCallback(async () => {
    if (!hasEnoughData || loading) return;

    setLoading(true);
    setError(null);

    try {
      const payload = preparePayload(data);

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Handle API key errors specifically
        if (response.status === 500) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Server error" }));
          if (
            errorData.error?.includes("API key") ||
            errorData.error?.includes("API Key") ||
            errorData.error?.includes("configuration missing")
          ) {
            throw new Error(
              "AI features require API key configuration. Please contact support."
            );
          }
        }
        throw new Error("Failed to generate insights");
      }

      const result = await response.json();
      setInsightsData(result);
      saveToCache(result);
    } catch (err) {
      console.error(`[${appName}] Insights error:`, err);
      setError("Could not analyze workspace.");
    } finally {
      setLoading(false);
    }
  }, [
    hasEnoughData,
    loading,
    data,
    preparePayload,
    apiEndpoint,
    saveToCache,
    appName,
  ]);

  // Reset state when space changes
  useEffect(() => {
    if (
      previousSpaceIdRef.current !== null &&
      previousSpaceIdRef.current !== spaceId
    ) {
      // Space changed - reset state
      setInsightsData(null);
      setError(null);
      setLastUpdated(null);
      dataHashRef.current = "";
    }
    previousSpaceIdRef.current = spaceId ?? null;
  }, [spaceId]);

  // Load from cache on mount (always, so data is ready when user expands)
  useEffect(() => {
    if (dataLoading) return;

    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const cacheData: InsightsCacheData<TInsights> = JSON.parse(cached);
        const { refresh } = shouldRefreshCache(
          cacheData,
          currentDataHash,
          data.length,
          itemCountThreshold
        );

        if (!refresh) {
          // Cache is valid - use it
          setInsightsData(cacheData.insights);
          setLastUpdated(new Date(cacheData.timestamp));
          if (cacheData.dataHash) {
            dataHashRef.current = cacheData.dataHash;
          }
        }
      } catch {
        // Invalid cache, ignore
      }
    }
  }, [dataLoading, cacheKey, currentDataHash, data.length, itemCountThreshold]);

  // Auto-generate when expanded and no valid cache
  useEffect(() => {
    if (dataLoading || !isExpanded || loading || error) return;

    // Check if we need to generate (no cached data yet)
    const needsGeneration = hasEnoughData && !insightsData;

    // Check if data changed (smart refresh) - only if we have existing data
    const dataChanged =
      insightsData &&
      currentDataHash &&
      dataHashRef.current &&
      currentDataHash !== dataHashRef.current;

    if (needsGeneration || dataChanged) {
      generateInsights();
    }
  }, [
    dataLoading,
    isExpanded,
    hasEnoughData,
    insightsData,
    loading,
    error,
    currentDataHash,
    generateInsights,
  ]);

  // Build sections from insights data
  const sections = useMemo(() => {
    if (!insightsData) return [];
    return buildSections(insightsData, primaryColor, localStats);
  }, [insightsData, buildSections, primaryColor, localStats]);

  // Compute title
  const resolvedTitle =
    typeof title === "function" ? title(spaceName) : title;

  // Format error message for API key issues
  const errorMessage = error?.includes("API key")
    ? "AI features require configuration. Insights will be available once set up."
    : error;

  return {
    sections,
    title: resolvedTitle,
    isLoading: loading,
    loadingMessage,
    error: errorMessage,
    lastUpdated,
    onRefresh: generateInsights,
    refreshDisabled: loading,
    storageKey: expandedStorageKey,
    hasEnoughData,
    rawData: insightsData,
    localStats,
  };
}
