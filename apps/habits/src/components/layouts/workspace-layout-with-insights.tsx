"use client";

import { ReactNode } from "react";
import { WorkspaceLayout } from "@ainexsuite/ui";
import { useAppColors } from "@ainexsuite/theme";
import type { QuickAction, NotificationItem } from "@ainexsuite/types";

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
    animatedAvatarURL?: string | null;
    useAnimatedAvatar?: boolean;
  };
  onSignOut: () => void;
  quickActions?: QuickAction[];
  onQuickAction?: (actionId: string) => void;
  onAiAssistantClick?: () => void;
  onSettingsClick?: () => void;
  notifications?: NotificationItem[];
  onAcceptInvitation?: (invitationId: string, notificationId: string) => Promise<void>;
  onDeclineInvitation?: (invitationId: string, notificationId: string) => Promise<void>;
  onUpdatePreferences?: (updates: { theme?: 'light' | 'dark' | 'system' }) => Promise<void>;
}

/**
 * Wrapper component for WorkspaceLayout.
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
  onAcceptInvitation,
  onDeclineInvitation,
  onUpdatePreferences,
}: WorkspaceLayoutWithInsightsProps) {
  const { primary } = useAppColors();

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={onSignOut}
      appName="habits"
      appColor={primary}
      quickActions={quickActions}
      onQuickAction={onQuickAction}
      onAiAssistantClick={onAiAssistantClick}
      onSettingsClick={onSettingsClick}
      notifications={notifications}
      onAcceptInvitation={onAcceptInvitation}
      onDeclineInvitation={onDeclineInvitation}
      onUpdatePreferences={onUpdatePreferences}
    >
      {children}
    </WorkspaceLayout>
  );
}
