"use client";

import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@ainexsuite/auth";
import { useAppColors } from "@ainexsuite/theme";
import {
  useWorkspaceInsights as useSharedWorkspaceInsights,
  type WorkspaceInsightsConfig,
  type WorkspaceInsightsResult,
  type AIInsightsPulldownSection,
} from "@ainexsuite/ui";
import { SmartDashboardService, InsightCardData } from "@/lib/smart-dashboard";

// Re-export the result type for consumers
export type { WorkspaceInsightsResult };

const INSIGHTS_STORAGE_KEY = "main-ai-insights-expanded";

/**
 * Suite insight data schema from API
 */
interface SuiteInsightData {
  dailySummary: string;
  topPriorities: string[];
  suggestions: string[];
  wellnessNote: string;
}

/**
 * Activity stats calculated from aggregated data
 */
interface ActivityStats {
  totalActiveItems: number;
  appsWithActivity: string[];
  highPriorityCount: number;
  recentAppActivity: { app: string; count: number }[];
}

/**
 * Calculate activity stats from insight card data
 */
function calculateActivityStats(insights: InsightCardData[]): ActivityStats {
  const totalActiveItems = insights.length;
  const highPriorityCount = insights.filter(i => i.priority === "high").length;

  // Get unique apps with activity
  const appCounts = insights.reduce((acc, insight) => {
    acc[insight.appSlug] = (acc[insight.appSlug] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const appsWithActivity = Object.keys(appCounts);
  const recentAppActivity = Object.entries(appCounts)
    .map(([app, count]) => ({ app, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalActiveItems,
    appsWithActivity,
    highPriorityCount,
    recentAppActivity,
  };
}

/**
 * Build insight sections from API data
 * Uses animated AI icons for the expanded pulldown display
 */
function buildSuiteSections(
  data: SuiteInsightData,
  primaryColor: string,
  localStats?: object
): AIInsightsPulldownSection[] {
  const allSections: AIInsightsPulldownSection[] = [];
  const stats = localStats as ActivityStats | undefined;

  // 1. Daily Summary - Target icon
  if (data.dailySummary) {
    allSections.push({
      animatedIconType: "Target",
      label: "Daily Overview",
      content: data.dailySummary,
      gradient: { from: primaryColor, to: "#3b82f6" },
    });
  }

  // 2. Activity Stats - Analytics icon
  if (stats && stats.totalActiveItems > 0) {
    const activeApps = stats.appsWithActivity.length;
    allSections.push({
      animatedIconType: "Analytics",
      label: "Activity",
      content: `${stats.totalActiveItems} active items across ${activeApps} apps${stats.highPriorityCount > 0 ? ` (${stats.highPriorityCount} high priority)` : ''}`,
      gradient: { from: primaryColor, to: "#8b5cf6" },
    });
  }

  // 3. Top Priorities - MagicWand icon
  if (data.topPriorities && data.topPriorities.length > 0) {
    const prioritiesText = data.topPriorities.slice(0, 3).join(" • ");
    allSections.push({
      animatedIconType: "MagicWand",
      label: "Top Priorities",
      content: prioritiesText,
      gradient: { from: primaryColor, to: "#ef4444" },
    });
  }

  // 4. Suggestions - Lightbulb icon
  if (data.suggestions && data.suggestions.length > 0) {
    const suggestionText = data.suggestions.slice(0, 2).join(" ");
    allSections.push({
      animatedIconType: "Lightbulb",
      label: "Suggestions",
      content: suggestionText,
      gradient: { from: primaryColor, to: "#f59e0b" },
    });
  }

  // 5. Wellness Note - Brain icon
  if (data.wellnessNote) {
    allSections.push({
      animatedIconType: "Brain",
      label: "Wellness",
      content: data.wellnessNote,
      gradient: { from: primaryColor, to: "#10b981" },
    });
  }

  // 6. App Activity - NeuralNetwork icon
  if (stats && stats.recentAppActivity.length > 0) {
    const activityText = stats.recentAppActivity
      .slice(0, 3)
      .map(a => `${a.app.charAt(0).toUpperCase() + a.app.slice(1)} (${a.count})`)
      .join(", ");
    allSections.push({
      animatedIconType: "NeuralNetwork",
      label: "Active Apps",
      content: `Most active: ${activityText}`,
      gradient: { from: primaryColor, to: "#06b6d4" },
    });
  }

  return allSections;
}

/**
 * Suite workspace insights hook.
 * Uses the shared useWorkspaceInsights hook with suite-specific configuration.
 * Aggregates data from all apps via SmartDashboardService.
 */
export function useWorkspaceInsights(): WorkspaceInsightsResult {
  const { user } = useAuth();
  const { primary: primaryColor } = useAppColors();
  const [insights, setInsights] = useState<InsightCardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to aggregated insights from SmartDashboardService
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const service = new SmartDashboardService(user.uid);

    const unsubscribe = service.subscribeToInsights((data) => {
      setInsights(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Activity stats for local stats calculation
  const activityStats = useMemo(() => calculateActivityStats(insights), [insights]);

  // Prepare insight data for API payload
  const apiPayloadData = useMemo(() => {
    return insights.slice(0, 15).map(i => ({
      app: i.appSlug,
      type: i.type,
      title: i.title,
      subtitle: i.subtitle,
      priority: i.priority,
    }));
  }, [insights]);

  // Config for the shared hook
  const config: WorkspaceInsightsConfig<typeof apiPayloadData[0], SuiteInsightData> = useMemo(
    () => ({
      appName: "suite",
      expandedStorageKey: INSIGHTS_STORAGE_KEY,
      apiEndpoint: "/api/ai/suite-insights",

      preparePayload: (data) => ({
        insights: data,
      }),

      buildSections: buildSuiteSections,

      title: () => "Suite Insights",

      loadingMessage: "Analyzing your suite activity...",
      minimumDataCount: 1,

      // Calculate activity stats client-side
      calculateLocalStats: () => activityStats,

      // Generate hash for smart refresh when insights change
      generateDataHash: (data) =>
        data
          .map((i) => `${i.app}-${i.title}-${i.priority}`)
          .sort()
          .join("|")
          .slice(0, 500),

      // Item count threshold for smart refresh
      itemCountThreshold: 3,
    }),
    [activityStats]
  );

  return useSharedWorkspaceInsights(
    apiPayloadData,
    loading,
    config,
    undefined, // No space name for main app
    primaryColor
  );
}
