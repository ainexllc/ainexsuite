"use client";

import { useMemo } from "react";
import { useWorkouts } from "@/components/providers/workouts-provider";
import { useSpaces } from "@/components/providers/spaces-provider";
import { useAppColors } from "@ainexsuite/theme";
import {
  useWorkspaceInsights as useSharedWorkspaceInsights,
  type WorkspaceInsightsConfig,
  type WorkspaceInsightsResult,
  type AIInsightsPulldownSection,
} from "@ainexsuite/ui";
import type { Workout } from "@/lib/types/workout";

// Re-export the result type for consumers
export type { WorkspaceInsightsResult };

const INSIGHTS_STORAGE_KEY = "fit-ai-insights-expanded";
const RECENT_COUNT = 10;

/**
 * Fitness insight data schema from API
 */
interface FitnessInsightData {
  weeklyFocus: string;
  workoutTrend: string;
  nutritionTrend: string;
  suggestions: string[];
  personalRecord: string;
  nextSteps: string;
}

/**
 * Local stats calculated client-side
 */
interface LocalStats {
  workoutsThisWeek: number;
  totalDuration: number;
  averageDuration: number;
  streakDays: number;
}

/**
 * Calculate local stats from workouts
 */
function calculateLocalStats(workouts: Workout[]): LocalStats {
  if (workouts.length === 0) {
    return {
      workoutsThisWeek: 0,
      totalDuration: 0,
      averageDuration: 0,
      streakDays: 0,
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Filter workouts this week
  const weekWorkouts = workouts.filter((w) => {
    const workoutDate = new Date(w.date);
    return workoutDate >= weekAgo;
  });

  const totalDuration = weekWorkouts.reduce((acc, w) => acc + (w.duration || 0), 0);

  // Calculate streak
  const workoutDates = new Set(
    workouts.map((w) => {
      const d = new Date(w.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  let streakDays = 0;
  const checkDate = new Date(today);

  // Check today first
  const todayKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
  if (!workoutDates.has(todayKey)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count consecutive days
  let hasMoreDays = true;
  while (hasMoreDays) {
    const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
    if (workoutDates.has(key)) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      hasMoreDays = false;
    }
  }

  return {
    workoutsThisWeek: weekWorkouts.length,
    totalDuration,
    averageDuration: weekWorkouts.length > 0 ? Math.round(totalDuration / weekWorkouts.length) : 0,
    streakDays,
  };
}

/**
 * Build insight sections from API data
 */
function buildFitnessSections(
  data: FitnessInsightData,
  primaryColor: string,
  localStats?: object
): AIInsightsPulldownSection[] {
  const allSections: AIInsightsPulldownSection[] = [];
  const stats = localStats as LocalStats | undefined;

  // 1. Weekly Overview - Analytics icon
  if (stats && stats.workoutsThisWeek > 0) {
    allSections.push({
      animatedIconType: "Analytics",
      label: "This Week",
      content: `${stats.workoutsThisWeek} workout${stats.workoutsThisWeek > 1 ? "s" : ""}, ${stats.totalDuration} minutes total`,
      gradient: { from: primaryColor, to: "#3b82f6" },
    });
  }

  // 2. Weekly Focus - Target icon
  if (data.weeklyFocus) {
    allSections.push({
      animatedIconType: "Target",
      label: "Focus",
      content: data.weeklyFocus,
      gradient: { from: primaryColor, to: "#f97316" },
    });
  }

  // 3. Workout Streak - Sparkle icon
  if (stats && stats.streakDays > 0) {
    allSections.push({
      animatedIconType: "Sparkle",
      label: "Streak",
      content: `${stats.streakDays}-day workout streak! Keep it going!`,
      gradient: { from: primaryColor, to: "#10b981" },
    });
  }

  // 4. Workout Trend - Brain icon
  if (data.workoutTrend) {
    allSections.push({
      animatedIconType: "Brain",
      label: "Workout Trend",
      content: data.workoutTrend,
      gradient: { from: primaryColor, to: "#8b5cf6" },
    });
  }

  // 5. Nutrition Trend - NeuralNetwork icon
  if (data.nutritionTrend) {
    allSections.push({
      animatedIconType: "NeuralNetwork",
      label: "Nutrition",
      content: data.nutritionTrend,
      gradient: { from: primaryColor, to: "#ec4899" },
    });
  }

  // 6. Suggestions - MagicWand icon
  if (data.suggestions && data.suggestions.length > 0) {
    const suggestionsToShow = data.suggestions.slice(0, 2);
    const suggestionText =
      suggestionsToShow.join(". ") +
      (suggestionsToShow.length < data.suggestions.length
        ? ` (+${data.suggestions.length - suggestionsToShow.length} more)`
        : "");
    allSections.push({
      animatedIconType: "MagicWand",
      label: "Suggestions",
      content: suggestionText,
      gradient: { from: primaryColor, to: "#06b6d4" },
    });
  }

  // 7. Personal Record - Robot icon
  if (data.personalRecord) {
    allSections.push({
      animatedIconType: "Robot",
      label: "Win",
      content: data.personalRecord,
      gradient: { from: primaryColor, to: "#eab308" },
    });
  }

  // 8. Next Steps - Lightbulb icon
  if (data.nextSteps) {
    allSections.push({
      animatedIconType: "Lightbulb",
      label: "Next Step",
      content: data.nextSteps,
      gradient: { from: primaryColor, to: "#f59e0b" },
    });
  }

  return allSections;
}

/**
 * Fitness workspace insights hook.
 * Uses the shared useWorkspaceInsights hook with fitness-specific configuration.
 */
export function useFitnessInsights(): WorkspaceInsightsResult {
  const { workouts, isLoading: workoutsLoading } = useWorkouts();
  const { currentSpaceId, currentSpace } = useSpaces();
  const { primary: primaryColor } = useAppColors();

  // Filter to non-archived workouts
  const activeWorkouts = useMemo(() => {
    return workouts.filter((w) => !w.archived);
  }, [workouts]);

  // Recent workouts for analysis (sorted by date)
  const recentWorkouts = useMemo(() => {
    const sorted = [...activeWorkouts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sorted.slice(0, RECENT_COUNT);
  }, [activeWorkouts]);

  // Config for the shared hook
  const config: WorkspaceInsightsConfig<Workout, FitnessInsightData> = useMemo(
    () => ({
      appName: "fit",
      expandedStorageKey: INSIGHTS_STORAGE_KEY,
      spaceId: currentSpaceId,
      apiEndpoint: "/api/ai/fitness-insights",

      preparePayload: (workoutsToAnalyze) => ({
        workouts: workoutsToAnalyze.map((w) => ({
          name: w.title,
          type: w.exercises.length > 0 ? "strength" : "cardio",
          date: w.date,
          duration: w.duration,
          exercises: w.exercises.length,
        })),
      }),

      buildSections: buildFitnessSections,

      title: (spaceName) =>
        spaceName ? `${spaceName} Insights` : "Fitness Insights",

      loadingMessage: "Analyzing your fitness data...",
      minimumDataCount: 2,

      // Calculate stats client-side
      calculateLocalStats: () => calculateLocalStats(activeWorkouts),

      // Generate hash for smart refresh when workouts change
      generateDataHash: (workoutsToHash) =>
        workoutsToHash
          .map((w) => `${w.id}-${w.date}-${w.duration}`)
          .sort()
          .join("|")
          .slice(0, 500),

      // Item count threshold for smart refresh
      itemCountThreshold: 2,
    }),
    [currentSpaceId, activeWorkouts]
  );

  return useSharedWorkspaceInsights(
    recentWorkouts,
    workoutsLoading,
    config,
    currentSpace?.name,
    primaryColor
  );
}
