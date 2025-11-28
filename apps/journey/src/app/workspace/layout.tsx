'use client';

import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspaceLayout, WorkspaceLoadingScreen } from '@ainexsuite/ui';
import { SpacesProvider } from '@/components/providers/spaces-provider';

export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isReady, handleSignOut } = useWorkspaceAuth();

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
      >
        {children}
      </WorkspaceLayout>
    </SpacesProvider>
  );
}
