'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLoadingScreen, SettingsModal, useFontPreference } from '@ainexsuite/ui';
import { WorkspaceLayoutWithInsights } from '@/components/layouts/workspace-layout-with-insights';
import { SpacesProvider } from '@/components/providers/spaces-provider';
import { PreferencesProvider, usePreferences } from '@/components/providers/preferences-provider';
import { SettingsPanel } from '@/components/layout/settings-panel';
import { getQuickActionsForApp } from '@ainexsuite/types';
import { Camera } from 'lucide-react';

function WorkspaceLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, handleSignOut, updatePreferences } = useWorkspaceAuth();
  const { preferences, updatePreferences: updateAppPreferences, loading: preferencesLoading } = usePreferences();
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Get quick actions for Album app
  const quickActions = getQuickActionsForApp('album');

  // Handle quick actions
  const handleQuickAction = useCallback((actionId: string) => {
    switch (actionId) {
      case 'new-moment':
        // Navigate to workspace with action (composer will handle it)
        router.push('/workspace?action=new-moment');
        break;
      default:
        // Unknown action - silently ignore
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

  if (!user) return null;

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
        appSettingsLabel="Album"
        appSettingsIcon={<Camera className="h-4 w-4" />}
      />
    </>
  );
}

export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isReady } = useWorkspaceAuth();

  // Sync user font preference from Firestore (theme sync is handled by WorkspaceLayout)
  useFontPreference(user?.preferences?.fontFamily);

  // Show standardized loading screen
  if (isLoading) {
    return <WorkspaceLoadingScreen />;
  }

  // Return null while redirecting
  if (!isReady || !user) {
    return null;
  }

  return (
    <SuiteGuard appName="album">
      <SpacesProvider>
        <PreferencesProvider>
          <WorkspaceLayoutContent>
            {children}
          </WorkspaceLayoutContent>
        </PreferencesProvider>
      </SpacesProvider>
    </SuiteGuard>
  );
}
