"use client";

import { useState, useEffect } from "react";

interface InsightSection {
  label: string;
  content: string;
}

interface FitnessInsightsData {
  sections: InsightSection[];
  title: string;
  rawData?: {
    weeklyFocus?: string;
    workoutStreak?: number;
    macrosTrend?: string;
    suggestions?: string[];
  };
  localStats?: {
    workoutsThisWeek?: number;
  };
}

export function useFitnessInsights() {
  const [insights, setInsights] = useState<FitnessInsightsData>({
    sections: [],
    title: "AI Fitness Insights",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Fetch real data from workouts/nutrition providers or API
      // Placeholder data for now
      await new Promise(resolve => setTimeout(resolve, 1500));

      setInsights({
        sections: [
          {
            label: "Weekly Summary",
            content: "Great progress! You've hit 80% of your workout goals. Focus on increasing cardio next week.",
          },
          {
            label: "Macro Trends",
            content: "Protein intake steady at 150g/day. Carbs peaking mid-week – adjust for energy.",
          },
          {
            label: "Suggested Actions",
            content: "• Add 2 more strength sessions\n• Track water consistently\n• Review supplements",
          },
        ],
        title: "AI Fitness Insights",
        rawData: {
          weeklyFocus: "Consistency in workouts",
          workoutStreak: 5,
          macrosTrend: "Balanced",
          suggestions: ["Increase cardio", "Optimize macros"],
        },
        localStats: {
          workoutsThisWeek: 4,
        },
      });
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to load insights");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    sections: insights.sections,
    title: insights.title,
    isLoading,
    loadingMessage: "Analyzing your fitness data...",
    error,
    lastUpdated,
    onRefresh: refresh,
    refreshDisabled: isLoading,
    storageKey: "fit-insights",
    emptyStateMessage: "Log some workouts and meals to see insights!",
    rawData: insights.rawData,
    localStats: insights.localStats,
  };
}
