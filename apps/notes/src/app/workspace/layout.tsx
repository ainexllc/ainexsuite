'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspaceLoadingScreen } from '@ainexsuite/ui';
import { WorkspaceLayoutWithInsights } from '@/components/layouts/workspace-layout-with-insights';
import { getQuickActionsForApp } from '@ainexsuite/types';

export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, isReady, handleSignOut, updatePreferences } = useWorkspaceAuth();

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
      // Notifications - empty for now, will be populated by notification service
      notifications={[]}
      onUpdatePreferences={updatePreferences}
    >
      {children}
    </WorkspaceLayoutWithInsights>
  );
}
