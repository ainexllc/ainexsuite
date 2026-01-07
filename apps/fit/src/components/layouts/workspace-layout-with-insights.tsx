"use client";

import { ReactNode, useState } from "react";
import { WorkspaceLayout, AIInsightsModal } from "@ainexsuite/ui";
import { useFitnessInsights } from "@/hooks/use-fitness-insights";
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
 * Uses the useFitnessInsights hook.
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
  const insights = useFitnessInsights();
  const { primary: primaryColor } = useAppColors();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const rawData = insights.rawData as {
    weeklyFocus?: string;
    workoutStreak?: number;
    macrosTrend?: string;
    suggestions?: string[];
  } | null;

  const localStats = insights.localStats as {
    workoutsThisWeek?: number;
  } | undefined;

  return (
    <>
      <WorkspaceLayout
        user={user}
        onSignOut={onSignOut}
        appName="fit"
        quickActions={quickActions}
        onQuickAction={onQuickAction}
        onAiAssistantClick={onAiAssistantClick}
        onSettingsClick={onSettingsClick}
        notifications={notifications}
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
        insightsEmptyStateMessage={insights.emptyStateMessage}
      >
        {children}
      </WorkspaceLayout>

      <AIInsightsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        weeklyFocus={rawData?.weeklyFocus}
        mood={rawData?.macrosTrend}
        commonThemes={rawData?.suggestions}
        pendingActions={rawData?.suggestions}
        streak={rawData?.workoutStreak || localStats?.workoutsThisWeek}
        itemsThisWeek={localStats?.workoutsThisWeek}
        lastUpdated={insights.lastUpdated}
        onRefresh={insights.onRefresh}
        isRefreshing={insights.isLoading}
        accentColor={primaryColor}
        actionsStorageKey="fit-pending-actions"
      />
    </>
  );
}
