"use client";

import { ReactNode, useState } from "react";
import { WorkspaceLayout, AIInsightsModal } from "@ainexsuite/ui";
import { useWorkspaceInsights } from "@/hooks/use-workspace-insights";
import { useAppColors } from "@ainexsuite/theme";
import type { QuickAction, NotificationItem, JournalEntry } from "@ainexsuite/types";

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
  /** Journal entries for insights calculation */
  entries?: JournalEntry[];
  /** Whether entries are loading */
  entriesLoading?: boolean;
}

/**
 * Wrapper component that adds AI Insights to WorkspaceLayout.
 * Uses the useWorkspaceInsights hook to get insights data from Journal entries.
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
  entries = [],
  entriesLoading = false,
}: WorkspaceLayoutWithInsightsProps) {
  // Get insights data from the hook
  const insights = useWorkspaceInsights({ entries, loading: entriesLoading });
  const { primary: primaryColor } = useAppColors();

  // Modal state for View Details
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract raw data for modal display
  const rawData = insights.rawData as {
    moodSummary?: string;
    weeklyHighlight?: string;
    emotionalTrend?: string;
    writingStreak?: number;
    commonThemes?: string[];
    reflectionPrompt?: string;
  } | null;

  // Extract local stats (streak data)
  const localStats = insights.localStats as {
    streakDays?: number;
    entriesThisWeek?: number;
  } | undefined;

  return (
    <>
      <WorkspaceLayout
        user={user}
        onSignOut={onSignOut}
        appName="journal"
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
        insightsEmptyStateMessage={insights.emptyStateMessage}
      >
        {children}
      </WorkspaceLayout>

      {/* AI Insights Modal */}
      <AIInsightsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        weeklyFocus={rawData?.weeklyHighlight}
        mood={rawData?.moodSummary}
        commonThemes={rawData?.commonThemes}
        quickTip={rawData?.emotionalTrend}
        reflectionPrompt={rawData?.reflectionPrompt}
        streak={localStats?.streakDays}
        itemsThisWeek={localStats?.entriesThisWeek}
        lastUpdated={insights.lastUpdated}
        onRefresh={insights.onRefresh}
        isRefreshing={insights.isLoading}
        accentColor={primaryColor}
        actionsStorageKey="journey-pending-actions"
      />
    </>
  );
}
