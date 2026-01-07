"use client";

import { useMemo } from "react";
import { useWorkflows } from "@/components/providers/workflows-provider";
import { useSpaces } from "@/components/providers/spaces-provider";
import { useAppColors } from "@ainexsuite/theme";
import {
  useWorkspaceInsights as useSharedWorkspaceInsights,
  type WorkspaceInsightsConfig,
  type WorkspaceInsightsResult,
  type AIInsightsPulldownSection,
} from "@ainexsuite/ui";
import type { Workflow } from "@/lib/types/workflow";

// Re-export the result type for consumers
export type { WorkspaceInsightsResult };

const INSIGHTS_STORAGE_KEY = "flow-ai-insights-expanded";
const RECENT_COUNT = 10;

/**
 * Flow insight data schema from API
 */
interface FlowInsightData {
  weeklyFocus: string;
  commonPatterns: string[];
  optimizations: string[];
  complexity: string;
  topWorkflowTypes: Array<{ name: string; count: number }>;
  automationPotential: string;
  quickTip: string;
}

/**
 * Activity data calculated client-side
 */
interface ActivityData {
  activeWorkflows: number;
  workflowsThisWeek: number;
  totalNodes: number;
}

/**
 * Calculate workflow activity stats
 */
function calculateActivity(
  workflows: Array<{ createdAt: Date; updatedAt: Date; nodeCount: number }>
): ActivityData {
  if (workflows.length === 0) return { activeWorkflows: 0, workflowsThisWeek: 0, totalNodes: 0 };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const workflowsThisWeek = workflows.filter((w) => w.updatedAt >= weekAgo).length;
  const totalNodes = workflows.reduce((sum, w) => sum + (w.nodeCount || 0), 0);

  return {
    activeWorkflows: workflows.length,
    workflowsThisWeek,
    totalNodes,
  };
}

/**
 * Build insight sections from API data
 */
function buildFlowSections(
  data: FlowInsightData,
  primaryColor: string,
  localStats?: object
): AIInsightsPulldownSection[] {
  const allSections: AIInsightsPulldownSection[] = [];
  const activityData = localStats as ActivityData | undefined;

  // 1. Current Focus - Target icon
  if (data.weeklyFocus) {
    allSections.push({
      animatedIconType: "Target",
      label: "Current Focus",
      content: data.weeklyFocus,
      gradient: { from: primaryColor, to: "#f97316" },
    });
  }

  // 2. Activity Stats - Sparkle icon
  if (activityData && (activityData.workflowsThisWeek > 0 || activityData.totalNodes > 0)) {
    allSections.push({
      animatedIconType: "Sparkle",
      label: "Activity",
      content: `${activityData.workflowsThisWeek} workflows updated this week with ${activityData.totalNodes} total nodes`,
      gradient: { from: primaryColor, to: "#f97316" },
    });
  }

  // 3. Complexity - Brain icon
  if (data.complexity) {
    allSections.push({
      animatedIconType: "Brain",
      label: "Complexity",
      content: data.complexity,
      gradient: { from: primaryColor, to: "#ec4899" },
    });
  }

  // 4. Optimizations - MagicWand icon
  if (data.optimizations && data.optimizations.length > 0) {
    const optimsToShow = data.optimizations.slice(0, 2);
    const optimText =
      optimsToShow.join(". ") +
      (optimsToShow.length < data.optimizations.length
        ? ` (+${data.optimizations.length - optimsToShow.length} more)`
        : "");
    allSections.push({
      animatedIconType: "MagicWand",
      label: "Optimizations",
      content: optimText,
      gradient: { from: primaryColor, to: "#ef4444" },
    });
  }

  // 5. Common Patterns - Analytics icon
  if (data.commonPatterns && data.commonPatterns.length > 0) {
    const patternText = data.commonPatterns.slice(0, 3).join(", ");
    allSections.push({
      animatedIconType: "Analytics",
      label: "Common Patterns",
      content: `Frequently used: ${patternText}`,
      gradient: { from: primaryColor, to: "#8b5cf6" },
    });
  }

  // 6. Top Workflow Types - NeuralNetwork icon
  if (data.topWorkflowTypes && data.topWorkflowTypes.length > 0) {
    const typeText = data.topWorkflowTypes
      .slice(0, 3)
      .map((t) => `${t.name} (${t.count})`)
      .join(", ");
    allSections.push({
      animatedIconType: "NeuralNetwork",
      label: "Workflow Types",
      content: `Most common: ${typeText}`,
      gradient: { from: primaryColor, to: "#06b6d4" },
    });
  }

  // 7. Automation Potential - Robot icon
  if (data.automationPotential) {
    allSections.push({
      animatedIconType: "Robot",
      label: "Automation",
      content: data.automationPotential,
      gradient: { from: primaryColor, to: "#10b981" },
    });
  }

  // 8. Quick Tip - Lightbulb icon
  if (data.quickTip) {
    allSections.push({
      animatedIconType: "Lightbulb",
      label: "Quick Tip",
      content: data.quickTip,
      gradient: { from: primaryColor, to: "#f59e0b" },
    });
  }

  return allSections;
}

/**
 * Flow workspace insights hook.
 * Uses the shared useWorkspaceInsights hook with flow-specific configuration.
 */
export function useWorkspaceInsights(): WorkspaceInsightsResult {
  const { workflows, loading: workflowsLoading } = useWorkflows();
  const { currentSpaceId, currentSpace } = useSpaces();
  const { primary: primaryColor } = useAppColors();

  // Filter to recent active workflows
  const recentWorkflows = useMemo(() => {
    const active = workflows.filter((w) => !w.archived && !w.deletedAt);
    const sorted = active.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return sorted.slice(0, RECENT_COUNT);
  }, [workflows]);

  // All active workflows for stats calculation
  const activeWorkflows = useMemo(() => {
    return workflows.filter((w) => !w.archived && !w.deletedAt);
  }, [workflows]);

  // Config for the shared hook
  const config: WorkspaceInsightsConfig<Workflow, FlowInsightData> = useMemo(
    () => ({
      appName: "flow",
      expandedStorageKey: INSIGHTS_STORAGE_KEY,
      spaceId: currentSpaceId,
      apiEndpoint: "/api/ai/workspace-insights",

      preparePayload: (workflowsToAnalyze) => ({
        workflows: workflowsToAnalyze.map((w) => ({
          title: w.title,
          description: w.description || "",
          nodeCount: w.nodeCount,
          nodeTypes: w.nodes?.map((n) => n.type).filter(Boolean) || [],
          edgeCount: w.edges?.length || 0,
          date: w.updatedAt.toISOString().split("T")[0],
        })),
      }),

      buildSections: buildFlowSections,

      title: (spaceName) =>
        spaceName ? `${spaceName} Insights` : "Flow Insights",

      loadingMessage: "Analyzing your workflows...",
      minimumDataCount: 1,

      // Calculate activity data client-side
      calculateLocalStats: () => calculateActivity(activeWorkflows),

      // Generate hash for smart refresh when workflows change
      generateDataHash: (workflowsToHash) =>
        workflowsToHash
          .map((w) => `${w.id}-${w.updatedAt.getTime()}-${w.nodeCount}`)
          .sort()
          .join("|")
          .slice(0, 500),

      // Item count threshold for smart refresh
      itemCountThreshold: 2,
    }),
    [currentSpaceId, activeWorkflows]
  );

  return useSharedWorkspaceInsights(
    recentWorkflows,
    workflowsLoading,
    config,
    currentSpace?.name,
    primaryColor
  );
}
