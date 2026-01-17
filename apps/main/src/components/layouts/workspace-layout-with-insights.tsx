"use client";

import { ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceLayout } from "@ainexsuite/ui";
import { useAppColors } from "@ainexsuite/theme";
import { useNotifications } from "@/hooks/use-notifications";
import type { QuickAction } from "@ainexsuite/types";

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
    preferences?: {
      fontFamily?: string;
      theme?: 'light' | 'dark' | 'system';
    };
  };
  onSignOut: () => void;
  quickActions?: QuickAction[];
  onQuickAction?: (actionId: string) => void;
  onSettingsClick?: () => void;
  onActivityClick?: () => void;
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
  onSettingsClick,
  onActivityClick,
  onUpdatePreferences,
}: WorkspaceLayoutWithInsightsProps) {
  const router = useRouter();
  const { primary } = useAppColors();

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

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={onSignOut}
      appName="space"
      appColor={primary}
      quickActions={quickActions}
      onQuickAction={onQuickAction}
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
      onUpdatePreferences={onUpdatePreferences}
    >
      {children}
    </WorkspaceLayout>
  );
}
