'use client';

import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspaceLoadingScreen } from '@ainexsuite/ui';
import { SpacesProvider } from '@/components/providers/spaces-provider';
import { EventsProvider, useEvents } from '@/components/providers/events-provider';
import { WorkspaceLayoutWithInsights } from '@/components/layouts/workspace-layout-with-insights';

function WorkspaceLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, handleSignOut, updatePreferences } = useWorkspaceAuth();
  const { events } = useEvents();

  if (!user) return null;

  return (
    <WorkspaceLayoutWithInsights
      user={user}
      onSignOut={handleSignOut}
      onUpdatePreferences={updatePreferences}
      events={events}
    >
      {children}
    </WorkspaceLayoutWithInsights>
  );
}

export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isReady } = useWorkspaceAuth();

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
      <EventsProvider>
        <WorkspaceLayoutInner>{children}</WorkspaceLayoutInner>
      </EventsProvider>
    </SpacesProvider>
  );
}
