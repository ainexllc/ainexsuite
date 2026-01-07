"use client";

import { useMemo } from "react";
import { useSubscriptions } from "@/components/providers/subscription-provider";
import { useSpaces } from "@/components/providers/spaces-provider";
import { useAppColors } from "@ainexsuite/theme";
import {
  useWorkspaceInsights as useSharedWorkspaceInsights,
  type WorkspaceInsightsConfig,
  type WorkspaceInsightsResult,
  type AIInsightsPulldownSection,
} from "@ainexsuite/ui";
import type { SubscriptionItem } from "@/types";

// Re-export the result type for consumers
export type { WorkspaceInsightsResult };

const INSIGHTS_STORAGE_KEY = "subs-ai-insights-expanded";
const RECENT_COUNT = 10;

/**
 * Subs insight data schema from API
 */
interface SubsInsightData {
  spendingTrend: string;
  recommendations: string[];
  projectedYearly: string;
  anomalies: string[];
  topCategories?: Array<{ name: string; count: number; spend: number }>;
  savingOpportunities?: string[];
  upcomingBills?: string[];
}

/**
 * Local stats calculated client-side
 */
interface LocalStats {
  totalMonthly: number;
  totalYearly: number;
  activeCount: number;
  upcomingCount: number;
}

/**
 * Calculate local stats from subscriptions
 */
function calculateLocalStats(subscriptions: SubscriptionItem[]): LocalStats {
  const active = subscriptions.filter((s) => s.status === "active");

  const totalMonthly = active.reduce((acc, sub) => {
    if (sub.billingCycle === "monthly") return acc + sub.cost;
    if (sub.billingCycle === "yearly") return acc + sub.cost / 12;
    if (sub.billingCycle === "weekly") return acc + sub.cost * 4.33;
    return acc;
  }, 0);

  // Count subscriptions due in next 7 days
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingCount = active.filter((s) => {
    const nextPayment = new Date(s.nextPaymentDate);
    return nextPayment >= now && nextPayment <= weekFromNow;
  }).length;

  return {
    totalMonthly,
    totalYearly: totalMonthly * 12,
    activeCount: active.length,
    upcomingCount,
  };
}

/**
 * Build insight sections from API data
 */
function buildSubsSections(
  data: SubsInsightData,
  primaryColor: string,
  localStats?: object
): AIInsightsPulldownSection[] {
  const allSections: AIInsightsPulldownSection[] = [];
  const stats = localStats as LocalStats | undefined;

  // 1. Monthly Overview (spending) - Analytics icon
  if (stats && stats.totalMonthly > 0) {
    allSections.push({
      animatedIconType: "Analytics",
      label: "Monthly Overview",
      content: `$${stats.totalMonthly.toFixed(2)}/mo across ${stats.activeCount} active subscriptions`,
      gradient: { from: primaryColor, to: "#10b981" },
    });
  }

  // 2. Spending Trend (main insight) - Target icon
  if (data.spendingTrend) {
    allSections.push({
      animatedIconType: "Target",
      label: "Spending Trend",
      content: data.spendingTrend,
      gradient: { from: primaryColor, to: "#f97316" },
    });
  }

  // 3. Projected Yearly (projection) - Sparkle icon
  if (data.projectedYearly) {
    allSections.push({
      animatedIconType: "Sparkle",
      label: "Projected Yearly",
      content: `Estimated annual spend: ${data.projectedYearly}`,
      gradient: { from: primaryColor, to: "#8b5cf6" },
    });
  }

  // 4. Upcoming Bills (alert) - Brain icon
  if (stats && stats.upcomingCount > 0) {
    allSections.push({
      animatedIconType: "Brain",
      label: "Upcoming Bills",
      content: `${stats.upcomingCount} subscription${stats.upcomingCount > 1 ? "s" : ""} due this week`,
      gradient: { from: primaryColor, to: "#ef4444" },
    });
  }

  // 5. Recommendations (actionable) - MagicWand icon
  if (data.recommendations && data.recommendations.length > 0) {
    const recsToShow = data.recommendations.slice(0, 2);
    const recText =
      recsToShow.join(". ") +
      (recsToShow.length < data.recommendations.length
        ? ` (+${data.recommendations.length - recsToShow.length} more)`
        : "");
    allSections.push({
      animatedIconType: "MagicWand",
      label: "Recommendations",
      content: recText,
      gradient: { from: primaryColor, to: "#06b6d4" },
    });
  }

  // 6. Anomalies (warnings) - Lightbulb icon
  if (data.anomalies && data.anomalies.length > 0) {
    const anomaly = data.anomalies[0];
    allSections.push({
      animatedIconType: "Lightbulb",
      label: "Worth Checking",
      content: anomaly,
      gradient: { from: primaryColor, to: "#f59e0b" },
    });
  }

  return allSections;
}

/**
 * Subs workspace insights hook.
 * Uses the shared useWorkspaceInsights hook with subscription-specific configuration.
 */
export function useWorkspaceInsights(): WorkspaceInsightsResult {
  const { subscriptions, loading: subsLoading } = useSubscriptions();
  const { currentSpaceId, currentSpace } = useSpaces();
  const { primary: primaryColor } = useAppColors();

  // Filter to active subscriptions
  const activeSubscriptions = useMemo(() => {
    return subscriptions.filter((s) => !s.archived && s.status === "active");
  }, [subscriptions]);

  // Recent subscriptions for analysis (sorted by next payment date)
  const recentSubs = useMemo(() => {
    const sorted = [...activeSubscriptions].sort(
      (a, b) =>
        new Date(a.nextPaymentDate).getTime() -
        new Date(b.nextPaymentDate).getTime()
    );
    return sorted.slice(0, RECENT_COUNT);
  }, [activeSubscriptions]);

  // Config for the shared hook
  const config: WorkspaceInsightsConfig<SubscriptionItem, SubsInsightData> =
    useMemo(
      () => ({
        appName: "subs",
        expandedStorageKey: INSIGHTS_STORAGE_KEY,
        spaceId: currentSpaceId,
        apiEndpoint: "/api/ai/subscription-insights",

        preparePayload: (subsToAnalyze) => ({
          subscriptions: subsToAnalyze.map((s) => ({
            name: s.name,
            cost: s.cost,
            billingCycle: s.billingCycle,
            category: s.category,
          })),
        }),

        buildSections: buildSubsSections,

        title: (spaceName) =>
          spaceName ? `${spaceName} Insights` : "Spending Insights",

        loadingMessage: "Analyzing your subscriptions...",
        minimumDataCount: 2,

        // Calculate stats client-side
        calculateLocalStats: () => calculateLocalStats(activeSubscriptions),

        // Generate hash for smart refresh when subscriptions change
        generateDataHash: (subsToHash) =>
          subsToHash
            .map((s) => `${s.id}-${s.cost}-${s.status}`)
            .sort()
            .join("|")
            .slice(0, 500),

        // Item count threshold for smart refresh
        itemCountThreshold: 2,
      }),
      [currentSpaceId, activeSubscriptions]
    );

  return useSharedWorkspaceInsights(
    recentSubs,
    subsLoading,
    config,
    currentSpace?.name,
    primaryColor
  );
}
