"use client";

import { useMemo } from "react";
import { useSpaces } from "@/components/providers/spaces-provider";
import { useAppColors } from "@ainexsuite/theme";
import {
  useWorkspaceInsights as useSharedWorkspaceInsights,
  type WorkspaceInsightsConfig,
  type WorkspaceInsightsResult,
  type AIInsightsPulldownSection,
} from "@ainexsuite/ui";
import type { Project } from "@/types/models";

// Re-export the result type for consumers
export type { WorkspaceInsightsResult };

const INSIGHTS_STORAGE_KEY = "projects-ai-insights-expanded";

/**
 * Project insight data schema from API
 */
interface ProjectInsightData {
  portfolioHealth: string;
  focusArea: string;
  riskAlerts: string[];
  recommendations: string[];
  productivityTip: string;
  upcomingDeadlines: string;
}

/**
 * Local stats calculated client-side
 */
interface LocalStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  urgentProjects: number;
}

/**
 * Calculate local stats from projects
 */
function calculateLocalStats(projects: Project[]): LocalStats {
  const active = projects.filter((p) => p.status === "active").length;
  const completed = projects.filter((p) => p.status === "completed").length;
  const urgent = projects.filter((p) => p.priority === "urgent").length;

  return {
    totalProjects: projects.length,
    activeProjects: active,
    completedProjects: completed,
    urgentProjects: urgent,
  };
}

/**
 * Build insight sections from API data
 */
function buildProjectSections(
  data: ProjectInsightData,
  primaryColor: string,
  localStats?: object
): AIInsightsPulldownSection[] {
  const allSections: AIInsightsPulldownSection[] = [];
  const stats = localStats as LocalStats | undefined;

  // 1. Portfolio Overview - Analytics icon
  if (stats && stats.totalProjects > 0) {
    allSections.push({
      animatedIconType: "Analytics",
      label: "Portfolio",
      content: `${stats.activeProjects} active, ${stats.completedProjects} completed out of ${stats.totalProjects} projects`,
      gradient: { from: primaryColor, to: "#6366f1" },
    });
  }

  // 2. Portfolio Health - Brain icon
  if (data.portfolioHealth) {
    allSections.push({
      animatedIconType: "Brain",
      label: "Health",
      content: data.portfolioHealth,
      gradient: { from: primaryColor, to: "#10b981" },
    });
  }

  // 3. Focus Area - Target icon
  if (data.focusArea) {
    allSections.push({
      animatedIconType: "Target",
      label: "Focus",
      content: data.focusArea,
      gradient: { from: primaryColor, to: "#f97316" },
    });
  }

  // 4. Urgent Projects - Sparkle icon
  if (stats && stats.urgentProjects > 0) {
    allSections.push({
      animatedIconType: "Sparkle",
      label: "Urgent",
      content: `${stats.urgentProjects} project${stats.urgentProjects > 1 ? "s" : ""} marked as urgent`,
      gradient: { from: primaryColor, to: "#ef4444" },
    });
  }

  // 5. Risk Alerts - MagicWand icon
  if (data.riskAlerts && data.riskAlerts.length > 0) {
    const alertsText = data.riskAlerts.slice(0, 2).join(". ");
    allSections.push({
      animatedIconType: "MagicWand",
      label: "Risks",
      content: alertsText,
      gradient: { from: primaryColor, to: "#ef4444" },
    });
  }

  // 6. Recommendations - Robot icon
  if (data.recommendations && data.recommendations.length > 0) {
    const recsToShow = data.recommendations.slice(0, 2);
    const recText =
      recsToShow.join(". ") +
      (recsToShow.length < data.recommendations.length
        ? ` (+${data.recommendations.length - recsToShow.length} more)`
        : "");
    allSections.push({
      animatedIconType: "Robot",
      label: "Recommendations",
      content: recText,
      gradient: { from: primaryColor, to: "#06b6d4" },
    });
  }

  // 7. Upcoming Deadlines - NeuralNetwork icon
  if (data.upcomingDeadlines) {
    allSections.push({
      animatedIconType: "NeuralNetwork",
      label: "Deadlines",
      content: data.upcomingDeadlines,
      gradient: { from: primaryColor, to: "#8b5cf6" },
    });
  }

  // 8. Productivity Tip - Lightbulb icon
  if (data.productivityTip) {
    allSections.push({
      animatedIconType: "Lightbulb",
      label: "Tip",
      content: data.productivityTip,
      gradient: { from: primaryColor, to: "#f59e0b" },
    });
  }

  return allSections;
}

/**
 * Projects workspace insights hook.
 * Uses the shared useWorkspaceInsights hook with project-specific configuration.
 *
 * Note: This hook currently works with an empty array until the projects
 * data provider is fully implemented.
 */
export function useWorkspaceInsights(): WorkspaceInsightsResult {
  const { currentSpaceId, currentSpace } = useSpaces();
  const { primary: primaryColor } = useAppColors();

  // TODO: Replace with real projects provider when available
  // For now, use empty array - insights will show empty state
  const projects: Project[] = [];
  const projectsLoading = false;

  // Active projects for analysis
  const activeProjects = useMemo(() => {
    return projects.filter((p) => p.status !== "archived");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length]);

  // Config for the shared hook
  const config: WorkspaceInsightsConfig<Project, ProjectInsightData> = useMemo(
    () => ({
      appName: "projects",
      expandedStorageKey: INSIGHTS_STORAGE_KEY,
      spaceId: currentSpaceId,
      apiEndpoint: "/api/ai/project-insights",

      preparePayload: (projectsToAnalyze) => ({
        projects: projectsToAnalyze.map((p) => ({
          name: p.name,
          status: p.status,
          priority: p.priority,
          dueDate: p.dueDate,
          description: p.description,
        })),
      }),

      buildSections: buildProjectSections,

      title: (spaceName) =>
        spaceName ? `${spaceName} Insights` : "Project Insights",

      loadingMessage: "Analyzing your projects...",
      minimumDataCount: 2,

      // Calculate stats client-side
      calculateLocalStats: () => calculateLocalStats(activeProjects),

      // Generate hash for smart refresh when projects change
      generateDataHash: (projectsToHash) =>
        projectsToHash
          .map((p) => `${p.id}-${p.status}-${p.priority}`)
          .sort()
          .join("|")
          .slice(0, 500),

      // Item count threshold for smart refresh
      itemCountThreshold: 2,
    }),
    [currentSpaceId, activeProjects]
  );

  return useSharedWorkspaceInsights(
    activeProjects,
    projectsLoading,
    config,
    currentSpace?.name,
    primaryColor
  );
}
