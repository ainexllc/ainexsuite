'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspaceLayout, WorkspaceLoadingScreen, useFontPreference, useThemePreference } from '@ainexsuite/ui';
import { SpacesProvider } from '@/components/providers/spaces-provider';
import { getQuickActionsForApp } from '@ainexsuite/types';

export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, isReady, handleSignOut, updatePreferences } = useWorkspaceAuth();

  // Sync user preferences (font & theme) from Firestore
  useFontPreference(user?.preferences?.fontFamily);
  useThemePreference(user?.preferences?.theme);

  // Get quick actions for Journey app
  const quickActions = getQuickActionsForApp('journey');

  // Handle quick actions (abbreviated)
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

  // Handle AI assistant (abbreviated)
  const handleAiAssistantClick = useCallback(() => {
    // TODO: Open AI assistant panel
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
    <SpacesProvider>
      <WorkspaceLayout
        user={user}
        onSignOut={handleSignOut}
        appName="Journey"
        quickActions={quickActions}
        onQuickAction={handleQuickAction}
        onAiAssistantClick={handleAiAssistantClick}
        notifications={[]}
        onUpdatePreferences={updatePreferences}
      >
        {children}
      </WorkspaceLayout>
    </SpacesProvider>
  );
}
