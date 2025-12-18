"use client";

import { useMemo, createElement } from "react";
import {
  Target,
  Flame,
  Heart,
  Calendar,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { useSpaces } from "@/components/providers/spaces-provider";
import { useAppColors } from "@ainexsuite/theme";
import {
  useWorkspaceInsights as useSharedWorkspaceInsights,
  type WorkspaceInsightsConfig,
  type WorkspaceInsightsResult,
  type AIInsightsPulldownSection,
} from "@ainexsuite/ui";
import type { JournalEntry } from "@ainexsuite/types";

// Re-export the result type for consumers
export type { WorkspaceInsightsResult };

const INSIGHTS_STORAGE_KEY = "journey-ai-insights-expanded";
const RECENT_COUNT = 5;

/**
 * Journey insight data schema from API
 */
interface JourneyInsightData {
  moodSummary: string;
  weeklyHighlight: string;
  emotionalTrend: string;
  writingStreak: number;
  commonThemes: string[];
  reflectionPrompt: string;
}

/**
 * Streak data calculated client-side
 */
interface StreakData {
  streakDays: number;
  entriesThisWeek: number;
}

/**
 * Normalize timestamp to Date
 */
function toDate(timestamp: number | string | Date): Date {
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
}

/**
 * Calculate writing streak and entries this week from entry timestamps
 */
function calculateStreak(
  entries: Array<{ createdAt: number | string | Date }>
): StreakData {
  if (entries.length === 0) return { streakDays: 0, entriesThisWeek: 0 };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Normalize dates
  const normalizedEntries = entries.map((e) => ({
    createdAt: toDate(e.createdAt),
  }));

  // Count entries this week
  const entriesThisWeek = normalizedEntries.filter(
    (n) => n.createdAt >= weekAgo
  ).length;

  // Calculate streak: count consecutive days with entries going backwards from today
  const entryDates = new Set(
    normalizedEntries.map((n) => {
      const d = n.createdAt;
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  let streakDays = 0;
  const checkDate = new Date(today);

  // Check today first, if no entry today, check yesterday as streak start
  const todayKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
  if (!entryDates.has(todayKey)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count consecutive days backwards
  let hasMoreDays = true;
  while (hasMoreDays) {
    const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
    if (entryDates.has(key)) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      hasMoreDays = false;
    }
  }

  return { streakDays, entriesThisWeek };
}

/**
 * Build insight sections from API data
 */
function buildJourneySections(
  data: JourneyInsightData,
  primaryColor: string,
  localStats?: object
): AIInsightsPulldownSection[] {
  const allSections: AIInsightsPulldownSection[] = [];
  const streakData = localStats as StreakData | undefined;

  // 1. Writing Streak (engagement) - client-side calculated
  if (
    streakData &&
    (streakData.streakDays > 0 || streakData.entriesThisWeek > 0)
  ) {
    allSections.push({
      icon: createElement(Flame, { className: "h-4 w-4" }),
      label: "Writing Streak",
      content:
        streakData.streakDays > 0
          ? `${streakData.streakDays}-day streak! You've written ${streakData.entriesThisWeek} entries this week`
          : `${streakData.entriesThisWeek} entries this week - start your streak today!`,
      gradient: { from: primaryColor, to: "#f97316" },
    });
  }

  // 2. Mood Summary
  if (data.moodSummary) {
    allSections.push({
      icon: createElement(Heart, { className: "h-4 w-4" }),
      label: "Mood Summary",
      content: data.moodSummary,
      gradient: { from: primaryColor, to: "#ec4899" },
    });
  }

  // 3. Weekly Highlight
  if (data.weeklyHighlight) {
    allSections.push({
      icon: createElement(Target, { className: "h-4 w-4" }),
      label: "Weekly Highlight",
      content: data.weeklyHighlight,
      gradient: { from: primaryColor, to: "#8b5cf6" },
    });
  }

  // 4. Emotional Trend
  if (data.emotionalTrend) {
    allSections.push({
      icon: createElement(TrendingUp, { className: "h-4 w-4" }),
      label: "Emotional Trend",
      content: data.emotionalTrend,
      gradient: { from: primaryColor, to: "#10b981" },
    });
  }

  // 5. Common Themes
  if (data.commonThemes && data.commonThemes.length > 0) {
    allSections.push({
      icon: createElement(Calendar, { className: "h-4 w-4" }),
      label: "Common Themes",
      content: `Recurring themes: ${data.commonThemes.slice(0, 3).join(", ")}`,
      gradient: { from: primaryColor, to: "#06b6d4" },
    });
  }

  // 6. Reflection Prompt
  if (data.reflectionPrompt) {
    allSections.push({
      icon: createElement(Lightbulb, { className: "h-4 w-4" }),
      label: "Reflection Prompt",
      content: data.reflectionPrompt,
      gradient: { from: primaryColor, to: "#f59e0b" },
    });
  }

  return allSections;
}

interface UseWorkspaceInsightsOptions {
  entries: JournalEntry[];
  loading: boolean;
}

/**
 * Journey workspace insights hook.
 * Uses the shared useWorkspaceInsights hook with journey-specific configuration.
 */
export function useWorkspaceInsights(
  options?: UseWorkspaceInsightsOptions
): WorkspaceInsightsResult {
  const { entries = [], loading: entriesLoading = false } = options ?? {};
  const { currentSpaceId, currentSpace } = useSpaces();
  const { primary: primaryColor } = useAppColors();

  // Filter to recent entries (exclude archived, include all non-archived regardless of draft status)
  const recentEntries = useMemo(() => {
    return entries
      .filter((e) => !e.archived) // Only filter out archived entries
      .sort((a, b) => {
        const aTime = toDate(a.createdAt).getTime();
        const bTime = toDate(b.createdAt).getTime();
        return bTime - aTime;
      })
      .slice(0, RECENT_COUNT);
  }, [entries]);

  // Config for the shared hook
  const config: WorkspaceInsightsConfig<JournalEntry, JourneyInsightData> =
    useMemo(
      () => ({
        appName: "journal",
        expandedStorageKey: INSIGHTS_STORAGE_KEY,
        spaceId: currentSpaceId,
        apiEndpoint: "/api/ai/journal-insights",

        preparePayload: (entriesToAnalyze) => ({
          entries: entriesToAnalyze.map((e) => ({
            title: e.title,
            content: e.content,
            mood: e.mood,
            date: toDate(e.createdAt).toISOString().split("T")[0],
          })),
        }),

        buildSections: buildJourneySections,

        title: (spaceName) =>
          spaceName ? `${spaceName} Insights` : "Journal Insights",

        loadingMessage: "Analyzing your recent journal entries...",
        minimumDataCount: 2,

        // Calculate streak data client-side
        calculateLocalStats: () => calculateStreak(entries),

        // Generate hash for smart refresh when entries change
        generateDataHash: (entriesToHash) =>
          entriesToHash
            .map((e) => {
              const time = toDate(e.createdAt).getTime();
              return `${e.id}-${time}`;
            })
            .sort()
            .join("|")
            .slice(0, 500),

        // Item count threshold for smart refresh
        itemCountThreshold: 3,
      }),
      [currentSpaceId, entries]
    );

  return useSharedWorkspaceInsights(
    recentEntries,
    entriesLoading,
    config,
    currentSpace?.name,
    primaryColor
  );
}
