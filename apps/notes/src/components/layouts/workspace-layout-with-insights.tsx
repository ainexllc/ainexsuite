"use client";

import { ReactNode } from "react";
import { WorkspaceLayout } from "@ainexsuite/ui";
import { useWorkspaceInsights } from "@/hooks/use-workspace-insights";
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
  searchPlaceholder?: string;
  onSearchClick?: () => void;
  quickActions?: QuickAction[];
  onQuickAction?: (actionId: string) => void;
  onAiAssistantClick?: () => void;
  notifications?: NotificationItem[];
}

/**
 * Wrapper component that adds AI Insights to WorkspaceLayout.
 * Uses the useWorkspaceInsights hook to get insights data from the Notes providers.
 */
export function WorkspaceLayoutWithInsights({
  children,
  user,
  onSignOut,
  searchPlaceholder = "Search notes...",
  onSearchClick,
  quickActions = [],
  onQuickAction,
  onAiAssistantClick,
  notifications = [],
}: WorkspaceLayoutWithInsightsProps) {
  // Get insights data from the hook (requires NotesProvider and SpacesProvider)
  const insights = useWorkspaceInsights();

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={onSignOut}
      searchPlaceholder={searchPlaceholder}
      appName="NOTES"
      // New props
      onSearchClick={onSearchClick}
      quickActions={quickActions}
      onQuickAction={onQuickAction}
      onAiAssistantClick={onAiAssistantClick}
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
    >
      {children}
    </WorkspaceLayout>
  );
}
