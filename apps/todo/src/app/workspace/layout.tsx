'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspaceLoadingScreen, useFontPreference } from '@ainexsuite/ui';
import { WorkspaceLayoutWithInsights } from '@/components/layouts';
import { TodoFirestoreSync } from '@/components/TodoFirestoreSync';
import { getQuickActionsForApp } from '@ainexsuite/types';

export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, isReady, handleSignOut, updatePreferences } = useWorkspaceAuth();

  // Sync user font preference from Firestore (theme sync is handled by WorkspaceLayout)
  useFontPreference(user?.preferences?.fontFamily);

  // Get quick actions for Todo app
  const quickActions = getQuickActionsForApp('todo');

  // Handle quick actions
  const handleQuickAction = useCallback((actionId: string) => {
    switch (actionId) {
      case 'new-task':
        router.push('/workspace?action=new-task');
        break;
      case 'new-project':
        router.push('/workspace?action=new-project');
        break;
      default:
        break;
    }
  }, [router]);

  // Handle AI assistant
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
    <WorkspaceLayoutWithInsights
      user={user}
      onSignOut={handleSignOut}
      quickActions={quickActions}
      onQuickAction={handleQuickAction}
      onAiAssistantClick={handleAiAssistantClick}
      notifications={[]}
      onUpdatePreferences={updatePreferences}
    >
      <TodoFirestoreSync />
      {children}
    </WorkspaceLayoutWithInsights>
  );
}