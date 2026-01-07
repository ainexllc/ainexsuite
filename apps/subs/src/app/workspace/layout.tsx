'use client';

import { useCallback, useState, useMemo } from 'react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspaceLayout, WorkspaceLoadingScreen, SettingsModal, useFontPreference, useFontSizePreference, AIInsightsModal, AppFloatingDock } from '@ainexsuite/ui';
import type { SpaceSettingsItem } from '@ainexsuite/ui';
import { SpacesProvider, useSpaces } from '@/components/providers/spaces-provider';
import { SubscriptionProvider } from '@/components/providers/subscription-provider';
import { useWorkspaceInsights } from '@/hooks/use-workspace-insights';
import { useAppColors } from '@ainexsuite/theme';
import { Wallet } from 'lucide-react';

/**
 * Inner layout that has access to SpacesProvider context
 */
function WorkspaceLayoutInner({
  children,
  user,
  handleSignOut,
  updatePreferences,
  updateProfile,
  updateProfileImage,
  removeProfileImage,
  generateAnimatedAvatar,
  saveAnimatedAvatar,
  toggleAnimatedAvatar,
  removeAnimatedAvatar,
  pollAnimationStatus,
}: {
  children: React.ReactNode;
  user: NonNullable<ReturnType<typeof useWorkspaceAuth>['user']>;
  handleSignOut: () => void;
  updatePreferences: (updates: { theme?: 'light' | 'dark' | 'system' }) => Promise<void>;
  updateProfile: (updates: { displayName?: string }) => Promise<void>;
  updateProfileImage: ReturnType<typeof useWorkspaceAuth>['updateProfileImage'];
  removeProfileImage: ReturnType<typeof useWorkspaceAuth>['removeProfileImage'];
  generateAnimatedAvatar: ReturnType<typeof useWorkspaceAuth>['generateAnimatedAvatar'];
  saveAnimatedAvatar: ReturnType<typeof useWorkspaceAuth>['saveAnimatedAvatar'];
  toggleAnimatedAvatar: ReturnType<typeof useWorkspaceAuth>['toggleAnimatedAvatar'];
  removeAnimatedAvatar: ReturnType<typeof useWorkspaceAuth>['removeAnimatedAvatar'];
  pollAnimationStatus: ReturnType<typeof useWorkspaceAuth>['pollAnimationStatus'];
}) {
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [insightsModalOpen, setInsightsModalOpen] = useState(false);
  const { allSpaces, updateSpace, deleteSpace } = useSpaces();
  const insights = useWorkspaceInsights();
  const { primary: primaryColor } = useAppColors();

  // Map ALL spaces to SpaceSettingsItem format (excluding personal space)
  // Use allSpaces so users can see and toggle visibility of hidden spaces
  const spaceSettingsItems = useMemo<SpaceSettingsItem[]>(() => {
    return allSpaces
      .filter((s) => s.id !== 'personal')
      .map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        isGlobal: (s as { isGlobal?: boolean }).isGlobal,
        hiddenInApps: (s as { hiddenInApps?: string[] }).hiddenInApps || [],
        memberCount: s.memberUids?.length || 1,
        isOwner: ((s as { ownerId?: string; createdBy?: string }).ownerId || (s as { ownerId?: string; createdBy?: string }).createdBy) === user?.uid,
      }));
  }, [allSpaces, user?.uid]);

  // Handle updating space visibility
  const handleUpdateSpaceVisibility = useCallback(async (spaceId: string, hiddenInApps: string[]) => {
    await updateSpace(spaceId, { hiddenInApps });
  }, [updateSpace]);

  // Handle settings click
  const handleSettingsClick = useCallback(() => {
    setSettingsModalOpen(true);
  }, []);

  // Extract raw data for modal display
  const rawData = insights.rawData as {
    spendingTrend?: string;
    recommendations?: string[];
    projectedYearly?: string;
    anomalies?: string[];
  } | null;

  // Extract local stats
  const localStats = insights.localStats as {
    totalMonthly?: number;
    totalYearly?: number;
    activeCount?: number;
    upcomingCount?: number;
  } | undefined;

  return (
    <>
      <WorkspaceLayout
        user={user}
        onSignOut={handleSignOut}
        appName="subs"
        onUpdatePreferences={updatePreferences}
        onSettingsClick={handleSettingsClick}
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
        onInsightsViewDetails={() => setInsightsModalOpen(true)}
        insightsEmptyStateMessage={insights.emptyStateMessage}
      >
        {children}
      </WorkspaceLayout>

      {/* Global Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        user={user ? {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          iconURL: user.iconURL,
          animatedAvatarURL: user.animatedAvatarURL,
          animatedAvatarStyle: user.animatedAvatarStyle,
          useAnimatedAvatar: user.useAnimatedAvatar,
        } : null}
        preferences={user?.preferences ?? {
          theme: 'dark',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notifications: { email: true, push: false, inApp: true },
        }}
        onUpdatePreferences={updatePreferences}
        onUpdateProfile={updateProfile}
        onUpdateProfileImage={updateProfileImage}
        onRemoveProfileImage={removeProfileImage}
        profileImageApiEndpoint="/api/generate-profile-image"
        onGenerateAnimatedAvatar={generateAnimatedAvatar}
        onSaveAnimatedAvatar={saveAnimatedAvatar}
        onToggleAnimatedAvatar={toggleAnimatedAvatar}
        onRemoveAnimatedAvatar={removeAnimatedAvatar}
        onPollAnimationStatus={pollAnimationStatus}
        animateAvatarApiEndpoint="/api/animate-avatar"
        spaces={spaceSettingsItems}
        currentAppId="subs"
        onUpdateSpaceVisibility={handleUpdateSpaceVisibility}
        onDeleteSpace={deleteSpace}
        appSettingsLabel="Subs"
        appSettingsIcon={<Wallet className="h-4 w-4" />}
      />

      {/* AI Insights Modal */}
      <AIInsightsModal
        isOpen={insightsModalOpen}
        onClose={() => setInsightsModalOpen(false)}
        weeklyFocus={rawData?.spendingTrend}
        pendingActions={rawData?.recommendations}
        quickTip={rawData?.anomalies?.[0]}
        streak={localStats?.activeCount}
        itemsThisWeek={localStats?.upcomingCount}
        lastUpdated={insights.lastUpdated}
        onRefresh={insights.onRefresh}
        isRefreshing={insights.isLoading}
        accentColor={primaryColor}
        actionsStorageKey="subs-pending-actions"
      />

      {/* App Floating Dock - Desktop only */}
      <AppFloatingDock currentApp="subs" />
    </>
  );
}

export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    user,
    isLoading,
    isReady,
    handleSignOut,
    updatePreferences,
    updateProfile,
    updateProfileImage,
    removeProfileImage,
    generateAnimatedAvatar,
    saveAnimatedAvatar,
    toggleAnimatedAvatar,
    removeAnimatedAvatar,
    pollAnimationStatus,
  } = useWorkspaceAuth();

  // Sync user font preferences from Firestore (theme sync is handled by WorkspaceLayout)
  useFontPreference(user?.preferences?.fontFamily);
  useFontSizePreference(user?.preferences?.fontSize);

  // Show loading screen while checking auth - prevents Firestore calls before auth is confirmed
  if (isLoading || !isReady || !user) {
    return <WorkspaceLoadingScreen />;
  }

  return (
    <SpacesProvider>
      <SubscriptionProvider>
        <WorkspaceLayoutInner
        user={user}
        handleSignOut={handleSignOut}
        updatePreferences={updatePreferences}
        updateProfile={updateProfile}
        updateProfileImage={updateProfileImage}
        removeProfileImage={removeProfileImage}
        generateAnimatedAvatar={generateAnimatedAvatar}
        saveAnimatedAvatar={saveAnimatedAvatar}
        toggleAnimatedAvatar={toggleAnimatedAvatar}
        removeAnimatedAvatar={removeAnimatedAvatar}
        pollAnimationStatus={pollAnimationStatus}
      >
        {children}
      </WorkspaceLayoutInner>
      </SubscriptionProvider>
    </SpacesProvider>
  );
}
