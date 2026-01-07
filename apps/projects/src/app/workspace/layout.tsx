'use client';

import { useCallback, useState, useMemo } from 'react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspaceLayout, WorkspaceLoadingScreen, SettingsModal, AIInsightsModal, useFontPreference, useFontSizePreference, AppFloatingDock } from '@ainexsuite/ui';
import type { SpaceSettingsItem } from '@ainexsuite/ui';
import { SpacesProvider, useSpaces } from '@/components/providers/spaces-provider';
import { HintsProvider } from '@/components/hints';
import { useWorkspaceInsights } from '@/hooks/use-workspace-insights';
import { useAppColors } from '@ainexsuite/theme';
import { FolderKanban } from 'lucide-react';

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
  updateProfileImage: (imageData: string) => Promise<{ success: boolean; error?: string }>;
  removeProfileImage: () => Promise<boolean>;
  generateAnimatedAvatar: (action: string) => Promise<{ success: boolean; videoData?: string; error?: string; pending?: boolean; operationId?: string }>;
  saveAnimatedAvatar: (videoData: string, action: string) => Promise<{ success: boolean; error?: string }>;
  toggleAnimatedAvatar: (useAnimated: boolean) => Promise<void>;
  removeAnimatedAvatar: () => Promise<boolean>;
  pollAnimationStatus: (operationId: string) => Promise<{ success: boolean; done: boolean; videoData?: string; error?: string }>;
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
    portfolioHealth?: string;
    focusArea?: string;
    riskAlerts?: string[];
    recommendations?: string[];
    productivityTip?: string;
    upcomingDeadlines?: string;
  } | null;

  // Extract local stats
  const localStats = insights.localStats as {
    totalProjects?: number;
    activeProjects?: number;
    completedProjects?: number;
    urgentProjects?: number;
  } | undefined;

  return (
    <>
      <WorkspaceLayout
        user={user}
        onSignOut={handleSignOut}
        appName="projects"
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
        currentAppId="projects"
        onUpdateSpaceVisibility={handleUpdateSpaceVisibility}
        onDeleteSpace={deleteSpace}
        appSettingsLabel="Projects"
        appSettingsIcon={<FolderKanban className="h-4 w-4" />}
      />

      {/* AI Insights Modal */}
      <AIInsightsModal
        isOpen={insightsModalOpen}
        onClose={() => setInsightsModalOpen(false)}
        weeklyFocus={rawData?.portfolioHealth}
        mood={rawData?.focusArea}
        pendingActions={rawData?.recommendations}
        quickTip={rawData?.productivityTip}
        streak={localStats?.activeProjects}
        itemsThisWeek={localStats?.completedProjects}
        lastUpdated={insights.lastUpdated}
        onRefresh={insights.onRefresh}
        isRefreshing={insights.isLoading}
        accentColor={primaryColor}
        actionsStorageKey="projects-pending-actions"
      />

      {/* App Floating Dock - Desktop only */}
      <AppFloatingDock currentApp="projects" />
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
      <HintsProvider>
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
      </HintsProvider>
    </SpacesProvider>
  );
}
