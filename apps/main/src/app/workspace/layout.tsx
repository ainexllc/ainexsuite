'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { useFontPreference, useFontSizePreference } from '@ainexsuite/ui/components';
import { Loader2 } from 'lucide-react';
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
  const { user, loading, signOut, bootstrapStatus, ssoInProgress, updatePreferences } = useAuth();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync user font preferences from Firestore (theme sync is handled by WorkspaceLayout)
  useFontPreference(user?.preferences?.fontFamily);
  useFontSizePreference(user?.preferences?.fontSize);
  const [activePanel, setActivePanel] = useState<'activity' | 'settings' | 'ai-assistant' | null>(null);

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
    onOpenSettings: () => setActivePanel('settings'),
  });

  // Get quick actions for Main app
  const quickActions = getQuickActionsForApp('main');

  // Redirect logic
  useEffect(() => {
    if (!loading && !ssoInProgress && !user && bootstrapStatus !== 'running') {
      router.push('/');
    }
  }, [user, loading, ssoInProgress, bootstrapStatus, router]);

  // Escape key for panels
  useEffect(() => {
    if (!activePanel) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActivePanel(null);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [activePanel]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

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

  if (loading || ssoInProgress || bootstrapStatus === 'running') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <WorkspaceLayoutWithInsights
        user={user}
        onSignOut={handleSignOut}
        onSettingsClick={() => setActivePanel('settings')}
        onActivityClick={() => setActivePanel('activity')}
        quickActions={quickActions}
        onQuickAction={handleQuickAction}
        onAiAssistantClick={handleAiAssistantClick}
        notifications={[]}
        onUpdatePreferences={updatePreferences}
      >
        {children}
      </WorkspaceLayoutWithInsights>

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
    </>
  );
}
