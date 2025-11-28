"use client";

import { useState, useEffect, useMemo } from "react";
import { Target, Layers, Lightbulb } from "lucide-react";
import type { JournalEntry } from "@ainexsuite/types";
import { plainText } from "@/lib/utils/text";
import { useAppColors } from "@ainexsuite/theme";
import {
  AIInsightsCard,
  AIInsightsBulletList,
  AIInsightsTagList,
  AIInsightsText,
  type AIInsightsSection,
} from "@ainexsuite/ui";

interface InsightData {
  weeklyVibe: string;
  recurringThemes: string[];
  reflectionPrompts: string[];
}

interface JournalInsightsProps {
  entries: JournalEntry[];
  variant?: "default" | "sidebar";
}

export function JournalInsights({ entries, variant = "default" }: JournalInsightsProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InsightData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { primary: primaryColor } = useAppColors();

  // Only analyze if we have enough entries
  const RECENT_COUNT = 5;
  const validEntries = entries
    .filter(e => !e.isDraft)
    .slice(0, RECENT_COUNT);

  const hasEnoughData = validEntries.length >= 1;
  const STORAGE_KEY = 'ainex-journey-insights';
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
      const payload = validEntries.map(e => ({
        title: e.title,
        content: plainText(e.content),
        date: new Date(e.date).toISOString().split('T')[0],
        mood: e.mood
      }));

      const response = await fetch("/api/ai/journal-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: payload }),
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
      setError("Could not analyze journal.");
    } finally {
      setLoading(false);
    }
  };

  // Load from cache or auto-generate
  useEffect(() => {
    if (!hasEnoughData) return;

    const cached = localStorage.getItem(STORAGE_KEY);
    let loadedFromCache = false;

    if (cached) {
      try {
        const { insights, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;

        if (age < CACHE_DURATION) {
          setData(insights);
          setLastUpdated(new Date(timestamp));
          loadedFromCache = true;
        }
      } catch (e) {
        // Invalid cache, ignore
      }
    }

    // If no cache or expired, generate if we haven't tried yet
    if (!loadedFromCache && !data && !loading && !error) {
      generateInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasEnoughData]);

  // Build sections for the shared component
  const sections: AIInsightsSection[] = useMemo(() => {
    if (!data) return [];

    const isSidebar = variant === "sidebar";

    return [
      // Reflection Prompts - first in sidebar, third in default
      {
        icon: <Lightbulb className="h-3.5 w-3.5" />,
        label: "Reflection Prompts",
        content: (
          <AIInsightsBulletList
            items={data.reflectionPrompts}
            accentColor={primaryColor}
          />
        ),
      },
      // Weekly Vibe - second in sidebar, first in default
      {
        icon: <Target className="h-3.5 w-3.5" />,
        label: "Weekly Vibe",
        content: <AIInsightsText>{data.weeklyVibe}</AIInsightsText>,
      },
      // Recurring Themes - third in sidebar, second in default
      {
        icon: <Layers className="h-3.5 w-3.5" />,
        label: "Recurring Themes",
        content: <AIInsightsTagList tags={data.recurringThemes} />,
      },
    ].map((section, index) => ({
      ...section,
      // Reorder for non-sidebar: prompts last, vibe first, themes middle
      ...(isSidebar ? {} : {
        content: (
          <div style={{ order: index === 0 ? 3 : index === 1 ? 1 : 2 }}>
            {section.content}
          </div>
        ),
      }),
    }));
  }, [data, primaryColor, variant]);

  // Format error message
  const errorMessage = error?.includes("API key")
    ? "AI features require configuration. Journal insights will be available once set up."
    : error;

  // Show prompt to add more data if not enough
  if (!hasEnoughData) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <Lightbulb className="h-4 w-4" style={{ color: primaryColor }} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">AI Insights</p>
            <p className="text-xs text-white/50">
              Write at least 2 journal entries to unlock AI-powered reflection insights
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AIInsightsCard
      title="AI Insights"
      sections={sections}
      accentColor={primaryColor}
      variant={variant}
      isLoading={loading}
      loadingMessage="Reflecting on your entries..."
      error={errorMessage}
      lastUpdated={lastUpdated}
      onRefresh={generateInsights}
      refreshDisabled={loading}
      collapsible
      storageKey="journey-insights-collapsed"
    />
  );
}
