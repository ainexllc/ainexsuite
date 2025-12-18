"use client";

import { ReactNode, useState } from "react";
import { WorkspaceLayout, AIInsightsModal } from "@ainexsuite/ui";
import { useWorkspaceInsights } from "@/hooks/use-workspace-insights";
import { useAppColors } from "@ainexsuite/theme";
import type { QuickAction, NotificationItem } from "@ainexsuite/types";

interface WorkspaceLayoutWithInsightsProps {
  children: ReactNode;
  user: {
    uid?: string;
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
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
 * Uses the useWorkspaceInsights hook to get insights data from the Moments providers.
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
  // Get insights data from the hook (requires SpacesProvider and MomentsStore)
  const insights = useWorkspaceInsights();
  const { primary: primaryColor } = useAppColors();

  // Modal state for View Details
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract raw data for modal display
  const rawData = insights.rawData as {
    highlight?: string;
    topPeople?: string[];
    moodTrend?: string;
  } | null;

  // Extract local stats
  const localStats = insights.localStats as {
    totalMoments?: number;
    momentsThisWeek?: number;
    uniquePeople?: number;
  } | undefined;

  return (
    <>
      <WorkspaceLayout
        user={user}
        onSignOut={onSignOut}
        appName="MOMENTS"
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
        weeklyFocus={rawData?.highlight}
        mood={rawData?.moodTrend}
        commonThemes={rawData?.topPeople}
        quickTip="Keep capturing those special moments!"
        streak={localStats?.momentsThisWeek}
        itemsThisWeek={localStats?.totalMoments}
        lastUpdated={insights.lastUpdated}
        onRefresh={insights.onRefresh}
        isRefreshing={insights.isLoading}
        accentColor={primaryColor}
        actionsStorageKey="moments-insights-actions"
      />
    </>
  );
}
