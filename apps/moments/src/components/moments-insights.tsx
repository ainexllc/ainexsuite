"use client";

import { useState, useEffect, useMemo } from "react";
import { Sparkles, Users, Smile } from "lucide-react";
import type { Moment } from "@ainexsuite/types";
import { useAppColors } from "@ainexsuite/theme";
import {
  AIInsightsCard,
  AIInsightsTagList,
  AIInsightsText,
  type AIInsightsSection,
} from "@ainexsuite/ui";

interface InsightData {
  highlight: string;
  topPeople: string[];
  moodTrend: string;
}

interface MomentsInsightsProps {
  moments: Moment[];
  variant?: "default" | "sidebar";
}

export function MomentsInsights({ moments, variant = "default" }: MomentsInsightsProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InsightData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { primary: primaryColor } = useAppColors();

  // Only analyze if we have enough moments
  const RECENT_COUNT = 10;
  const validMoments = moments.slice(0, RECENT_COUNT);
  const hasEnoughData = validMoments.length >= 2;
  
  const STORAGE_KEY = 'ainex-moments-insights';
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
      const payload = validMoments.map(m => ({
        title: m.title,
        caption: m.caption,
        date: new Date(m.date).toISOString().split('T')[0],
        mood: m.mood,
        people: m.people,
        location: m.location,
        weather: m.weather
      }));

      const response = await fetch("/api/ai/moments-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moments: payload }),
      });

      if (!response.ok) {
        // Fallback for demo if endpoint doesn't exist yet
        if (response.status === 404) {
           // Simple local aggregation as fallback
           const moodCounts: Record<string, number> = {};
           const peopleCounts: Record<string, number> = {};
           
           payload.forEach(m => {
             if (m.mood) moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
             if (m.people) m.people.forEach(p => peopleCounts[p] = (peopleCounts[p] || 0) + 1);
           });

           const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Neutral";
           const topPeople = Object.entries(peopleCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(p => p[0]);

           const mockData = {
             highlight: `You've captured ${validMoments.length} moments recently.`,
             moodTrend: `Mostly feeling ${topMood}`,
             topPeople: topPeople.length > 0 ? topPeople : ["Just you"]
           };
           
           setData(mockData);
           saveToCache(mockData);
           setLoading(false);
           return;
        }
        
        throw new Error("Failed to generate insights");
      }

      const result = await response.json();
      setData(result);
      saveToCache(result);
    } catch (err) {
      console.error(err);
      setError("Could not analyze moments.");
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

    if (!loadedFromCache && !data && !loading && !error) {
      generateInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasEnoughData]);

  // Build sections
  const sections: AIInsightsSection[] = useMemo(() => {
    if (!data) return [];

    return [
      {
        icon: <Sparkles className="h-3.5 w-3.5" />,
        label: "Highlight",
        content: <AIInsightsText>{data.highlight}</AIInsightsText>,
      },
      {
        icon: <Smile className="h-3.5 w-3.5" />,
        label: "Mood Trend",
        content: <AIInsightsText>{data.moodTrend}</AIInsightsText>,
      },
      {
        icon: <Users className="h-3.5 w-3.5" />,
        label: "Top Company",
        content: <AIInsightsTagList tags={data.topPeople} />,
      },
    ];
  }, [data]);

  if (!hasEnoughData) return null;

  return (
    <AIInsightsCard
      title="AI Insights"
      sections={sections}
      accentColor={primaryColor}
      variant={variant}
      isLoading={loading}
      loadingMessage="Analyzing your moments..."
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={generateInsights}
      refreshDisabled={loading}
    />
  );
}
