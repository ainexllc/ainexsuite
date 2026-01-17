"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Target, Lightbulb, Heart, Sparkles } from "lucide-react";
import { useAuth } from "@ainexsuite/auth";
import { SmartDashboardService, InsightCardData } from "@/lib/smart-dashboard";
import {
  AIInsightsCard,
  AIInsightsBulletList,
  AIInsightsText,
  useInsightsCollapsed,
  type AIInsightsSection,
} from "@ainexsuite/ui";
import { useAppColors } from "@ainexsuite/theme";

const INSIGHTS_STORAGE_KEY = "space-insights-collapsed";

interface SpaceInsightData {
  dailySummary: string;
  topPriorities: string[];
  suggestions: string[];
  wellnessNote: string;
}

interface SpaceInsightsProps {
  variant?: "default" | "sidebar" | "condensed";
  onExpand?: () => void;
}

export function SpaceInsights({ variant = "default", onExpand }: SpaceInsightsProps) {
  const { user } = useAuth();
  const { primary } = useAppColors();
  const isCollapsed = useInsightsCollapsed(INSIGHTS_STORAGE_KEY);

  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<InsightCardData[]>([]);
  const [data, setData] = useState<SpaceInsightData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const previousUserIdRef = useRef<string | null>(null);

  const STORAGE_KEY = `ainex-space-insights-${user?.uid || "anon"}`;
  const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

  const hasEnoughData = dashboardData.length >= 1;

  const saveToCache = (insights: SpaceInsightData) => {
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
      const payload = dashboardData.map(item => ({
        app: item.appSlug,
        type: item.type,
        title: item.title,
        subtitle: item.subtitle,
        priority: item.priority,
      }));

      const response = await fetch("/api/ai/space-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insights: payload }),
      });

      if (!response.ok) {
        if (response.status === 500) {
          const errorData = await response.json().catch(() => ({ error: "Server error" }));
          if (errorData.error?.includes("API") || errorData.error?.includes("configuration")) {
            throw new Error("AI features require API key configuration.");
          }
        }
        throw new Error("Failed to generate insights");
      }

      const result = await response.json();
      setData(result);
      saveToCache(result);
    } catch (err) {
      console.error(err);
      setError("Could not analyze your space data.");
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to dashboard data
  useEffect(() => {
    if (!user?.uid) return;

    const service = new SmartDashboardService(user.uid);
    const unsubscribe = service.subscribeToInsights((insights) => {
      setDashboardData(insights);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Reset when user changes
  useEffect(() => {
    if (previousUserIdRef.current !== null && previousUserIdRef.current !== user?.uid) {
      setData(null);
      setError(null);
      setLastUpdated(null);
    }
    previousUserIdRef.current = user?.uid || null;
  }, [user?.uid]);

  // Load from cache or auto-generate
  useEffect(() => {
    if (!user?.uid || isCollapsed || dashboardData.length === 0) return;

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

    // Auto-generate if we have enough data
    if (hasEnoughData && !data && !loading && !error) {
      generateInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, isCollapsed, dashboardData.length, STORAGE_KEY]);

  // Build sections for AIInsightsCard
  const sections: AIInsightsSection[] = useMemo(() => {
    if (!data) return [];

    return [
      {
        icon: <Sparkles className="h-3.5 w-3.5" />,
        label: "Daily Summary",
        content: <AIInsightsText>{data.dailySummary}</AIInsightsText>,
      },
      {
        icon: <Target className="h-3.5 w-3.5" />,
        label: "Top Priorities",
        content: (
          <AIInsightsBulletList
            items={data.topPriorities}
            accentColor={primary}
          />
        ),
      },
      {
        icon: <Lightbulb className="h-3.5 w-3.5" />,
        label: "Suggestions",
        content: (
          <AIInsightsBulletList
            items={data.suggestions}
            accentColor={primary}
          />
        ),
      },
    ];
  }, [data, primary]);

  // Condensed summary
  const condensedSummary = useMemo(() => {
    if (!data) return undefined;
    return data.dailySummary || (data.topPriorities.length > 0 ? data.topPriorities[0] : undefined);
  }, [data]);

  // Wellness note as additional content
  const wellnessContent = data?.wellnessNote ? (
    <div className="mt-4 pt-4 border-t border-border/50">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-muted mb-2">
        <Heart className="h-3.5 w-3.5" />
        <span>Wellness Note</span>
      </div>
      <p className="text-sm text-text-secondary italic">{data.wellnessNote}</p>
    </div>
  ) : null;

  if (!user?.uid) return null;

  const errorMessage = error?.includes("API")
    ? "AI features require configuration. Space insights will be available once set up."
    : error;

  // Show prompt if not enough data
  if (!hasEnoughData && dashboardData.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-foreground/5 p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${primary}20` }}
          >
            <Sparkles className="h-4 w-4" style={{ color: primary }} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">AI Space Insights</p>
            <p className="text-xs text-muted-foreground">
              Start using your apps to unlock AI-powered insights across your space
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AIInsightsCard
      title="AI Space Insights"
      sections={sections}
      accentColor={primary}
      variant={variant}
      isLoading={loading}
      loadingMessage="Analyzing your space activity..."
      error={errorMessage}
      lastUpdated={lastUpdated}
      onRefresh={generateInsights}
      refreshDisabled={loading}
      onExpand={onExpand}
      condensedSummary={condensedSummary}
      collapsible
      storageKey={INSIGHTS_STORAGE_KEY}
    >
      {wellnessContent}
    </AIInsightsCard>
  );
}
