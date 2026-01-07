"use client";

import { ReactNode } from "react";
import { WorkspaceLayout } from "@ainexsuite/ui";
import { useCalendarInsights } from "@/hooks/use-calendar-insights";
import { CalendarEvent } from "@/types/event";

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
  onUpdatePreferences?: (updates: { theme?: 'light' | 'dark' | 'system' }) => Promise<void>;
  onSettingsClick?: () => void;
  events: CalendarEvent[];
}

/**
 * Wrapper component that adds AI Insights to WorkspaceLayout.
 * Uses the useCalendarInsights hook to generate schedule insights.
 */
export function WorkspaceLayoutWithInsights({
  children,
  user,
  onSignOut,
  onUpdatePreferences,
  onSettingsClick,
  events,
}: WorkspaceLayoutWithInsightsProps) {
  // Get insights data from the hook
  const insights = useCalendarInsights(events);

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={onSignOut}
      appName="calendar"
      appColor="#06b6d4"
      showBackground={true}
      // AI Insights Pulldown
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
      onSettingsClick={onSettingsClick}
    >
      {children}
    </WorkspaceLayout>
  );
}
