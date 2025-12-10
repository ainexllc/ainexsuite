'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspaceLayout, WorkspaceLoadingScreen } from '@ainexsuite/ui';
import { SpacesProvider } from '@/components/providers/spaces-provider';
import { getQuickActionsForApp } from '@ainexsuite/types';

export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, isReady, handleSignOut } = useWorkspaceAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Get quick actions for Journey app
  const quickActions = getQuickActionsForApp('journey');

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

  // Handle search trigger
  const handleSearchClick = useCallback(() => {
    setIsSearchOpen(true);
    // TODO: Open command palette when implemented
  }, []);

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
    <SpacesProvider>
      <WorkspaceLayout
        user={user}
        onSignOut={handleSignOut}
        searchPlaceholder="Search journal entries..."
        appName="Journey"
        // New props
        onSearchClick={handleSearchClick}
        quickActions={quickActions}
        onQuickAction={handleQuickAction}
        onAiAssistantClick={handleAiAssistantClick}
        notifications={[]}
      >
        {children}
      </WorkspaceLayout>
    </SpacesProvider>
  );
}
