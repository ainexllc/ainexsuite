'use client';

import { useCallback, useState, useMemo } from 'react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspaceLayout, WorkspaceLoadingScreen, SettingsModal, useFontPreference, useFontSizePreference } from '@ainexsuite/ui';
import type { SpaceSettingsItem } from '@ainexsuite/ui';
import { SpacesProvider, useSpaces } from '@/components/providers/spaces-provider';
import { Wallet } from 'lucide-react';

/**
 * Inner layout that has access to SpacesProvider context
 */
function WorkspaceLayoutInner({
  children,
  user,
  handleSignOut,
  updatePreferences,
}: {
  children: React.ReactNode;
  user: NonNullable<ReturnType<typeof useWorkspaceAuth>['user']>;
  handleSignOut: () => void;
  updatePreferences: (updates: { theme?: 'light' | 'dark' | 'system' }) => Promise<void>;
}) {
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const { allSpaces, updateSpace, deleteSpace } = useSpaces();

  // Map ALL spaces to SpaceSettingsItem format (excluding personal space)
  // Use allSpaces so users can see and toggle visibility of hidden spaces
  const spaceSettingsItems = useMemo<SpaceSettingsItem[]>(() => {
    return allSpaces
      .filter((s) => s.id !== 'personal')
      .map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        isGlobal: (s as { isGlobal?: boolean }).isGlobal,
        hiddenInApps: (s as { hiddenInApps?: string[] }).hiddenInApps || [],
        memberCount: s.memberUids?.length || 1,
        isOwner: ((s as { ownerId?: string; createdBy?: string }).ownerId || (s as { ownerId?: string; createdBy?: string }).createdBy) === user?.uid,
      }));
  }, [allSpaces, user?.uid]);

  // Handle updating space visibility
  const handleUpdateSpaceVisibility = useCallback(async (spaceId: string, hiddenInApps: string[]) => {
    await updateSpace(spaceId, { hiddenInApps });
  }, [updateSpace]);

  // Handle settings click
  const handleSettingsClick = useCallback(() => {
    setSettingsModalOpen(true);
  }, []);

  return (
    <>
      <WorkspaceLayout
        user={user}
        onSignOut={handleSignOut}
        appName="Track"
        onUpdatePreferences={updatePreferences}
        onSettingsClick={handleSettingsClick}
      >
        {children}
      </WorkspaceLayout>

      {/* Global Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        user={user ? {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        } : null}
        preferences={user?.preferences ?? {
          theme: 'dark',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notifications: { email: true, push: false, inApp: true },
        }}
        onUpdatePreferences={updatePreferences}
        spaces={spaceSettingsItems}
        currentAppId="track"
        onUpdateSpaceVisibility={handleUpdateSpaceVisibility}
        onDeleteSpace={deleteSpace}
        appSettingsLabel="Track"
        appSettingsIcon={<Wallet className="h-4 w-4" />}
      />
    </>
  );
}

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
    <SpacesProvider>
      <WorkspaceLayoutInner
        user={user}
        handleSignOut={handleSignOut}
        updatePreferences={updatePreferences}
      >
        {children}
      </WorkspaceLayoutInner>
    </SpacesProvider>
  );
}
