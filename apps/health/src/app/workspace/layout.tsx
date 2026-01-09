'use client';

import { useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLoadingScreen, SettingsModal, useFontPreference, useFontSizePreference, AppFloatingDock } from '@ainexsuite/ui';
import type { SpaceSettingsItem } from '@ainexsuite/ui';
import { getQuickActionsForApp } from '@ainexsuite/types';
import { Heart } from 'lucide-react';
import { SpacesProvider, useSpaces } from '@/components/providers/spaces-provider';
import { HealthMetricsProvider } from '@/components/providers/health-metrics-provider';
import { PreferencesProvider, usePreferences } from '@/components/providers/preferences-provider';
import { GoalsProvider } from '@/providers/goals-provider';
import { HintsProvider } from '@/components/hints';
import { WorkspaceLayoutWithInsights } from '@/components/layouts/workspace-layout-with-insights';
import { SettingsPanel } from '@/components/layout/settings-panel';
import { AIAssistantPanel } from '@/components/ai-assistant-panel';
import { ExportModal } from '@/components/export-modal';

/**
 * Inner layout that has access to PreferencesProvider context
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
  const router = useRouter();
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const { preferences, updatePreferences: updateAppPreferences, loading: preferencesLoading } = usePreferences();
  const { spaces, updateSpace, deleteSpace } = useSpaces();

  // Map ALL spaces to SpaceSettingsItem format (excluding personal space)
  // Use allSpaces so users can see and toggle visibility of hidden spaces
  const spaceSettingsItems = useMemo<SpaceSettingsItem[]>(() => {
    return spaces
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
  }, [spaces, user?.uid]);

  // Handle updating space visibility
  const handleUpdateSpaceVisibility = useCallback(async (spaceId: string, hiddenInApps: string[]) => {
    await updateSpace(spaceId, { hiddenInApps });
  }, [updateSpace]);

  // Get quick actions for Health app
  const quickActions = getQuickActionsForApp('health');

  // Handle quick actions
  const handleQuickAction = useCallback((actionId: string) => {
    switch (actionId) {
      case 'log-metrics':
        // Focus the check-in composer or scroll to it
        router.push('/workspace?action=log-metrics');
        break;
      default:
        break;
    }
  }, [router]);

  // Handle AI assistant
  const handleAiAssistantClick = useCallback(() => {
    setAiPanelOpen(true);
  }, []);

  // Handle settings click
  const handleSettingsClick = useCallback(() => {
    setSettingsModalOpen(true);
  }, []);

  return (
    <>
      <WorkspaceLayoutWithInsights
        user={user}
        onSignOut={handleSignOut}
        quickActions={quickActions}
        onQuickAction={handleQuickAction}
        onAiAssistantClick={handleAiAssistantClick}
        onSettingsClick={handleSettingsClick}
        notifications={[]}
        onUpdatePreferences={updatePreferences}
      >
        {children}
      </WorkspaceLayoutWithInsights>

      {/* Global Settings Modal with App-specific Settings */}
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
        currentAppId="health"
        onUpdateSpaceVisibility={handleUpdateSpaceVisibility}
        onDeleteSpace={deleteSpace}
        appSettings={
          <SettingsPanel
            preferences={preferences}
            isLoading={preferencesLoading}
            onUpdate={updateAppPreferences}
            onClose={() => setSettingsModalOpen(false)}
          />
        }
        appSettingsLabel="Health"
        appSettingsIcon={<Heart className="h-4 w-4" />}
      />

      {/* AI Assistant Panel */}
      <AIAssistantPanel isOpen={aiPanelOpen} onClose={() => setAiPanelOpen(false)} />

      {/* Export Modal */}
      <ExportModal isOpen={exportModalOpen} onClose={() => setExportModalOpen(false)} />

      {/* App Floating Dock - Desktop only */}
      <AppFloatingDock currentApp="health" />
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
    <SuiteGuard appName="health">
      <SpacesProvider>
        <PreferencesProvider>
          <HealthMetricsProvider>
            <GoalsProvider>
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
            </GoalsProvider>
          </HealthMetricsProvider>
        </PreferencesProvider>
      </SpacesProvider>
    </SuiteGuard>
  );
}