"use client";

import { ReactNode, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceLayout, AIInsightsModal } from "@ainexsuite/ui";
import { useWorkspaceInsights } from "@/hooks/use-workspace-insights";
import { useNotifications } from "@/hooks/use-notifications";
import { useAppColors } from "@ainexsuite/theme";
import type { QuickAction } from "@ainexsuite/types";

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
    preferences?: {
      fontFamily?: string;
      theme?: 'light' | 'dark' | 'system';
    };
  };
  onSignOut: () => void;
  quickActions?: QuickAction[];
  onQuickAction?: (actionId: string) => void;
  onAiAssistantClick?: () => void;
  onSettingsClick?: () => void;
  onActivityClick?: () => void;
  onUpdatePreferences?: (updates: { theme?: 'light' | 'dark' | 'system' }) => Promise<void>;
}

/**
 * Wrapper component that adds AI Insights to WorkspaceLayout.
 * Uses the useWorkspaceInsights hook to get cross-app insights data.
 */
export function WorkspaceLayoutWithInsights({
  children,
  user,
  onSignOut,
  quickActions = [],
  onQuickAction,
  onAiAssistantClick,
  onSettingsClick,
  onActivityClick,
  onUpdatePreferences,
}: WorkspaceLayoutWithInsightsProps) {
  const router = useRouter();

  // Get insights data from the hook
  const insights = useWorkspaceInsights();
  const { primary: primaryColor } = useAppColors();

  // Get notifications from the hook
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearAll,
    handleAcceptInvitation,
    handleDeclineInvitation,
  } = useNotifications();

  // Handle notification click - navigate based on type
  const handleNotificationClick = useCallback((id: string) => {
    const notification = notifications.find((n) => n.id === id);
    if (notification?.actionUrl) {
      router.push(notification.actionUrl);
    }
    markAsRead(id);
  }, [notifications, router, markAsRead]);

  // Handle view all notifications - navigate to invitations page
  const handleViewAllNotifications = useCallback(() => {
    router.push('/invitations');
  }, [router]);

  // Modal state for View Details
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract raw data for modal display
  const rawData = insights.rawData as {
    dailySummary?: string;
    topPriorities?: string[];
    suggestions?: string[];
    wellnessNote?: string;
  } | null;

  // Extract local stats (activity stats)
  const localStats = insights.localStats as {
    totalActiveItems?: number;
    highPriorityCount?: number;
    appsWithActivity?: string[];
    recentAppActivity?: Array<{ app: string; count: number }>;
  } | undefined;

  return (
    <>
      <WorkspaceLayout
        user={user}
        onSignOut={onSignOut}
        appName="space"
        appColor="#f97316"
        quickActions={quickActions}
        onQuickAction={onQuickAction}
        onAiAssistantClick={onAiAssistantClick}
        onSettingsClick={onSettingsClick}
        onActivityClick={onActivityClick}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAsRead={markAsRead}
        onMarkAllRead={markAllAsRead}
        onClearAll={clearAll}
        onViewAllNotifications={handleViewAllNotifications}
        onAcceptInvitation={handleAcceptInvitation}
        onDeclineInvitation={handleDeclineInvitation}
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

      {/* AI Insights Modal - Suite version */}
      <AIInsightsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        weeklyFocus={rawData?.dailySummary}
        pendingActions={rawData?.topPriorities}
        commonThemes={rawData?.suggestions}
        quickTip={rawData?.wellnessNote}
        itemsThisWeek={localStats?.totalActiveItems}
        lastUpdated={insights.lastUpdated}
        onRefresh={insights.onRefresh}
        isRefreshing={insights.isLoading}
        accentColor={primaryColor}
        actionsStorageKey="suite-pending-actions"
      />
    </>
  );
}
