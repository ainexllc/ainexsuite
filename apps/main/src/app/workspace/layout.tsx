'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { useFontPreference, useFontSizePreference, SettingsModal, AppFloatingDock } from '@ainexsuite/ui/components';
import { LayoutDashboard } from 'lucide-react';
import { ActivityPanel } from '@/components/activity-panel';
import UniversalSearch from '@/components/universal-search';
import { KeyboardShortcutsModal } from '@/components/keyboard-shortcuts-modal';
import { QuickCreateMenu } from '@/components/quick-create-menu';
import { WorkspaceLayoutWithInsights } from '@/components/layouts/workspace-layout-with-insights';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { getQuickActionsForApp } from '@ainexsuite/types';

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
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Sync user font preferences from Firestore (theme sync is handled by WorkspaceLayout)
  useFontPreference(user?.preferences?.fontFamily);
  useFontSizePreference(user?.preferences?.fontSize);
  const [activePanel, setActivePanel] = useState<'activity' | 'ai-assistant' | null>(null);

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

  // Redirect logic
  useEffect(() => {
    if (!isLoading && isReady && !user) {
      router.push('/');
    }
  }, [user, isLoading, isReady, router]);

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
    await handleSignOut();
    router.push('/');
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

  // Show loading screen while checking auth - prevents Firestore calls before auth is confirmed
  if (isLoading || !isReady || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
      </div>
    );
  }

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
        onUpdateProfileImage={updateProfileImage}
        onRemoveProfileImage={removeProfileImage}
        profileImageApiEndpoint="/api/generate-profile-image"
        onGenerateAnimatedAvatar={generateAnimatedAvatar}
        onSaveAnimatedAvatar={saveAnimatedAvatar}
        onToggleAnimatedAvatar={toggleAnimatedAvatar}
        onRemoveAnimatedAvatar={removeAnimatedAvatar}
        onPollAnimationStatus={pollAnimationStatus}
        animateAvatarApiEndpoint="/api/animate-avatar"
        currentAppId="main"
        appSettingsLabel="Dashboard"
        appSettingsIcon={<LayoutDashboard className="h-4 w-4" />}
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
