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
  quickActions?: QuickAction[];
  onQuickAction?: (actionId: string) => void;
  onAiAssistantClick?: () => void;
  notifications?: NotificationItem[];
  onUpdatePreferences?: (updates: { theme?: 'light' | 'dark' | 'system' }) => Promise<void>;
}

/**
 * Wrapper component that adds AI Insights to WorkspaceLayout.
 * Uses the useWorkspaceInsights hook to get insights data from the Notes providers.
 */
export function WorkspaceLayoutWithInsights({
  children,
  user,
  onSignOut,
  quickActions = [],
  onQuickAction,
  onAiAssistantClick,
  notifications = [],
  onUpdatePreferences,
}: WorkspaceLayoutWithInsightsProps) {
  // Get insights data from the hook (requires NotesProvider and SpacesProvider)
  const insights = useWorkspaceInsights();

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={onSignOut}
      appName="NOTES"
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
      onUpdatePreferences={onUpdatePreferences}
    >
      {children}
    </WorkspaceLayout>
  );
}
