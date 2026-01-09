'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { useFontPreference, useFontSizePreference, SettingsModal, AppFloatingDock, WorkspaceLoadingScreen } from '@ainexsuite/ui/components';
import type { SpaceSettingsItem } from '@ainexsuite/ui';
import { LayoutDashboard } from 'lucide-react';
import { ActivityPanel } from '@/components/activity-panel';
import UniversalSearch from '@/components/universal-search';
import { KeyboardShortcutsModal } from '@/components/keyboard-shortcuts-modal';
import { QuickCreateMenu } from '@/components/quick-create-menu';
import { WorkspaceLayoutWithInsights } from '@/components/layouts/workspace-layout-with-insights';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { getQuickActionsForApp } from '@ainexsuite/types';
import { SpacesProvider, useSpaces } from '@/components/providers/spaces-provider';

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
  handleSignOut: () => Promise<void>;
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
  const router = useRouter();
  const { spaces, updateSpace, deleteSpace } = useSpaces();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'activity' | 'ai-assistant' | null>(null);

  // Map ALL spaces to SpaceSettingsItem format (excluding personal space)
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

  // Keyboard shortcuts
  const {
    shortcuts,
    isShortcutsModalOpen,
    setIsShortcutsModalOpen,
    isQuickCreateOpen,
    setIsQuickCreateOpen,
  } = useKeyboardShortcuts({
    onOpenSearch: () => setIsSearchOpen(true),
    onOpenShortcutsHelp: () => setIsShortcutsModalOpen(true),
    onOpenQuickCreate: () => setIsQuickCreateOpen(true),
    onOpenAiAssistant: () => setActivePanel('ai-assistant'),
    onOpenSettings: () => setSettingsModalOpen(true),
  });

  // Get quick actions for Main app
  const quickActions = getQuickActionsForApp('main');

  // Escape key for panels
  useEffect(() => {
    if (!activePanel) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActivePanel(null);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [activePanel]);

  const onSignOut = useCallback(async () => {
    try {
      await handleSignOut();
      router.push('/');
    } catch {
      // Ignore sign out errors
    }
  }, [handleSignOut, router]);

  // Handle quick actions
  const handleQuickAction = useCallback((actionId: string) => {
    switch (actionId) {
      case 'go-to-app':
        setIsSearchOpen(true);
        break;
      case 'quick-create':
        setIsQuickCreateOpen(true);
        break;
      default:
        break;
    }
  }, [setIsQuickCreateOpen]);

  // Handle AI assistant
  const handleAiAssistantClick = useCallback(() => {
    setActivePanel('ai-assistant');
  }, []);

  // Handle settings click
  const handleSettingsClick = useCallback(() => {
    setSettingsModalOpen(true);
  }, []);

  return (
    <>
      <WorkspaceLayoutWithInsights
        user={user}
        onSignOut={onSignOut}
        onSettingsClick={handleSettingsClick}
        onActivityClick={() => setActivePanel('activity')}
        quickActions={quickActions}
        onQuickAction={handleQuickAction}
        onAiAssistantClick={handleAiAssistantClick}
        onUpdatePreferences={updatePreferences}
      >
        {children}
      </WorkspaceLayoutWithInsights>

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
        spaces={spaceSettingsItems}
        currentAppId="main"
        onUpdateSpaceVisibility={handleUpdateSpaceVisibility}
        onDeleteSpace={deleteSpace}
        appSettingsLabel="Dashboard"
        appSettingsIcon={<LayoutDashboard className="h-4 w-4" />}
        onUpdateProfileImage={updateProfileImage}
        onRemoveProfileImage={removeProfileImage}
        profileImageApiEndpoint="/api/generate-profile-image"
        onGenerateAnimatedAvatar={generateAnimatedAvatar}
        onSaveAnimatedAvatar={saveAnimatedAvatar}
        onToggleAnimatedAvatar={toggleAnimatedAvatar}
        onRemoveAnimatedAvatar={removeAnimatedAvatar}
        onPollAnimationStatus={pollAnimationStatus}
        animateAvatarApiEndpoint="/api/animate-avatar"
      />

      {/* Right Panels - rendered outside WorkspaceLayout for proper z-index */}
      {activePanel && (
        <div
          className="fixed inset-0 z-30 bg-overlay/60 backdrop-blur-sm"
          onClick={() => setActivePanel(null)}
        />
      )}
      <ActivityPanel
        isOpen={!!activePanel}
        activeView={activePanel}
        onClose={() => setActivePanel(null)}
      />

      {/* Search Modal */}
      <UniversalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        shortcuts={shortcuts}
      />

      {/* Quick Create Menu */}
      <QuickCreateMenu
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
      />

      {/* App Floating Dock - Desktop only */}
      <AppFloatingDock currentApp="main" />
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

  // Show standardized loading screen while checking auth
  // This prevents providers from mounting and making Firestore calls before auth is confirmed
  if (isLoading || !isReady || !user) {
    return <WorkspaceLoadingScreen />;
  }

  return (
    <SpacesProvider>
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
    </SpacesProvider>
  );
}
