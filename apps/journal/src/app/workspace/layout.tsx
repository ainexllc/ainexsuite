'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspaceLoadingScreen, SettingsModal, useFontPreference } from '@ainexsuite/ui';
import { SpacesProvider } from '@/components/providers/spaces-provider';
import { EntriesProvider, useEntries } from '@/components/providers/entries-provider';
import { PreferencesProvider } from '@/components/providers/preferences-provider';
import { PrivacyProvider } from '@ainexsuite/privacy';
import { CoverSettingsProvider } from '@/contexts/cover-settings-context';
import { WorkspaceLayoutWithInsights } from '@/components/layouts/workspace-layout-with-insights';
import { getQuickActionsForApp } from '@ainexsuite/types';
import { BookOpen } from 'lucide-react';

/**
 * Inner layout that has access to EntriesProvider context
 */
function WorkspaceLayoutInner({
  children,
  user,
  handleSignOut,
  updatePreferences,
}: {
  children: React.ReactNode;
  user: NonNullable<ReturnType<typeof useWorkspaceAuth>['user']>;
  handleSignOut: () => void;
  updatePreferences: (updates: { theme?: 'light' | 'dark' | 'system' }) => Promise<void>;
}) {
  const router = useRouter();
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const { entries, loading: entriesLoading } = useEntries();

  // Get quick actions for Journal app
  const quickActions = getQuickActionsForApp('journal');

  // Handle quick actions
  const handleQuickAction = useCallback((actionId: string) => {
    switch (actionId) {
      case 'new-entry':
        router.push('/workspace?action=new-entry');
        break;
      case 'new-reflection':
        router.push('/workspace?action=new-reflection');
        break;
      default:
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
        entries={entries}
        entriesLoading={entriesLoading}
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
        appSettingsLabel="Journal"
        appSettingsIcon={<BookOpen className="h-4 w-4" />}
      />
    </>
  );
}

export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isReady, handleSignOut, updatePreferences } = useWorkspaceAuth();

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
    <SpacesProvider>
      <PrivacyProvider config={{ appName: 'journal' }}>
        <CoverSettingsProvider>
          <PreferencesProvider>
            <EntriesProvider>
              <WorkspaceLayoutInner
                user={user}
                handleSignOut={handleSignOut}
                updatePreferences={updatePreferences}
              >
                {children}
              </WorkspaceLayoutInner>
            </EntriesProvider>
          </PreferencesProvider>
        </CoverSettingsProvider>
      </PrivacyProvider>
    </SpacesProvider>
  );
}
