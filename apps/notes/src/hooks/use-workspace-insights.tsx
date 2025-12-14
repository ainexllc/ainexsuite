"use client";

import { useMemo, createElement } from "react";
import {
  Target,
  Zap,
  Flame,
  BarChart3,
  Heart,
  Network,
  Brain,
  Lightbulb,
} from "lucide-react";
import { useNotes } from "@/components/providers/notes-provider";
import { useSpaces } from "@/components/providers/spaces-provider";
import { useAppColors } from "@ainexsuite/theme";
import {
  useWorkspaceInsights as useSharedWorkspaceInsights,
  type WorkspaceInsightsConfig,
  type WorkspaceInsightsResult,
  type AIInsightsPulldownSection,
} from "@ainexsuite/ui";
import type { Note } from "@/lib/types/note";

// Re-export the result type for consumers
export type { WorkspaceInsightsResult };

const INSIGHTS_STORAGE_KEY = "notes-ai-insights-expanded";
const RECENT_COUNT = 5;

/**
 * Notes insight data schema from API
 */
interface NotesInsightData {
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
  notesThisWeek: number;
}

/**
 * Calculate writing streak and notes this week from note timestamps
 */
function calculateStreak(
  notes: Array<{ createdAt: Date; updatedAt: Date }>
): StreakData {
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

/**
 * Build insight sections from API data
 */
function buildNoteSections(
  data: NotesInsightData,
  primaryColor: string,
  localStats?: object
): AIInsightsPulldownSection[] {
  const allSections: AIInsightsPulldownSection[] = [];
  const streakData = localStats as StreakData | undefined;

  // 1. Current Focus (productivity)
  if (data.weeklyFocus) {
    allSections.push({
      icon: createElement(Target, { className: "h-4 w-4" }),
      label: "Current Focus",
      content: data.weeklyFocus,
      gradient: { from: primaryColor, to: "#f97316" },
    });
  }

  // 2. Writing Streak (engagement) - client-side calculated
  if (streakData && (streakData.streakDays > 0 || streakData.notesThisWeek > 0)) {
    allSections.push({
      icon: createElement(Flame, { className: "h-4 w-4" }),
      label: "Writing Streak",
      content:
        streakData.streakDays > 0
          ? `${streakData.streakDays}-day streak! You've created ${streakData.notesThisWeek} notes this week`
          : `${streakData.notesThisWeek} notes this week - start your streak today!`,
      gradient: { from: primaryColor, to: "#f97316" },
    });
  }

  // 3. Mood / Energy (wellness)
  if (data.mood) {
    allSections.push({
      icon: createElement(Heart, { className: "h-4 w-4" }),
      label: "Energy & Mood",
      content: getMoodDisplay(data.mood),
      gradient: { from: primaryColor, to: "#ec4899" },
    });
  }

  // 4. Pending Actions (tasks)
  if (data.pendingActions && data.pendingActions.length > 0) {
    const actionsToShow = data.pendingActions.slice(0, 2);
    const actionText =
      actionsToShow.join(". ") +
      (actionsToShow.length < data.pendingActions.length
        ? ` (+${data.pendingActions.length - actionsToShow.length} more)`
        : "");
    allSections.push({
      icon: createElement(Zap, { className: "h-4 w-4" }),
      label: "Pending Actions",
      content: actionText,
      gradient: { from: primaryColor, to: "#ef4444" },
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
      gradient: { from: primaryColor, to: "#8b5cf6" },
    });
  }

  // 6. Connections (organization)
  if (data.connections && data.connections.length > 0) {
    const conn = data.connections[0];
    allSections.push({
      icon: createElement(Network, { className: "h-4 w-4" }),
      label: "Connections",
      content: `${conn.noteCount} notes mention "${conn.topic}" - consider linking them`,
      gradient: { from: primaryColor, to: "#06b6d4" },
    });
  }

  // 7. Learning Topics (growth)
  if (data.learningTopics && data.learningTopics.length > 0) {
    const topics = data.learningTopics.slice(0, 3).join(", ");
    allSections.push({
      icon: createElement(Brain, { className: "h-4 w-4" }),
      label: "Learning",
      content: `You're exploring: ${topics}`,
      gradient: { from: primaryColor, to: "#10b981" },
    });
  }

  // 8. Quick Tip (actionable)
  if (data.quickTip) {
    allSections.push({
      icon: createElement(Lightbulb, { className: "h-4 w-4" }),
      label: "Quick Tip",
      content: data.quickTip,
      gradient: { from: primaryColor, to: "#f59e0b" },
    });
  }

  return allSections;
}

/**
 * Notes workspace insights hook.
 * Uses the shared useWorkspaceInsights hook with notes-specific configuration.
 */
export function useWorkspaceInsights(): WorkspaceInsightsResult {
  const { notes, loading: notesLoading } = useNotes();
  const { currentSpaceId, currentSpace } = useSpaces();
  const { primary: primaryColor } = useAppColors();

  // Filter to recent active notes
  const recentNotes = useMemo(() => {
    return notes
      .filter((n) => !n.archived && !n.deletedAt)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, RECENT_COUNT);
  }, [notes]);

  // All active notes for streak calculation
  const activeNotes = useMemo(() => {
    return notes.filter((n) => !n.archived && !n.deletedAt);
  }, [notes]);

  // Config for the shared hook
  const config: WorkspaceInsightsConfig<Note, NotesInsightData> = useMemo(
    () => ({
      appName: "notes",
      expandedStorageKey: INSIGHTS_STORAGE_KEY,
      spaceId: currentSpaceId,
      apiEndpoint: "/api/ai/workspace-insights",

      preparePayload: (notesToAnalyze) => ({
        notes: notesToAnalyze.map((n) => ({
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

      loadingMessage: "Analyzing your recent notes...",
      minimumDataCount: 2,

      // Calculate streak data client-side
      calculateLocalStats: () => calculateStreak(activeNotes),

      // Generate hash for smart refresh when notes change
      generateDataHash: (notesToHash) =>
        notesToHash
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
    notesLoading,
    config,
    currentSpace?.name,
    primaryColor
  );
}
