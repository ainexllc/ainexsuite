"use client";

import { ReactNode } from "react";
import { WorkspaceLayout } from "@ainexsuite/ui";

interface WorkspaceLayoutWithInsightsProps {
  children: ReactNode;
  user: {
    uid?: string;
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    iconURL?: string | null;
    subscriptionStatus?: string;
    subscriptionTier?: string;
    trialStartDate?: number;
  };
  onSignOut: () => void;
  onUpdatePreferences?: (updates: { theme?: 'light' | 'dark' | 'system' }) => Promise<void>;
  onSettingsClick?: () => void;
}

/**
 * Wrapper component for WorkspaceLayout.
 */
export function WorkspaceLayoutWithInsights({
  children,
  user,
  onSignOut,
  onUpdatePreferences,
  onSettingsClick,
}: WorkspaceLayoutWithInsightsProps) {
  return (
    <WorkspaceLayout
      user={user}
      onSignOut={onSignOut}
      appName="calendar"
      appColor="#06b6d4"
      showBackground={true}
      onUpdatePreferences={onUpdatePreferences}
      onSettingsClick={onSettingsClick}
    >
      {children}
    </WorkspaceLayout>
  );
}
