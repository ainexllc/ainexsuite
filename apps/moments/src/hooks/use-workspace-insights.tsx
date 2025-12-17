"use client";

import { useMemo } from "react";
import { useMomentsStore } from "@/lib/store";
import { useSpaces } from "@/components/providers/spaces-provider";
import { useAppColors } from "@ainexsuite/theme";
import {
  useWorkspaceInsights as useSharedWorkspaceInsights,
  type WorkspaceInsightsConfig,
  type WorkspaceInsightsResult,
  type AIInsightsPulldownSection,
} from "@ainexsuite/ui";
import type { Moment } from "@ainexsuite/types";

// Re-export the result type for consumers
export type { WorkspaceInsightsResult };

const INSIGHTS_STORAGE_KEY = "moments-ai-insights-expanded";
const RECENT_COUNT = 5;

/**
 * Moments insight data schema from API
 */
interface MomentsInsightData {
  highlight: string;
  topPeople: string[];
  moodTrend: string;
}

/**
 * Calculate local statistics from moments
 */
interface LocalStats {
  totalMoments: number;
  momentsThisWeek: number;
  uniquePeople: number;
}

/**
 * Calculate local statistics from moments
 */
function calculateLocalStats(moments: Moment[]): LocalStats {
  if (moments.length === 0) {
    return { totalMoments: 0, momentsThisWeek: 0, uniquePeople: 0 };
  }

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  // Count moments this week
  const momentsThisWeek = moments.filter((m) => m.date >= weekAgo).length;

  // Count unique people
  const allPeople = new Set<string>();
  moments.forEach((m) => {
    if (m.people && m.people.length > 0) {
      m.people.forEach((p) => allPeople.add(p));
    }
  });

  return {
    totalMoments: moments.length,
    momentsThisWeek,
    uniquePeople: allPeople.size,
  };
}

/**
 * Build insight sections from API data
 * Uses animated AI icons for the expanded pulldown display
 */
function buildMomentsSections(
  data: MomentsInsightData,
  primaryColor: string,
  localStats?: object
): AIInsightsPulldownSection[] {
  const allSections: AIInsightsPulldownSection[] = [];
  const stats = localStats as LocalStats | undefined;

  // 1. Highlight (main insight) - Sparkle icon
  if (data.highlight) {
    allSections.push({
      animatedIconType: "Sparkle",
      label: "Memory Highlight",
      content: data.highlight,
      gradient: { from: primaryColor, to: "#f97316" },
    });
  }

  // 2. Mood Trend (emotional patterns) - Brain icon
  if (data.moodTrend) {
    allSections.push({
      animatedIconType: "Brain",
      label: "Mood Trend",
      content: data.moodTrend,
      gradient: { from: primaryColor, to: "#ec4899" },
    });
  }

  // 3. Top People (connections) - NeuralNetwork icon
  if (data.topPeople && data.topPeople.length > 0) {
    const peopleText =
      data.topPeople[0] === "Just you"
        ? "Solo moments - your personal collection"
        : `Most featured: ${data.topPeople.join(", ")}`;
    allSections.push({
      animatedIconType: "NeuralNetwork",
      label: "People & Connections",
      content: peopleText,
      gradient: { from: primaryColor, to: "#06b6d4" },
    });
  }

  // 4. Activity Stats - Analytics icon
  if (stats && stats.totalMoments > 0) {
    const statsText = `${stats.totalMoments} total memories, ${stats.momentsThisWeek} captured this week`;
    allSections.push({
      animatedIconType: "Analytics",
      label: "Activity",
      content: statsText,
      gradient: { from: primaryColor, to: "#8b5cf6" },
    });
  }

  // 5. Quick Tip - Lightbulb icon
  if (stats && stats.momentsThisWeek > 0) {
    allSections.push({
      animatedIconType: "Lightbulb",
      label: "Quick Tip",
      content: "Keep capturing those special moments - you're building a beautiful story!",
      gradient: { from: primaryColor, to: "#f59e0b" },
    });
  }

  return allSections;
}

/**
 * Moments workspace insights hook.
 * Uses the shared useWorkspaceInsights hook with moments-specific configuration.
 */
export function useWorkspaceInsights(): WorkspaceInsightsResult {
  const { moments, isLoadingMoments } = useMomentsStore();
  const { currentSpaceId, currentSpace } = useSpaces();
  const { primary: primaryColor } = useAppColors();

  // Filter to recent moments (sorted by date)
  const recentMoments = useMemo(() => {
    return moments
      .sort((a, b) => b.date - a.date)
      .slice(0, RECENT_COUNT);
  }, [moments]);

  // All moments for stats calculation
  const allMoments = useMemo(() => moments, [moments]);

  // Config for the shared hook
  const config: WorkspaceInsightsConfig<Moment, MomentsInsightData> = useMemo(
    () => ({
      appName: "moments",
      expandedStorageKey: INSIGHTS_STORAGE_KEY,
      spaceId: currentSpaceId,
      apiEndpoint: "/api/ai/moments-insights",

      preparePayload: (momentsToAnalyze) => ({
        moments: momentsToAnalyze.map((m) => ({
          title: m.title,
          caption: m.caption || undefined,
          date: new Date(m.date).toISOString().split("T")[0],
          mood: m.mood || undefined,
          people: m.people || undefined,
          location: m.location || undefined,
          weather: m.weather || undefined,
        })),
      }),

      buildSections: buildMomentsSections,

      title: (spaceName) =>
        spaceName ? `${spaceName} Insights` : "Memory Insights",

      loadingMessage: "Analyzing your memories...",
      minimumDataCount: 3,

      // Calculate local stats client-side
      calculateLocalStats: () => calculateLocalStats(allMoments),

      // Generate hash for smart refresh when moments change
      generateDataHash: (momentsToHash) =>
        momentsToHash
          .map((m) => `${m.id}-${m.date}`)
          .sort()
          .join("|")
          .slice(0, 500),

      // Item count threshold for smart refresh
      itemCountThreshold: 3,
    }),
    [currentSpaceId, allMoments]
  );

  return useSharedWorkspaceInsights(
    recentMoments,
    isLoadingMoments,
    config,
    currentSpace?.name,
    primaryColor
  );
}
