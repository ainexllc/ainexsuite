"use client";

import { useMemo } from "react";
import { useHealthMetrics } from "@/components/providers/health-metrics-provider";
import { useAppColors } from "@ainexsuite/theme";
import {
  useWorkspaceInsights as useSharedWorkspaceInsights,
  type WorkspaceInsightsConfig,
  type WorkspaceInsightsResult,
  type AIInsightsPulldownSection,
} from "@ainexsuite/ui";
import type { HealthMetric } from "@ainexsuite/types";

// Re-export the result type for consumers
export type { WorkspaceInsightsResult };

const INSIGHTS_STORAGE_KEY = "health-ai-insights-expanded";
const RECENT_COUNT = 14; // 2 weeks of data

/**
 * Health insight data schema from API
 */
interface HealthInsightData {
  weeklyFocus: string;
  mood: string;
  recommendations: string[];
  focusArea: string;
  healthTrends: Array<{ metric: string; trend: string }>;
  quickTip: string;
}

/**
 * Streak data calculated client-side
 */
interface StreakData {
  streakDays: number;
  checkInsThisWeek: number;
}

/**
 * Calculate check-in streak and entries this week from health metric timestamps
 */
function calculateStreak(
  metrics: Array<{ date: string; createdAt: number }>
): StreakData {
  if (metrics.length === 0) return { streakDays: 0, checkInsThisWeek: 0 };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Count check-ins this week
  const checkInsThisWeek = metrics.filter((m) => {
    const date = new Date(m.date);
    return date >= weekAgo;
  }).length;

  // Calculate streak: count consecutive days with check-ins going backwards from today
  const metricDates = new Set(metrics.map((m) => m.date)); // date is already YYYY-MM-DD

  let streakDays = 0;
  const checkDate = new Date(today);

  // Format date as YYYY-MM-DD
  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  // Check today first, if no check-in today, check yesterday as streak start
  const todayKey = formatDate(checkDate);
  if (!metricDates.has(todayKey)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count consecutive days backwards
  let hasMoreDays = true;
  while (hasMoreDays) {
    const key = formatDate(checkDate);
    if (metricDates.has(key)) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      hasMoreDays = false;
    }
  }

  return { streakDays, checkInsThisWeek };
}

/**
 * Get mood display string
 */
function getMoodDisplay(mood: string): string {
  const moodMap: Record<string, string> = {
    energized: "Feeling energized",
    tired: "Running low on energy",
    balanced: "Well balanced",
    stressed: "Under some stress",
    focused: "Focused & productive",
    relaxed: "Calm & relaxed",
    improving: "On an upward trend",
    declining: "Needs attention",
  };
  return moodMap[mood?.toLowerCase()] || mood || "Balanced";
}

/**
 * Build insight sections from API data
 * Uses animated AI icons for the expanded pulldown display
 */
function buildHealthSections(
  data: HealthInsightData,
  primaryColor: string,
  localStats?: object
): AIInsightsPulldownSection[] {
  const allSections: AIInsightsPulldownSection[] = [];
  const streakData = localStats as StreakData | undefined;

  // 1. Weekly Focus - Target icon
  if (data.weeklyFocus) {
    allSections.push({
      animatedIconType: "Target",
      label: "Weekly Focus",
      content: data.weeklyFocus,
      gradient: { from: primaryColor, to: "#f97316" },
    });
  }

  // 2. Check-in Streak - Sparkle icon
  if (streakData && (streakData.streakDays > 0 || streakData.checkInsThisWeek > 0)) {
    allSections.push({
      animatedIconType: "Sparkle",
      label: "Check-in Streak",
      content:
        streakData.streakDays > 0
          ? `${streakData.streakDays}-day streak! ${streakData.checkInsThisWeek} check-ins this week`
          : `${streakData.checkInsThisWeek} check-ins this week - start your streak today!`,
      gradient: { from: primaryColor, to: "#f97316" },
    });
  }

  // 3. Energy & Mood - Brain icon
  if (data.mood) {
    allSections.push({
      animatedIconType: "Brain",
      label: "Energy & Mood",
      content: getMoodDisplay(data.mood),
      gradient: { from: primaryColor, to: "#ec4899" },
    });
  }

  // 4. Health Trends - Analytics icon
  if (data.healthTrends && data.healthTrends.length > 0) {
    const trendText = data.healthTrends
      .slice(0, 3)
      .map((t) => `${t.metric}: ${t.trend}`)
      .join(", ");
    allSections.push({
      animatedIconType: "Analytics",
      label: "Health Trends",
      content: trendText,
      gradient: { from: primaryColor, to: "#8b5cf6" },
    });
  }

  // 5. Recommendations - MagicWand icon
  if (data.recommendations && data.recommendations.length > 0) {
    const recsToShow = data.recommendations.slice(0, 2);
    const recText =
      recsToShow.join(". ") +
      (recsToShow.length < data.recommendations.length
        ? ` (+${data.recommendations.length - recsToShow.length} more)`
        : "");
    allSections.push({
      animatedIconType: "MagicWand",
      label: "Recommendations",
      content: recText,
      gradient: { from: primaryColor, to: "#ef4444" },
    });
  }

  // 6. Focus Area - Robot icon
  if (data.focusArea) {
    allSections.push({
      animatedIconType: "Robot",
      label: "Focus Area",
      content: data.focusArea,
      gradient: { from: primaryColor, to: "#06b6d4" },
    });
  }

  // 7. Quick Tip - Lightbulb icon
  if (data.quickTip) {
    allSections.push({
      animatedIconType: "Lightbulb",
      label: "Quick Tip",
      content: data.quickTip,
      gradient: { from: primaryColor, to: "#f59e0b" },
    });
  }

  return allSections;
}

/**
 * Health workspace insights hook.
 * Uses the shared useWorkspaceInsights hook with health-specific configuration.
 */
export function useWorkspaceInsights(): WorkspaceInsightsResult {
  const { metrics, loading: metricsLoading } = useHealthMetrics();
  const { primary: primaryColor } = useAppColors();

  // Filter to recent metrics for analysis
  const recentMetrics = useMemo(() => {
    return [...metrics]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, RECENT_COUNT);
  }, [metrics]);

  // Config for the shared hook
  const config: WorkspaceInsightsConfig<HealthMetric, HealthInsightData> = useMemo(
    () => ({
      appName: "health",
      expandedStorageKey: INSIGHTS_STORAGE_KEY,
      spaceId: null, // Health app doesn't have spaces yet
      apiEndpoint: "/api/ai/health-insights",

      preparePayload: (metricsToAnalyze) => ({
        metrics: metricsToAnalyze.map((m) => ({
          date: m.date,
          weight: m.weight,
          sleep: m.sleep,
          water: m.water,
          energy: m.energy,
          mood: m.mood,
          heartRate: m.heartRate,
          notes: m.notes,
        })),
      }),

      buildSections: buildHealthSections,

      title: "Health Insights",

      loadingMessage: "Analyzing your health data...",
      minimumDataCount: 2,

      // Calculate streak data client-side
      calculateLocalStats: () => calculateStreak(metrics),

      // Generate hash for smart refresh when metrics change
      generateDataHash: (metricsToHash) =>
        metricsToHash
          .map((m) => `${m.id}-${m.updatedAt}`)
          .sort()
          .join("|")
          .slice(0, 500),

      // Item count threshold for smart refresh
      itemCountThreshold: 3,
    }),
    [metrics]
  );

  return useSharedWorkspaceInsights(
    recentMetrics,
    metricsLoading,
    config,
    undefined, // No space name
    primaryColor
  );
}
