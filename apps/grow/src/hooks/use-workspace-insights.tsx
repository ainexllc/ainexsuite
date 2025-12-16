"use client";

import { useMemo } from "react";
import { useGrowStore } from "@/lib/store";
import { useSpaces } from "@/components/providers/spaces-provider";
import { useAppColors } from "@ainexsuite/theme";
import {
  useWorkspaceInsights as useSharedWorkspaceInsights,
  type WorkspaceInsightsConfig,
  type WorkspaceInsightsResult,
  type AIInsightsPulldownSection,
} from "@ainexsuite/ui";
import type { Habit, Completion } from "@/types/models";

// Re-export the result type for consumers
export type { WorkspaceInsightsResult };

const INSIGHTS_STORAGE_KEY = "grow-ai-insights-expanded";
const RECENT_COUNT = 10;

/**
 * Habit insight data schema from API
 */
interface HabitInsightData {
  consistencyTrend: string;
  focusArea: string;
  mood: string;
  strongestHabits: string[];
  needsAttention: string[];
  suggestedHabit: string;
  motivationalTip: string;
  weeklyGoal: string;
}

/**
 * Stats data calculated client-side
 */
interface HabitStatsData {
  streakDays: number;
  completedToday: number;
  totalHabits: number;
  activeHabits: number;
  consistencyRate: number;
  bestStreak: number;
}

/**
 * Calculate habit stats from habit and completion data
 */
function calculateHabitStats(
  habits: Habit[],
  completions: Completion[]
): HabitStatsData {
  if (habits.length === 0) {
    return {
      streakDays: 0,
      completedToday: 0,
      totalHabits: 0,
      activeHabits: 0,
      consistencyRate: 0,
      bestStreak: 0,
    };
  }

  const today = new Date().toISOString().split("T")[0];
  const todayCompletions = completions.filter((c) => c.date === today);
  const completedHabitIds = new Set(todayCompletions.map((c) => c.habitId));

  const activeHabits = habits.filter((h) => !h.isFrozen);
  const completedToday = habits.filter((h) => completedHabitIds.has(h.id)).length;

  // Calculate average current streak
  const totalCurrentStreak = habits.reduce(
    (sum, h) => sum + (h.currentStreak || 0),
    0
  );
  const avgStreak = habits.length > 0 ? Math.round(totalCurrentStreak / habits.length) : 0;

  // Best streak across all habits
  const bestStreak = Math.max(...habits.map((h) => h.bestStreak || 0), 0);

  // Calculate consistency rate (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split("T")[0];

  const recentCompletions = completions.filter((c) => c.date >= weekAgoStr);
  const expectedCompletions = activeHabits.length * 7;
  const consistencyRate =
    expectedCompletions > 0
      ? Math.round((recentCompletions.length / expectedCompletions) * 100)
      : 0;

  return {
    streakDays: avgStreak,
    completedToday,
    totalHabits: habits.length,
    activeHabits: activeHabits.length,
    consistencyRate,
    bestStreak,
  };
}

/**
 * Get mood display for productivity
 */
function getMoodDisplay(mood: string): string {
  const moodMap: Record<string, string> = {
    thriving: "Thriving & consistent",
    growing: "Growing steadily",
    steady: "Maintaining habits",
    struggling: "Needs attention",
    starting: "Just getting started",
    motivated: "Highly motivated",
    overwhelmed: "Feeling overwhelmed",
    neutral: "Balanced",
  };
  return moodMap[mood?.toLowerCase()] || mood || "Balanced";
}

/**
 * Build insight sections from API data and local stats
 * Uses animated AI icons for the expanded pulldown display
 */
function buildHabitSections(
  data: HabitInsightData,
  primaryColor: string,
  localStats?: object
): AIInsightsPulldownSection[] {
  const allSections: AIInsightsPulldownSection[] = [];
  const stats = localStats as HabitStatsData | undefined;

  // 1. Focus Area - Target icon
  if (data.focusArea) {
    allSections.push({
      animatedIconType: "Target",
      label: "Focus Area",
      content: data.focusArea,
      gradient: { from: primaryColor, to: "#14b8a6" },
    });
  }

  // 2. Streak/Progress - Sparkle icon
  if (stats && (stats.streakDays > 0 || stats.completedToday > 0)) {
    allSections.push({
      animatedIconType: "Sparkle",
      label: "Today's Progress",
      content:
        stats.completedToday > 0
          ? `${stats.completedToday}/${stats.activeHabits} habits completed today! Avg streak: ${stats.streakDays} days`
          : `${stats.activeHabits} habits waiting - start your streak!`,
      gradient: { from: primaryColor, to: "#f97316" },
    });
  }

  // 3. Mood/Energy - Robot icon
  if (data.mood) {
    allSections.push({
      animatedIconType: "Robot",
      label: "Habit Momentum",
      content: getMoodDisplay(data.mood),
      gradient: { from: primaryColor, to: "#ec4899" },
    });
  }

  // 4. Consistency Trend - Analytics icon
  if (data.consistencyTrend) {
    allSections.push({
      animatedIconType: "Analytics",
      label: "Consistency",
      content: data.consistencyTrend,
      gradient: { from: primaryColor, to: "#10b981" },
    });
  }

  // 5. Strongest Habits - Circuit icon
  if (data.strongestHabits && data.strongestHabits.length > 0) {
    const habitsText = data.strongestHabits.slice(0, 2).join(", ");
    allSections.push({
      animatedIconType: "Circuit",
      label: "Strongest Habits",
      content: `Keep it up: ${habitsText}`,
      gradient: { from: primaryColor, to: "#06b6d4" },
    });
  }

  // 6. Needs Attention - MagicWand icon
  if (data.needsAttention && data.needsAttention.length > 0) {
    const needsText = data.needsAttention.slice(0, 2).join(", ");
    allSections.push({
      animatedIconType: "MagicWand",
      label: "Needs Attention",
      content: needsText,
      gradient: { from: primaryColor, to: "#ef4444" },
    });
  }

  // 7. Weekly Goal - Chat icon
  if (data.weeklyGoal) {
    allSections.push({
      animatedIconType: "Chat",
      label: "Weekly Goal",
      content: data.weeklyGoal,
      gradient: { from: primaryColor, to: "#8b5cf6" },
    });
  }

  // 8. Motivational Tip - Lightbulb icon
  if (data.motivationalTip) {
    allSections.push({
      animatedIconType: "Lightbulb",
      label: "Quick Tip",
      content: data.motivationalTip,
      gradient: { from: primaryColor, to: "#eab308" },
    });
  }

  return allSections;
}

/**
 * Grow workspace insights hook.
 * Uses the shared useWorkspaceInsights hook with habit-specific configuration.
 */
export function useHabitWorkspaceInsights(): WorkspaceInsightsResult {
  const { habits, completions, getCurrentSpace } = useGrowStore();
  const { currentSpaceId } = useSpaces();
  const currentSpace = getCurrentSpace();
  const { primary: primaryColor } = useAppColors();

  // Filter to space habits (not frozen)
  const spaceHabits = useMemo(() => {
    const effectiveSpaceId = currentSpaceId || currentSpace?.id;
    if (!effectiveSpaceId) return habits.filter((h) => !h.isFrozen);
    return habits.filter((h) => h.spaceId === effectiveSpaceId && !h.isFrozen);
  }, [habits, currentSpaceId, currentSpace?.id]);

  // Recent habits for analysis (most recently updated)
  const recentHabits = useMemo(() => {
    return [...spaceHabits]
      .sort((a, b) => {
        const aTime = a.lastCompletedAt
          ? new Date(a.lastCompletedAt).getTime()
          : new Date(a.createdAt).getTime();
        const bTime = b.lastCompletedAt
          ? new Date(b.lastCompletedAt).getTime()
          : new Date(b.createdAt).getTime();
        return bTime - aTime;
      })
      .slice(0, RECENT_COUNT);
  }, [spaceHabits]);

  // Space completions for stats
  const spaceCompletions = useMemo(() => {
    const effectiveSpaceId = currentSpaceId || currentSpace?.id;
    if (!effectiveSpaceId) return completions;
    return completions.filter((c) => c.spaceId === effectiveSpaceId);
  }, [completions, currentSpaceId, currentSpace?.id]);

  // Config for the shared hook
  const config: WorkspaceInsightsConfig<Habit, HabitInsightData> = useMemo(
    () => ({
      appName: "grow",
      expandedStorageKey: INSIGHTS_STORAGE_KEY,
      spaceId: currentSpaceId || currentSpace?.id,
      apiEndpoint: "/api/ai/workspace-insights",

      preparePayload: (habitsToAnalyze) => ({
        habits: habitsToAnalyze.map((h) => ({
          title: h.title,
          description: h.description,
          currentStreak: h.currentStreak,
          bestStreak: h.bestStreak,
          isFrozen: h.isFrozen,
          scheduleType: h.schedule.type,
          lastCompletedAt: h.lastCompletedAt,
          createdAt: h.createdAt,
        })),
      }),

      buildSections: buildHabitSections,

      title: (spaceName) =>
        spaceName ? `${spaceName} Insights` : "Habit Insights",

      loadingMessage: "Analyzing your habits...",
      minimumDataCount: 2,

      // Calculate stats client-side
      calculateLocalStats: () => calculateHabitStats(spaceHabits, spaceCompletions),

      // Generate hash for smart refresh when habits change
      generateDataHash: (habitsToHash) =>
        habitsToHash
          .map((h) => `${h.id}-${h.currentStreak}-${h.lastCompletedAt || ""}`)
          .sort()
          .join("|")
          .slice(0, 500),

      // Item count threshold for smart refresh
      itemCountThreshold: 2,
    }),
    [currentSpaceId, currentSpace?.id, spaceHabits, spaceCompletions]
  );

  return useSharedWorkspaceInsights(
    recentHabits,
    false, // Habits are loaded synchronously from store
    config,
    currentSpace?.name,
    primaryColor
  );
}
