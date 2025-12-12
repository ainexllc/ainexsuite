"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Target, Zap, Flame, BarChart3, Heart, Network, Brain, Lightbulb } from "lucide-react";
import { createElement } from "react";
import { useNotes } from "@/components/providers/notes-provider";
import { useSpaces } from "@/components/providers/spaces-provider";
import { useAppColors } from "@ainexsuite/theme";
import {
  useInsightsPulldownExpanded,
  type AIInsightsPulldownSection,
} from "@ainexsuite/ui";

const INSIGHTS_STORAGE_KEY = "notes-ai-insights-expanded";

interface InsightData {
  weeklyFocus: string;
  commonThemes: string[];
  pendingActions: string[];
  // New fields
  mood: string;
  topCategories: Array<{ name: string; count: number }>;
  connections: Array<{ topic: string; noteCount: number }>;
  learningTopics: string[];
  quickTip: string;
}

interface StreakData {
  streakDays: number;
  notesThisWeek: number;
}

/**
 * Calculate writing streak and notes this week from note timestamps
 */
function calculateStreak(notes: Array<{ createdAt: Date; updatedAt: Date }>): StreakData {
  if (notes.length === 0) return { streakDays: 0, notesThisWeek: 0 };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Count notes this week
  const notesThisWeek = notes.filter((n) => n.createdAt >= weekAgo).length;

  // Calculate streak: count consecutive days with notes going backwards from today
  const noteDates = new Set(
    notes.map((n) => {
      const d = n.createdAt;
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  let streakDays = 0;
  const checkDate = new Date(today);

  // Check today first, if no note today, check yesterday as streak start
  const todayKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
  if (!noteDates.has(todayKey)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count consecutive days backwards
  let hasMoreDays = true;
  while (hasMoreDays) {
    const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
    if (noteDates.has(key)) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      hasMoreDays = false;
    }
  }

  return { streakDays, notesThisWeek };
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

export interface WorkspaceInsightsResult {
  sections: AIInsightsPulldownSection[];
  title: string;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
  refreshDisabled: boolean;
  storageKey: string;
  hasEnoughData: boolean;
}

export function useWorkspaceInsights(): WorkspaceInsightsResult {
  const { notes, loading: notesLoading } = useNotes();
  const { currentSpaceId, currentSpace } = useSpaces();
  const { primary: primaryColor } = useAppColors();

  // Check if insights are expanded (skip fetching if collapsed)
  const isExpanded = useInsightsPulldownExpanded(INSIGHTS_STORAGE_KEY);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InsightData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const previousSpaceIdRef = useRef<string | null>(null);

  // Only analyze if we have enough notes
  const RECENT_COUNT = 5;
  const recentNotes = notes
    .filter((n) => !n.archived && !n.deletedAt)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, RECENT_COUNT);

  const hasEnoughData = recentNotes.length >= 2;
  // Space-specific cache key
  const STORAGE_KEY = `ainex-notes-workspace-insights-${currentSpaceId}`;

  const saveToCache = useCallback(
    (insights: InsightData) => {
      const cacheData = {
        insights,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
      setLastUpdated(new Date());
    },
    [STORAGE_KEY]
  );

  const generateInsights = useCallback(async () => {
    if (!hasEnoughData || loading) return;

    setLoading(true);
    setError(null);

    try {
      // Prepare payload
      const payload = recentNotes.map((n) => ({
        title: n.title,
        content:
          n.type === "checklist"
            ? n.checklist.map((i) => i.text).join("\n")
            : n.body,
        date: n.updatedAt.toISOString().split("T")[0],
      }));

      const response = await fetch("/api/ai/workspace-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: payload }),
      });

      if (!response.ok) {
        // Handle specific error cases
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
      setData(result);
      saveToCache(result);
    } catch (err) {
      console.error(err);
      setError("Could not analyze workspace.");
    } finally {
      setLoading(false);
    }
  }, [hasEnoughData, loading, recentNotes, saveToCache]);

  // Reset and reload when space changes
  useEffect(() => {
    if (
      previousSpaceIdRef.current !== null &&
      previousSpaceIdRef.current !== currentSpaceId
    ) {
      // Space changed - reset state and load new data
      setData(null);
      setError(null);
      setLastUpdated(null);
    }
    previousSpaceIdRef.current = currentSpaceId;
  }, [currentSpaceId]);

  // Load from cache or auto-generate (skip if collapsed)
  useEffect(() => {
    if (notesLoading || !isExpanded) return;

    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const { insights, timestamp } = JSON.parse(cached);
        // Check if cache is from today (once per day strategy to save tokens)
        const cacheDate = new Date(timestamp).toDateString();
        const today = new Date().toDateString();

        if (cacheDate === today) {
          setData(insights);
          setLastUpdated(new Date(timestamp));
          return;
        }
      } catch {
        // Invalid cache, ignore
      }
    }

    // If no cache or expired, generate if we have data and haven't tried yet
    if (hasEnoughData && !data && !loading && !error) {
      generateInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notesLoading, hasEnoughData, currentSpaceId, isExpanded, STORAGE_KEY]);

  // Calculate streak data from all non-archived notes
  const streakData = useMemo(() => {
    const activeNotes = notes.filter((n) => !n.archived && !n.deletedAt);
    return calculateStreak(activeNotes);
  }, [notes]);

  // Build sections for the pulldown component with gradient colors (8 slides)
  const sections: AIInsightsPulldownSection[] = useMemo(() => {
    if (!data) return [];

    const allSections: AIInsightsPulldownSection[] = [];

    // 1. Current Focus (productivity)
    if (data.weeklyFocus) {
      allSections.push({
        icon: createElement(Target, { className: "h-4 w-4" }),
        label: "Current Focus",
        content: data.weeklyFocus,
        gradient: { from: primaryColor, to: "#f97316" }, // yellow → orange
      });
    }

    // 2. Writing Streak (engagement) - client-side calculated
    if (streakData.streakDays > 0 || streakData.notesThisWeek > 0) {
      allSections.push({
        icon: createElement(Flame, { className: "h-4 w-4" }),
        label: "Writing Streak",
        content: streakData.streakDays > 0
          ? `${streakData.streakDays}-day streak! You've created ${streakData.notesThisWeek} notes this week`
          : `${streakData.notesThisWeek} notes this week - start your streak today!`,
        gradient: { from: primaryColor, to: "#f97316" }, // yellow → orange
      });
    }

    // 3. Mood / Energy (wellness)
    if (data.mood) {
      allSections.push({
        icon: createElement(Heart, { className: "h-4 w-4" }),
        label: "Energy & Mood",
        content: getMoodDisplay(data.mood),
        gradient: { from: primaryColor, to: "#ec4899" }, // yellow → pink
      });
    }

    // 4. Pending Actions (tasks)
    if (data.pendingActions && data.pendingActions.length > 0) {
      allSections.push({
        icon: createElement(Zap, { className: "h-4 w-4" }),
        label: "Pending Actions",
        content: `${data.pendingActions.length} tasks requiring attention`,
        gradient: { from: primaryColor, to: "#ef4444" }, // yellow → red
        action: {
          label: "View All",
          onClick: () => {
            console.log("View all actions", data.pendingActions);
          },
        },
      });
    }

    // 5. Top Categories (analytics)
    if (data.topCategories && data.topCategories.length > 0) {
      const categoryText = data.topCategories
        .slice(0, 3)
        .map((c) => `${c.name} (${c.count})`)
        .join(", ");
      allSections.push({
        icon: createElement(BarChart3, { className: "h-4 w-4" }),
        label: "Top Categories",
        content: `Most active: ${categoryText}`,
        gradient: { from: primaryColor, to: "#8b5cf6" }, // yellow → purple
      });
    }

    // 6. Connections (organization)
    if (data.connections && data.connections.length > 0) {
      const conn = data.connections[0];
      allSections.push({
        icon: createElement(Network, { className: "h-4 w-4" }),
        label: "Connections",
        content: `${conn.noteCount} notes mention "${conn.topic}" - consider linking them`,
        gradient: { from: primaryColor, to: "#06b6d4" }, // yellow → cyan
      });
    }

    // 7. Learning Topics (growth)
    if (data.learningTopics && data.learningTopics.length > 0) {
      const topics = data.learningTopics.slice(0, 3).join(", ");
      allSections.push({
        icon: createElement(Brain, { className: "h-4 w-4" }),
        label: "Learning",
        content: `You're exploring: ${topics}`,
        gradient: { from: primaryColor, to: "#10b981" }, // yellow → green
      });
    }

    // 8. Quick Tip (actionable)
    if (data.quickTip) {
      allSections.push({
        icon: createElement(Lightbulb, { className: "h-4 w-4" }),
        label: "Quick Tip",
        content: data.quickTip,
        gradient: { from: primaryColor, to: "#f59e0b" }, // yellow → amber
      });
    }

    return allSections;
  }, [data, primaryColor, streakData]);

  // Format error message
  const errorMessage = error?.includes("API key")
    ? "AI features require configuration. Insights will be available once set up."
    : error;

  // Dynamic title based on current space
  const insightsTitle = currentSpace?.name
    ? `${currentSpace.name} Insights`
    : "AI Insights";

  return {
    sections,
    title: insightsTitle,
    isLoading: loading,
    loadingMessage: "Analyzing your recent notes...",
    error: errorMessage,
    lastUpdated,
    onRefresh: generateInsights,
    refreshDisabled: loading,
    storageKey: INSIGHTS_STORAGE_KEY,
    hasEnoughData,
  };
}
