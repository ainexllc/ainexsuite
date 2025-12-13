'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspaceLoadingScreen, SettingsModal, useFontPreference, useThemePreference } from '@ainexsuite/ui';
import { WorkspaceLayoutWithInsights } from '@/components/layouts/workspace-layout-with-insights';
import { getQuickActionsForApp } from '@ainexsuite/types';
import { StickyNote } from 'lucide-react';
import { SettingsPanel } from '@/components/layout/settings-panel';
import { usePreferences } from '@/components/providers/preferences-provider';

export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, isReady, handleSignOut, updatePreferences } = useWorkspaceAuth();
  const { preferences, updatePreferences: updateAppPreferences, loading: preferencesLoading } = usePreferences();
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Sync user preferences (font & theme) from Firestore
  useFontPreference(user?.preferences?.fontFamily);
  useThemePreference(user?.preferences?.theme);

  // Get quick actions for Notes app
  const quickActions = getQuickActionsForApp('notes');

  // Handle quick actions
  const handleQuickAction = useCallback((actionId: string) => {
    switch (actionId) {
      case 'new-note':
        // Navigate to create new note - this will be handled by the workspace page
        router.push('/workspace?action=new-note');
        break;
      case 'new-checklist':
        // Navigate to create new checklist
        router.push('/workspace?action=new-checklist');
        break;
      default:
        // Unknown action - silently ignore for now
        break;
    }
  }, [router]);

  // Handle AI assistant
  const handleAiAssistantClick = useCallback(() => {
    // TODO: Open AI assistant panel
  }, []);

  // Handle settings click
  const handleSettingsClick = useCallback(() => {
    setSettingsModalOpen(true);
  }, []);

  // Show standardized loading screen
  if (isLoading) {
    return <WorkspaceLoadingScreen />;
  }

  // Return null while redirecting
  if (!isReady || !user) {
    return null;
  }

  return (
    <>
      <WorkspaceLayoutWithInsights
        user={user}
        onSignOut={handleSignOut}
        quickActions={quickActions}
        onQuickAction={handleQuickAction}
        onAiAssistantClick={handleAiAssistantClick}
        onSettingsClick={handleSettingsClick}
        // Notifications - empty for now, will be populated by notification service
        notifications={[]}
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
        } : null}
        preferences={user?.preferences ?? {
          theme: 'dark',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notifications: { email: true, push: false, inApp: true },
        }}
        onUpdatePreferences={updatePreferences}
        appSettings={
          <SettingsPanel
            preferences={preferences}
            isLoading={preferencesLoading}
            onUpdate={updateAppPreferences}
            onClose={() => setSettingsModalOpen(false)}
          />
        }
        appSettingsLabel="Notes"
        appSettingsIcon={<StickyNote className="h-4 w-4" />}
      />
    </>
  );
}
