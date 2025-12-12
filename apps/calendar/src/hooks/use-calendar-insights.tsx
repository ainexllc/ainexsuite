"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
import { createElement } from "react";
import { format, subDays, addDays, startOfDay, endOfDay } from "date-fns";
import { useAppColors } from "@ainexsuite/theme";
import {
  useInsightsPulldownExpanded,
  type AIInsightsPulldownSection,
} from "@ainexsuite/ui";
import { CalendarEvent } from "@/types/event";

const INSIGHTS_STORAGE_KEY = "calendar-ai-insights-expanded";
const CACHE_KEY = "ainex-calendar-insights";

interface InsightData {
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

export interface CalendarInsightsResult {
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

export function useCalendarInsights(events: CalendarEvent[]): CalendarInsightsResult {
  const { primary: primaryColor } = useAppColors();

  // Check if insights are expanded (skip fetching if collapsed)
  const isExpanded = useInsightsPulldownExpanded(INSIGHTS_STORAGE_KEY);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InsightData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const eventsHashRef = useRef<string>("");

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

  const hasEnoughData = relevantEvents.length >= 3;

  // Create a hash of events to detect changes
  const eventsHash = useMemo(() => {
    return relevantEvents
      .map((e) => `${e.id}-${e.title}-${e.startTime.seconds}`)
      .sort()
      .join("|")
      .slice(0, 500);
  }, [relevantEvents]);

  const saveToCache = useCallback((insights: InsightData) => {
    const cacheData = {
      insights,
      timestamp: Date.now(),
      eventsHash,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    setLastUpdated(new Date());
  }, [eventsHash]);

  const generateInsights = useCallback(async () => {
    if (!hasEnoughData || loading) return;

    setLoading(true);
    setError(null);

    try {
      // Prepare payload
      const payload = relevantEvents.map((e) => ({
        title: e.title,
        type: e.type,
        startTime: format(e.startTime.toDate(), "EEE MMM d, h:mm a"),
        endTime: format(e.endTime.toDate(), "h:mm a"),
        allDay: e.allDay,
        location: e.location,
        description: e.description?.slice(0, 100),
      }));

      const response = await fetch("/api/ai/calendar-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: payload }),
      });

      if (!response.ok) {
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
      eventsHashRef.current = eventsHash;
    } catch (err) {
      console.error(err);
      setError("Could not analyze calendar.");
    } finally {
      setLoading(false);
    }
  }, [hasEnoughData, loading, relevantEvents, saveToCache, eventsHash]);

  // Load from cache
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { insights, timestamp, eventsHash: cachedHash } = JSON.parse(cached);
        // Check if cache is from today and events haven't changed significantly
        const cacheDate = new Date(timestamp).toDateString();
        const today = new Date().toDateString();

        if (cacheDate === today) {
          setData(insights);
          setLastUpdated(new Date(timestamp));
          eventsHashRef.current = cachedHash || "";
        }
      } catch {
        // Invalid cache, ignore
      }
    }
  }, []);

  // Auto-generate insights only when expanded and no cached data
  useEffect(() => {
    if (!isExpanded) return;

    // If no data yet or events changed significantly, generate
    const eventsChanged = eventsHash !== eventsHashRef.current;
    if (hasEnoughData && (!data || eventsChanged) && !loading && !error) {
      generateInsights();
    }
  }, [hasEnoughData, isExpanded, data, loading, error, generateInsights, eventsHash]);

  // Build sections for the pulldown component (8 slides)
  const sections: AIInsightsPulldownSection[] = useMemo(() => {
    if (!data) return [];

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
  }, [data, primaryColor]);

  // Format error message
  const errorMessage = error?.includes("API key")
    ? "AI features require configuration. Insights will be available once set up."
    : error;

  return {
    sections,
    title: "Schedule Insights",
    isLoading: loading,
    loadingMessage: "Analyzing your calendar...",
    error: errorMessage,
    lastUpdated,
    onRefresh: generateInsights,
    refreshDisabled: loading,
    storageKey: INSIGHTS_STORAGE_KEY,
    hasEnoughData,
  };
}
