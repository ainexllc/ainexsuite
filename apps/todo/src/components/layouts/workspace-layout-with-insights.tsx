"use client";

import { ReactNode, useState } from "react";
import { WorkspaceLayout, AIInsightsModal } from "@ainexsuite/ui";
import { useTaskWorkspaceInsights } from "@/hooks/use-workspace-insights";
import { useAppColors } from "@ainexsuite/theme";
import type { QuickAction, NotificationItem } from "@ainexsuite/types";

interface WorkspaceLayoutWithInsightsProps {
  children: ReactNode;
  user: {
    uid?: string;
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    /** Square-cropped icon URL for circular avatars */
    iconURL?: string | null;
    subscriptionStatus?: string;
    subscriptionTier?: string;
    trialStartDate?: number;
  };
  onSignOut: () => void;
  quickActions?: QuickAction[];
  onQuickAction?: (actionId: string) => void;
  onAiAssistantClick?: () => void;
  onSettingsClick?: () => void;
  notifications?: NotificationItem[];
  onUpdatePreferences?: (updates: { theme?: 'light' | 'dark' | 'system' }) => Promise<void>;
}

/**
 * Wrapper component that adds AI Insights to WorkspaceLayout.
 * Uses the useTaskWorkspaceInsights hook to get insights data from the Todo store.
 */
export function WorkspaceLayoutWithInsights({
  children,
  user,
  onSignOut,
  quickActions = [],
  onQuickAction,
  onAiAssistantClick,
  onSettingsClick,
  notifications = [],
  onUpdatePreferences,
}: WorkspaceLayoutWithInsightsProps) {
  // Get insights data from the hook (requires TodoStore)
  const insights = useTaskWorkspaceInsights();
  const { primary: primaryColor } = useAppColors();

  // Modal state for View Details
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract raw data for modal display
  const rawData = insights.rawData as {
    productivityTrend?: string;
    recommendations?: string[];
    focusArea?: string;
    mood?: string;
    commonTags?: string[];
    blockers?: string[];
    topPriorities?: Array<{ title: string; dueDate?: string }>;
    upcomingDeadlines?: Array<{ title: string; dueDate: string }>;
    quickTip?: string;
  } | null;

  // Extract local stats (streak data)
  const localStats = insights.localStats as {
    streakDays?: number;
    tasksThisWeek?: number;
    completedThisWeek?: number;
    overdueCount?: number;
    highPriorityCount?: number;
    completionRate?: number;
  } | undefined;

  return (
    <>
    <WorkspaceLayout
      user={user}
      onSignOut={onSignOut}
      appName="todo"
      quickActions={quickActions}
      onQuickAction={onQuickAction}
      onAiAssistantClick={onAiAssistantClick}
      onSettingsClick={onSettingsClick}
      notifications={notifications}
      // AI Insights Pulldown - always pass sections (pulldown handles empty state)
      insightsSections={insights.sections}
      insightsTitle={insights.title}
      insightsLoading={insights.isLoading}
      insightsLoadingMessage={insights.loadingMessage}
      insightsError={insights.error}
      insightsLastUpdated={insights.lastUpdated}
      onInsightsRefresh={insights.onRefresh}
      insightsRefreshDisabled={insights.refreshDisabled}
      insightsStorageKey={insights.storageKey}
      onUpdatePreferences={onUpdatePreferences}
      onInsightsViewDetails={() => setIsModalOpen(true)}
    >
      {children}
    </WorkspaceLayout>

      {/* AI Insights Modal */}
      <AIInsightsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        weeklyFocus={rawData?.focusArea}
        mood={rawData?.mood}
        commonThemes={rawData?.commonTags}
        quickTip={rawData?.quickTip}
        streak={localStats?.streakDays}
        itemsThisWeek={localStats?.completedThisWeek}
        lastUpdated={insights.lastUpdated}
        onRefresh={insights.onRefresh}
        isRefreshing={insights.isLoading}
        accentColor={primaryColor}
        actionsStorageKey="todo-pending-actions"
      />
    </>
  );
}
