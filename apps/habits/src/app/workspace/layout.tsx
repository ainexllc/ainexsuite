'use client';

import { useWorkspaceAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLoadingScreen, useFontPreference } from '@ainexsuite/ui';
import { WorkspaceLayoutWithInsights } from '@/components/layouts/workspace-layout-with-insights';
import { NotificationToast } from '@/components/gamification/NotificationToast';
import { FirestoreSync } from '@/components/FirestoreSync';

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
    <SuiteGuard appName="habits">
      {/* Sync Firestore data to Zustand store */}
      <FirestoreSync />
      <WorkspaceLayoutWithInsights
        user={user}
        onSignOut={handleSignOut}
        onUpdatePreferences={updatePreferences}
      >
        <NotificationToast />
        {children}
      </WorkspaceLayoutWithInsights>
    </SuiteGuard>
  );
}