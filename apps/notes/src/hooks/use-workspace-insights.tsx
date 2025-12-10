"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Target, Zap } from "lucide-react";
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
  const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

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
        const age = Date.now() - timestamp;

        if (age < CACHE_DURATION) {
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

  // Build sections for the pulldown component
  const sections: AIInsightsPulldownSection[] = useMemo(() => {
    if (!data) return [];

    return [
      // Focus - with full content
      {
        icon: createElement(Target, {
          className: "h-4 w-4",
          style: { color: primaryColor },
        }),
        label: "Current Focus",
        content: data.weeklyFocus,
      },
      // Actions - count with action button
      {
        icon: createElement(Zap, {
          className: "h-4 w-4",
          style: { color: "#ef4444" },
        }),
        label: "Pending Actions",
        content: (
          <>
            <span className="text-lg font-semibold" style={{ color: "#ef4444" }}>
              {data.pendingActions.length}
            </span>
            <span className="ml-1 text-white/60">tasks</span>
          </>
        ),
        action:
          data.pendingActions.length > 0
            ? {
                label: "View All →",
                onClick: () => {
                  // TODO: Navigate to actions view
                  console.log("View all actions", data.pendingActions);
                },
              }
            : undefined,
      },
    ];
  }, [data, primaryColor]);

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
