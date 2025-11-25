"use client";

import { useState, useEffect, useMemo } from "react";
import { Zap, Target, Layers } from "lucide-react";
import { useNotes } from "@/components/providers/notes-provider";
import { useAppColors } from "@ainexsuite/theme";
import {
  AIInsightsCard,
  AIInsightsBulletList,
  AIInsightsTagList,
  AIInsightsText,
  type AIInsightsSection,
} from "@ainexsuite/ui";

interface InsightData {
  weeklyFocus: string;
  commonThemes: string[];
  pendingActions: string[];
}

interface WorkspaceInsightsProps {
  variant?: "default" | "sidebar";
}

export function WorkspaceInsights({ variant = "default" }: WorkspaceInsightsProps) {
  const { notes, loading: notesLoading } = useNotes();
  const { primary: primaryColor } = useAppColors();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InsightData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Only analyze if we have enough notes
  const RECENT_COUNT = 5;
  const recentNotes = notes
    .filter(n => !n.archived && !n.deletedAt)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, RECENT_COUNT);

  const hasEnoughData = recentNotes.length >= 2;
  const STORAGE_KEY = 'ainex-notes-workspace-insights';
  const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  const saveToCache = (insights: InsightData) => {
    const cacheData = {
      insights,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
    setLastUpdated(new Date());
  };

  const generateInsights = async () => {
    if (!hasEnoughData || loading) return;

    setLoading(true);
    setError(null);

    try {
      // Prepare payload
      const payload = recentNotes.map(n => ({
        title: n.title,
        content: n.type === 'checklist'
          ? n.checklist.map(i => i.text).join('\n')
          : n.body,
        date: n.updatedAt.toISOString().split('T')[0]
      }));

      const response = await fetch("/api/ai/workspace-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: payload }),
      });

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 500) {
          const errorData = await response.json().catch(() => ({ error: "Server error" }));
          if (errorData.error?.includes("API key") || errorData.error?.includes("API Key") || errorData.error?.includes("configuration missing")) {
            throw new Error("AI features require API key configuration. Please contact support.");
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
  };

  // Load from cache or auto-generate
  useEffect(() => {
    if (notesLoading) return;

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
      } catch (e) {
        // Invalid cache, ignore
      }
    }

    // If no cache or expired, generate if we have data and haven't tried yet
    if (hasEnoughData && !data && !loading && !error) {
      generateInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notesLoading, hasEnoughData]);

  // Build sections for the shared component
  const sections: AIInsightsSection[] = useMemo(() => {
    if (!data) return [];

    const isSidebar = variant === "sidebar";

    return [
      // Pending Actions - first in sidebar
      {
        icon: <Zap className="h-3.5 w-3.5" />,
        label: "Pending Actions",
        content: (
          <AIInsightsBulletList
            items={data.pendingActions}
            accentColor={primaryColor}
          />
        ),
      },
      // Current Focus
      {
        icon: <Target className="h-3.5 w-3.5" />,
        label: "Current Focus",
        content: <AIInsightsText>{data.weeklyFocus}</AIInsightsText>,
      },
      // Active Themes
      {
        icon: <Layers className="h-3.5 w-3.5" />,
        label: "Active Themes",
        content: <AIInsightsTagList tags={data.commonThemes} />,
      },
    ].map((section, index) => ({
      ...section,
      // Reorder for non-sidebar: focus first, themes second, actions third
      ...(isSidebar ? {} : {
        content: (
          <div style={{ order: index === 0 ? 3 : index === 1 ? 1 : 2 }}>
            {section.content}
          </div>
        ),
      }),
    }));
  }, [data, primaryColor, variant]);

  if (notesLoading || !hasEnoughData) return null;

  // Format error message
  const errorMessage = error?.includes("API key")
    ? "AI features require configuration. Workspace insights will be available once set up."
    : error;

  return (
    <AIInsightsCard
      title="AI Insights"
      sections={sections}
      accentColor={primaryColor}
      variant={variant}
      isLoading={loading}
      loadingMessage="Analyzing your recent notes..."
      error={errorMessage}
      lastUpdated={lastUpdated}
      onRefresh={generateInsights}
      refreshDisabled={loading}
    />
  );
}
