'use client';

import { useWorkspaceAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLoadingScreen, useFontPreference } from '@ainexsuite/ui';
import { SpacesProvider } from '@/components/providers/spaces-provider';
import { HealthMetricsProvider } from '@/components/providers/health-metrics-provider';
import { PreferencesProvider } from '@/components/providers/preferences-provider';
import { WorkspaceLayoutWithInsights } from '@/components/layouts/workspace-layout-with-insights';

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
    <SuiteGuard appName="health">
      <SpacesProvider>
        <PreferencesProvider>
          <HealthMetricsProvider>
            <WorkspaceLayoutWithInsights
              user={user}
              onSignOut={handleSignOut}
              onUpdatePreferences={updatePreferences}
            >
              {children}
            </WorkspaceLayoutWithInsights>
          </HealthMetricsProvider>
        </PreferencesProvider>
      </SpacesProvider>
    </SuiteGuard>
  );
}