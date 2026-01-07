'use client';

import { useWorkspaceAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout, WorkspaceLoadingScreen, useFontPreference, useFontSizePreference, AppFloatingDock } from '@ainexsuite/ui';
import { HintsProvider } from '@/components/hints';

export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isReady, handleSignOut, updatePreferences } = useWorkspaceAuth();

  // Sync user font preferences from Firestore (theme sync is handled by WorkspaceLayout)
  useFontPreference(user?.preferences?.fontFamily);
  useFontSizePreference(user?.preferences?.fontSize);

  // Show loading screen while checking auth - prevents Firestore calls before auth is confirmed
  if (isLoading || !isReady || !user) {
    return <WorkspaceLoadingScreen />;
  }

  return (
    <SuiteGuard appName="hub">
      <HintsProvider>
        <WorkspaceLayout
          user={user}
          onSignOut={handleSignOut}
          appName="display"
          onUpdatePreferences={updatePreferences}
        >
          {children}
        </WorkspaceLayout>
        {/* App Floating Dock - Desktop only */}
        <AppFloatingDock currentApp="mosaic" />
      </HintsProvider>
    </SuiteGuard>
  );
}
