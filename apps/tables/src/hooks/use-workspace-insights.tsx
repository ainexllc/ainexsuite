"use client";

import { useMemo } from "react";
import { useTables } from "@/components/providers/tables-provider";
import { useSpaces } from "@/components/providers/spaces-provider";
import { useAppColors } from "@ainexsuite/theme";
import {
  useWorkspaceInsights as useSharedWorkspaceInsights,
  type WorkspaceInsightsConfig,
  type WorkspaceInsightsResult,
  type AIInsightsPulldownSection,
} from "@ainexsuite/ui";
import type { Table } from "@/lib/types/table";

// Re-export the result type for consumers
export type { WorkspaceInsightsResult };

const INSIGHTS_STORAGE_KEY = "docs-ai-insights-expanded";
const RECENT_COUNT = 5;

/**
 * Notes insight data schema from API
 */
interface DocsInsightData {
  weeklyFocus: string;
  commonThemes: string[];
  pendingActions: string[];
  mood: string;
  topCategories: Array<{ name: string; count: number }>;
  connections: Array<{ topic: string; noteCount: number }>;
  learningTopics: string[];
  quickTip: string;
}

/**
 * Streak data calculated client-side
 */
interface StreakData {
  streakDays: number;
  tablesThisWeek: number;
}

/**
 * Calculate writing streak and tables this week from table timestamps
 */
function calculateStreak(
  tables: Array<{ createdAt: Date; updatedAt: Date }>
): StreakData {
  if (tables.length === 0) return { streakDays: 0, tablesThisWeek: 0 };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Count tables this week
  const tablesThisWeek = tables.filter((n) => n.createdAt >= weekAgo).length;

  // Calculate streak: count consecutive days with tables going backwards from today
  const tableDates = new Set(
    tables.map((n) => {
      const d = n.createdAt;
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  let streakDays = 0;
  const checkDate = new Date(today);

  // Check today first, if no doc today, check yesterday as streak start
  const todayKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
  if (!tableDates.has(todayKey)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count consecutive days backwards
  let hasMoreDays = true;
  while (hasMoreDays) {
    const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
    if (tableDates.has(key)) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      hasMoreDays = false;
    }
  }

  return { streakDays, tablesThisWeek };
}

/**
 * Get mood emoji/description for display
 */
function getMoodDisplay(mood: string): string {
  const moodMap: Record<string, string> = {
    creative: "Creative & inspired",
    focused: "Focused & productive",
    stressed: "Under pressure",
    productive: "Highly productive",
    reflective: "Thoughtful & reflective",
    energized: "Energized & motivated",
    overwhelmed: "Feeling overwhelmed",
    neutral: "Balanced",
  };
  return moodMap[mood?.toLowerCase()] || mood || "Balanced";
}

/**
 * Build insight sections from API data
 * Uses animated AI icons for the expanded pulldown display
 */
function buildNoteSections(
  data: DocsInsightData,
  primaryColor: string,
  localStats?: object
): AIInsightsPulldownSection[] {
  const allSections: AIInsightsPulldownSection[] = [];
  const streakData = localStats as StreakData | undefined;

  // 1. Current Focus (productivity) - Target icon
  if (data.weeklyFocus) {
    allSections.push({
      animatedIconType: "Target",
      label: "Current Focus",
      content: data.weeklyFocus,
      gradient: { from: primaryColor, to: "#f97316" },
    });
  }

  // 2. Writing Streak (engagement) - Sparkle icon
  if (streakData && (streakData.streakDays > 0 || streakData.tablesThisWeek > 0)) {
    allSections.push({
      animatedIconType: "Sparkle",
      label: "Writing Streak",
      content:
        streakData.streakDays > 0
          ? `${streakData.streakDays}-day streak! You've created ${streakData.tablesThisWeek} docs this week`
          : `${streakData.tablesThisWeek} docs this week - start your streak today!`,
      gradient: { from: primaryColor, to: "#f97316" },
    });
  }

  // 3. Mood / Energy (wellness) - Brain icon
  if (data.mood) {
    allSections.push({
      animatedIconType: "Brain",
      label: "Energy & Mood",
      content: getMoodDisplay(data.mood),
      gradient: { from: primaryColor, to: "#ec4899" },
    });
  }

  // 4. Pending Actions (tasks) - MagicWand icon
  if (data.pendingActions && data.pendingActions.length > 0) {
    const actionsToShow = data.pendingActions.slice(0, 2);
    const actionText =
      actionsToShow.join(". ") +
      (actionsToShow.length < data.pendingActions.length
        ? ` (+${data.pendingActions.length - actionsToShow.length} more)`
        : "");
    allSections.push({
      animatedIconType: "MagicWand",
      label: "Pending Actions",
      content: actionText,
      gradient: { from: primaryColor, to: "#ef4444" },
    });
  }

  // 5. Top Categories (analytics) - Analytics icon
  if (data.topCategories && data.topCategories.length > 0) {
    const categoryText = data.topCategories
      .slice(0, 3)
      .map((c) => `${c.name} (${c.count})`)
      .join(", ");
    allSections.push({
      animatedIconType: "Analytics",
      label: "Top Categories",
      content: `Most active: ${categoryText}`,
      gradient: { from: primaryColor, to: "#8b5cf6" },
    });
  }

  // 6. Connections (organization) - NeuralNetwork icon
  if (data.connections && data.connections.length > 0) {
    const conn = data.connections[0];
    allSections.push({
      animatedIconType: "NeuralNetwork",
      label: "Connections",
      content: `${conn.noteCount} docs mention "${conn.topic}" - consider linking them`,
      gradient: { from: primaryColor, to: "#06b6d4" },
    });
  }

  // 7. Learning Topics (growth) - Robot icon
  if (data.learningTopics && data.learningTopics.length > 0) {
    const topics = data.learningTopics.slice(0, 3).join(", ");
    allSections.push({
      animatedIconType: "Robot",
      label: "Exploring",
      content: `You're exploring: ${topics}`,
      gradient: { from: primaryColor, to: "#10b981" },
    });
  }

  // 8. Quick Tip (actionable) - Lightbulb icon
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
 * Notes workspace insights hook.
 * Uses the shared useWorkspaceInsights hook with docs-specific configuration.
 */
export function useWorkspaceInsights(): WorkspaceInsightsResult {
  const { tables, loading: docsLoading } = useTables();
  const { currentSpaceId, currentSpace } = useSpaces();
  const { primary: primaryColor } = useAppColors();

  // Filter to recent active tables
  const recentNotes = useMemo(() => {
    const active = tables.filter((n) => !n.archived && !n.deletedAt);
    const sorted = active.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    const result = sorted.slice(0, RECENT_COUNT);

    return result;
  }, [tables]);

  // All active tables for streak calculation
  const activeNotes = useMemo(() => {
    return tables.filter((n) => !n.archived && !n.deletedAt);
  }, [tables]);

  // Config for the shared hook
  const config: WorkspaceInsightsConfig<Table, DocsInsightData> = useMemo(
    () => ({
      appName: "tables",
      expandedStorageKey: INSIGHTS_STORAGE_KEY,
      spaceId: currentSpaceId,
      apiEndpoint: "/api/ai/workspace-insights",

      preparePayload: (docsToAnalyze) => ({
        docs: docsToAnalyze.map((n) => ({
          title: n.title,
          content:
            n.type === "checklist"
              ? n.checklist.map((i) => i.text).join("\n")
              : n.body,
          date: n.updatedAt.toISOString().split("T")[0],
        })),
      }),

      buildSections: buildNoteSections,

      title: (spaceName) =>
        spaceName ? `${spaceName} Insights` : "AI Insights",

      loadingMessage: "Analyzing your recent docs...",
      minimumDataCount: 2,

      // Calculate streak data client-side
      calculateLocalStats: () => calculateStreak(activeNotes),

      // Generate hash for smart refresh when docs change
      generateDataHash: (docsToHash) =>
        docsToHash
          .map((n) => `${n.id}-${n.updatedAt.getTime()}`)
          .sort()
          .join("|")
          .slice(0, 500),

      // Item count threshold for smart refresh
      itemCountThreshold: 3,
    }),
    [currentSpaceId, activeNotes]
  );

  return useSharedWorkspaceInsights(
    recentNotes,
    docsLoading,
    config,
    currentSpace?.name,
    primaryColor
  );
}
