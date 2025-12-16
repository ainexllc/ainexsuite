"use client";

import { useMemo } from "react";
import { useTodoStore } from "@/lib/store";
import { useAppColors } from "@ainexsuite/theme";
import {
  useWorkspaceInsights as useSharedWorkspaceInsights,
  type WorkspaceInsightsConfig,
  type WorkspaceInsightsResult,
  type AIInsightsPulldownSection,
} from "@ainexsuite/ui";
import type { Task } from "@/types/models";

// Re-export the result type for consumers
export type { WorkspaceInsightsResult };

const INSIGHTS_STORAGE_KEY = "todo-ai-insights-expanded";
const RECENT_COUNT = 10;

/**
 * Task insight data schema from API
 */
interface TaskInsightData {
  productivityTrend: string;
  recommendations: string[];
  focusArea: string;
  mood: string;
  commonTags: string[];
  blockers: string[];
  topPriorities: Array<{ title: string; dueDate?: string }>;
  upcomingDeadlines: Array<{ title: string; dueDate: string }>;
  quickTip: string;
}

/**
 * Streak and stats data calculated client-side
 */
interface TaskStatsData {
  streakDays: number;
  tasksThisWeek: number;
  completedThisWeek: number;
  overdueCount: number;
  highPriorityCount: number;
  completionRate: number;
}

/**
 * Calculate task stats from task data
 */
function calculateTaskStats(tasks: Task[]): TaskStatsData {
  if (tasks.length === 0) {
    return {
      streakDays: 0,
      tasksThisWeek: 0,
      completedThisWeek: 0,
      overdueCount: 0,
      highPriorityCount: 0,
      completionRate: 0,
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Count tasks this week
  const tasksThisWeek = tasks.filter((t) => {
    const createdAt = new Date(t.createdAt);
    return createdAt >= weekAgo;
  }).length;

  // Count completed this week
  const completedThisWeek = tasks.filter((t) => {
    const updatedAt = new Date(t.updatedAt);
    return t.status === "done" && updatedAt >= weekAgo;
  }).length;

  // Count overdue tasks
  const overdueCount = tasks.filter((t) => {
    if (!t.dueDate || t.status === "done") return false;
    const dueDate = new Date(t.dueDate);
    return dueDate < today;
  }).length;

  // Count high priority tasks
  const highPriorityCount = tasks.filter(
    (t) => (t.priority === "high" || t.priority === "urgent") && t.status !== "done"
  ).length;

  // Calculate completion rate
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate streak: count consecutive days with completed tasks going backwards
  const completionDates = new Set(
    tasks
      .filter((t) => t.status === "done")
      .map((t) => {
        const d = new Date(t.updatedAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
  );

  let streakDays = 0;
  const checkDate = new Date(today);

  // Check today first, if no completion today, check yesterday as streak start
  const todayKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
  if (!completionDates.has(todayKey)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count consecutive days backwards
  let hasMoreDays = true;
  while (hasMoreDays) {
    const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
    if (completionDates.has(key)) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      hasMoreDays = false;
    }
  }

  return {
    streakDays,
    tasksThisWeek,
    completedThisWeek,
    overdueCount,
    highPriorityCount,
    completionRate,
  };
}

/**
 * Get mood emoji/description for display
 */
function getMoodDisplay(mood: string): string {
  const moodMap: Record<string, string> = {
    productive: "Highly productive",
    focused: "Focused & on track",
    overwhelmed: "Feeling overwhelmed",
    behind: "Catching up",
    steady: "Steady progress",
    energized: "Energized & motivated",
    stressed: "Under pressure",
    neutral: "Balanced",
  };
  return moodMap[mood?.toLowerCase()] || mood || "Balanced";
}

/**
 * Build insight sections from API data and local stats
 * Uses animated AI icons for the expanded pulldown display
 */
function buildTaskSections(
  data: TaskInsightData,
  primaryColor: string,
  localStats?: object
): AIInsightsPulldownSection[] {
  const allSections: AIInsightsPulldownSection[] = [];
  const stats = localStats as TaskStatsData | undefined;

  // 1. Focus Area (productivity) - Target icon
  if (data.focusArea) {
    allSections.push({
      animatedIconType: "Target",
      label: "Focus Area",
      content: data.focusArea,
      gradient: { from: primaryColor, to: "#8b5cf6" },
    });
  }

  // 2. Completion Streak (engagement) - Sparkle icon
  if (stats && (stats.streakDays > 0 || stats.completedThisWeek > 0)) {
    allSections.push({
      animatedIconType: "Sparkle",
      label: "Completion Streak",
      content:
        stats.streakDays > 0
          ? `${stats.streakDays}-day streak! ${stats.completedThisWeek} tasks completed this week`
          : `${stats.completedThisWeek} tasks completed this week - start your streak today!`,
      gradient: { from: primaryColor, to: "#f97316" },
    });
  }

  // 3. Mood / Energy (wellness) - Robot icon
  if (data.mood) {
    allSections.push({
      animatedIconType: "Robot",
      label: "Productivity Mood",
      content: getMoodDisplay(data.mood),
      gradient: { from: primaryColor, to: "#ec4899" },
    });
  }

  // 4. Overdue Alert (needs attention) - MagicWand icon
  if (stats && stats.overdueCount > 0) {
    allSections.push({
      animatedIconType: "MagicWand",
      label: "Needs Attention",
      content: `${stats.overdueCount} overdue task${stats.overdueCount > 1 ? "s" : ""} need your attention`,
      gradient: { from: primaryColor, to: "#ef4444" },
    });
  }

  // 5. Productivity Trend (analytics) - Analytics icon
  if (data.productivityTrend) {
    allSections.push({
      animatedIconType: "Analytics",
      label: "Productivity",
      content: data.productivityTrend,
      gradient: { from: primaryColor, to: "#10b981" },
    });
  }

  // 6. Common Tags / Themes (organization) - Circuit icon
  if (data.commonTags && data.commonTags.length > 0) {
    const tagsText = data.commonTags.slice(0, 3).join(", ");
    allSections.push({
      animatedIconType: "Circuit",
      label: "Common Tags",
      content: `Active themes: ${tagsText}`,
      gradient: { from: primaryColor, to: "#06b6d4" },
    });
  }

  // 7. High Priority Count - Chat icon
  if (stats && stats.highPriorityCount > 0) {
    allSections.push({
      animatedIconType: "Chat",
      label: "High Priority",
      content: `${stats.highPriorityCount} high-priority task${stats.highPriorityCount > 1 ? "s" : ""} waiting`,
      gradient: { from: primaryColor, to: "#f59e0b" },
    });
  }

  // 8. Quick Tip (actionable) - Lightbulb icon
  if (data.quickTip) {
    allSections.push({
      animatedIconType: "Lightbulb",
      label: "Quick Tip",
      content: data.quickTip,
      gradient: { from: primaryColor, to: "#eab308" },
    });
  }

  return allSections;
}

/**
 * Todo workspace insights hook.
 * Uses the shared useWorkspaceInsights hook with todo-specific configuration.
 */
export function useTaskWorkspaceInsights(): WorkspaceInsightsResult {
  const { tasks, getCurrentSpace } = useTodoStore();
  const currentSpace = getCurrentSpace();
  const { primary: primaryColor } = useAppColors();

  // Filter to active tasks (not archived)
  const activeTasks = useMemo(() => {
    return tasks.filter((t) => !t.archived);
  }, [tasks]);

  // Recent tasks for analysis
  const recentTasks = useMemo(() => {
    return activeTasks
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, RECENT_COUNT);
  }, [activeTasks]);

  // Config for the shared hook
  const config: WorkspaceInsightsConfig<Task, TaskInsightData> = useMemo(
    () => ({
      appName: "todo",
      expandedStorageKey: INSIGHTS_STORAGE_KEY,
      spaceId: currentSpace?.id,
      apiEndpoint: "/api/ai/task-insights",

      preparePayload: (tasksToAnalyze) => ({
        tasks: tasksToAnalyze.map((t) => ({
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate,
          tags: t.tags,
          subtasks: t.subtasks.map((s) => ({
            title: s.title,
            isCompleted: s.isCompleted,
          })),
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        })),
      }),

      buildSections: buildTaskSections,

      title: (spaceName) =>
        spaceName ? `${spaceName} Insights` : "Task Insights",

      loadingMessage: "Analyzing your tasks...",
      minimumDataCount: 2,

      // Calculate stats client-side
      calculateLocalStats: () => calculateTaskStats(activeTasks),

      // Generate hash for smart refresh when tasks change
      generateDataHash: (tasksToHash) =>
        tasksToHash
          .map((t) => `${t.id}-${t.status}-${t.updatedAt}`)
          .sort()
          .join("|")
          .slice(0, 500),

      // Item count threshold for smart refresh
      itemCountThreshold: 3,
    }),
    [currentSpace?.id, activeTasks]
  );

  return useSharedWorkspaceInsights(
    recentTasks,
    false, // Tasks are loaded synchronously from store
    config,
    currentSpace?.name,
    primaryColor
  );
}
