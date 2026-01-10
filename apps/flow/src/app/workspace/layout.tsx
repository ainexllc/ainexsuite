'use client';

import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspaceLoadingScreen, useFontPreference, useFontSizePreference } from '@ainexsuite/ui';
import { HintsProvider } from '@/components/hints';
import { AppProviders } from '@/components/providers';

/**
 * Minimal workspace layout - just provides auth check and providers.
 * Individual pages/routes handle their own layout (WorkspaceLayout vs full-width).
 */
export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isReady } = useWorkspaceAuth();

  // Sync user font preferences
  useFontPreference(user?.preferences?.fontFamily);
  useFontSizePreference(user?.preferences?.fontSize);

  // Show loading screen while checking auth
  if (isLoading || !isReady || !user) {
    return <WorkspaceLoadingScreen />;
  }

  return (
    <HintsProvider>
      <AppProviders>
        {children}
      </AppProviders>
    </HintsProvider>
  );
}
