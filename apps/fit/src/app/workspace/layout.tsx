'use client';

import { useWorkspaceAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout, WorkspaceLoadingScreen, useFontPreference } from '@ainexsuite/ui';

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
    <SuiteGuard appName="fit">
      <WorkspaceLayout
        user={user}
        onSignOut={handleSignOut}
        appName="Fit"
        onUpdatePreferences={updatePreferences}
      >
        {children}
      </WorkspaceLayout>
    </SuiteGuard>
  );
}
