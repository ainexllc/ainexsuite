"use client";

import { useMemo, createElement } from "react";
import {
  Target,
  Zap,
  Calendar,
  TrendingUp,
  Clock,
  AlertTriangle,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import { format, subDays, addDays, startOfDay, endOfDay } from "date-fns";
import { useAppColors } from "@ainexsuite/theme";
import {
  useWorkspaceInsights as useSharedWorkspaceInsights,
  type WorkspaceInsightsConfig,
  type WorkspaceInsightsResult,
  type AIInsightsPulldownSection,
} from "@ainexsuite/ui";
import { CalendarEvent } from "@/types/event";

// Re-export the result type for consumers
export type { WorkspaceInsightsResult as CalendarInsightsResult };

const INSIGHTS_STORAGE_KEY = "calendar-ai-insights-expanded";

/**
 * Calendar insight data schema from API
 */
interface CalendarInsightData {
  weeklyOverview: string;
  busiestDay: string | null;
  freeTimeBlocks: string[];
  meetingLoad: "increasing" | "stable" | "decreasing" | "light";
  scheduleBalance: number;
  topEventTypes: Array<{ type: string; count: number }>;
  suggestedFocusTime: string | null;
  overcommitmentWarning: string | null;
  quickTip: string;
}

function getMeetingLoadDisplay(load: string): string {
  const loadMap: Record<string, string> = {
    increasing: "Meeting load is increasing",
    stable: "Meeting load is stable",
    decreasing: "Meeting load is decreasing",
    light: "Light meeting load",
  };
  return loadMap[load?.toLowerCase()] || "Balanced schedule";
}

function getBalanceEmoji(score: number): string {
  if (score >= 80) return "Excellent balance";
  if (score >= 60) return "Good balance";
  if (score >= 40) return "Moderate balance";
  return "Consider rebalancing";
}

/**
 * Build insight sections from API data
 */
function buildCalendarSections(
  data: CalendarInsightData,
  primaryColor: string
): AIInsightsPulldownSection[] {
  const allSections: AIInsightsPulldownSection[] = [];

  // 1. Weekly Overview
  if (data.weeklyOverview) {
    allSections.push({
      icon: createElement(Target, { className: "h-4 w-4" }),
      label: "Week Overview",
      content: data.weeklyOverview,
      gradient: { from: primaryColor, to: "#3b82f6" },
    });
  }

  // 2. Busiest Day
  if (data.busiestDay) {
    allSections.push({
      icon: createElement(Calendar, { className: "h-4 w-4" }),
      label: "Busiest Day",
      content: data.busiestDay,
      gradient: { from: primaryColor, to: "#f97316" },
    });
  }

  // 3. Meeting Load Trend
  if (data.meetingLoad) {
    allSections.push({
      icon: createElement(TrendingUp, { className: "h-4 w-4" }),
      label: "Meeting Trend",
      content: getMeetingLoadDisplay(data.meetingLoad),
      gradient: { from: primaryColor, to: "#8b5cf6" },
    });
  }

  // 4. Schedule Balance
  if (data.scheduleBalance !== undefined) {
    allSections.push({
      icon: createElement(BarChart3, { className: "h-4 w-4" }),
      label: "Schedule Balance",
      content: `${data.scheduleBalance}% - ${getBalanceEmoji(data.scheduleBalance)}`,
      gradient: { from: primaryColor, to: "#10b981" },
    });
  }

  // 5. Free Time Blocks
  if (data.freeTimeBlocks && data.freeTimeBlocks.length > 0) {
    const blocks = data.freeTimeBlocks.slice(0, 3).join(", ");
    allSections.push({
      icon: createElement(Clock, { className: "h-4 w-4" }),
      label: "Free Time",
      content: `Available: ${blocks}`,
      gradient: { from: primaryColor, to: "#22c55e" },
    });
  }

  // 6. Suggested Focus Time
  if (data.suggestedFocusTime) {
    allSections.push({
      icon: createElement(Zap, { className: "h-4 w-4" }),
      label: "Focus Time",
      content: data.suggestedFocusTime,
      gradient: { from: primaryColor, to: "#eab308" },
    });
  }

  // 7. Overcommitment Warning (if any)
  if (data.overcommitmentWarning) {
    allSections.push({
      icon: createElement(AlertTriangle, { className: "h-4 w-4" }),
      label: "Warning",
      content: data.overcommitmentWarning,
      gradient: { from: primaryColor, to: "#ef4444" },
    });
  }

  // 8. Quick Tip
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
 * Calendar insights hook.
 * Uses the shared useWorkspaceInsights hook with calendar-specific configuration.
 */
export function useCalendarInsights(
  events: CalendarEvent[]
): WorkspaceInsightsResult {
  const { primary: primaryColor } = useAppColors();

  // Filter events to analyze: past 2 weeks + next 2 weeks
  const relevantEvents = useMemo(() => {
    const now = new Date();
    const twoWeeksAgo = startOfDay(subDays(now, 14));
    const twoWeeksAhead = endOfDay(addDays(now, 14));

    return events.filter((e) => {
      const eventStart = e.startTime.toDate();
      return eventStart >= twoWeeksAgo && eventStart <= twoWeeksAhead;
    });
  }, [events]);

  // Config for the shared hook
  const config: WorkspaceInsightsConfig<
    CalendarEvent,
    CalendarInsightData
  > = useMemo(
    () => ({
      appName: "calendar",
      expandedStorageKey: INSIGHTS_STORAGE_KEY,
      apiEndpoint: "/api/ai/calendar-insights",

      preparePayload: (eventsToAnalyze) => ({
        events: eventsToAnalyze.map((e) => ({
          title: e.title,
          type: e.type,
          startTime: format(e.startTime.toDate(), "EEE MMM d, h:mm a"),
          endTime: format(e.endTime.toDate(), "h:mm a"),
          allDay: e.allDay,
          location: e.location,
          description: e.description?.slice(0, 100),
        })),
      }),

      buildSections: buildCalendarSections,

      title: "Schedule Insights",
      loadingMessage: "Analyzing your calendar...",
      minimumDataCount: 3,

      // Generate hash for smart refresh when events change
      generateDataHash: (eventsToHash) =>
        eventsToHash
          .map((e) => `${e.id}-${e.title}-${e.startTime.seconds}`)
          .sort()
          .join("|")
          .slice(0, 500),

      // Item count threshold for smart refresh
      itemCountThreshold: 5,
    }),
    []
  );

  return useSharedWorkspaceInsights(
    relevantEvents,
    false, // Calendar events are already loaded
    config,
    undefined,
    primaryColor
  );
}
