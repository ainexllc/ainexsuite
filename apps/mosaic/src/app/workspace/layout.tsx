'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { useFontPreference, useFontSizePreference, SettingsModal, AppFloatingDock, WorkspaceLoadingScreen } from '@ainexsuite/ui/components';
import type { SpaceSettingsItem } from '@ainexsuite/ui';
import { LayoutDashboard } from 'lucide-react';
import { HintsProvider } from '@/components/hints';
import { SpacesProvider, useSpaces } from '@/components/providers/spaces-provider';
import { WorkspaceLayout } from '@ainexsuite/ui';

/**
 * Inner layout that has access to SpacesProvider context
 */
function WorkspaceLayoutInner({
  children,
  user,
  handleSignOut,
  updatePreferences,
  updateProfile,
  updateProfileImage,
  removeProfileImage,
  generateAnimatedAvatar,
  saveAnimatedAvatar,
  toggleAnimatedAvatar,
  removeAnimatedAvatar,
  pollAnimationStatus,
}: {
  children: React.ReactNode;
  user: NonNullable<ReturnType<typeof useWorkspaceAuth>['user']>;
  handleSignOut: () => Promise<void>;
  updatePreferences: (updates: { theme?: 'light' | 'dark' | 'system' }) => Promise<void>;
  updateProfile: (updates: { displayName?: string }) => Promise<void>;
  updateProfileImage: (imageData: string) => Promise<{ success: boolean; error?: string }>;
  removeProfileImage: () => Promise<boolean>;
  generateAnimatedAvatar: (action: string) => Promise<{ success: boolean; videoData?: string; error?: string; pending?: boolean; operationId?: string }>;
  saveAnimatedAvatar: (videoData: string, action: string) => Promise<{ success: boolean; error?: string }>;
  toggleAnimatedAvatar: (useAnimated: boolean) => Promise<void>;
  removeAnimatedAvatar: () => Promise<boolean>;
  pollAnimationStatus: (operationId: string) => Promise<{ success: boolean; done: boolean; videoData?: string; error?: string }>;
}) {
  const router = useRouter();
  const { spaces, updateSpace, deleteSpace } = useSpaces();
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Map ALL spaces to SpaceSettingsItem format (excluding personal space)
  const spaceSettingsItems = useMemo<SpaceSettingsItem[]>(() => {
    return spaces
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
  }, [spaces, user?.uid]);

  // Handle updating space visibility
  const handleUpdateSpaceVisibility = useCallback(async (spaceId: string, hiddenInApps: string[]) => {
    await updateSpace(spaceId, { hiddenInApps });
  }, [updateSpace]);

  const onSignOut = useCallback(async () => {
    try {
      await handleSignOut();
      router.push('/');
    } catch {
      // Ignore sign out errors
    }
  }, [handleSignOut, router]);

  // Handle settings click
  const handleSettingsClick = useCallback(() => {
    setSettingsModalOpen(true);
  }, []);

  return (
    <HintsProvider>
      <WorkspaceLayout
        user={user}
        onSignOut={onSignOut}
        appName="display"
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
          iconURL: user.iconURL,
          animatedAvatarURL: user.animatedAvatarURL,
          animatedAvatarStyle: user.animatedAvatarStyle,
          useAnimatedAvatar: user.useAnimatedAvatar,
        } : null}
        preferences={user?.preferences ?? {
          theme: 'dark',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notifications: { email: true, push: false, inApp: true },
        }}
        onUpdatePreferences={updatePreferences}
        onUpdateProfile={updateProfile}
        spaces={spaceSettingsItems}
        currentAppId="mosaic"
        onUpdateSpaceVisibility={handleUpdateSpaceVisibility}
        onDeleteSpace={deleteSpace}
        appSettingsLabel="Display"
        appSettingsIcon={<LayoutDashboard className="h-4 w-4" />}
        onUpdateProfileImage={updateProfileImage}
        onRemoveProfileImage={removeProfileImage}
        profileImageApiEndpoint="/api/generate-profile-image"
        onGenerateAnimatedAvatar={generateAnimatedAvatar}
        onSaveAnimatedAvatar={saveAnimatedAvatar}
        onToggleAnimatedAvatar={toggleAnimatedAvatar}
        onRemoveAnimatedAvatar={removeAnimatedAvatar}
        onPollAnimationStatus={pollAnimationStatus}
        animateAvatarApiEndpoint="/api/animate-avatar"
      />

      {/* App Floating Dock - Desktop only */}
      <AppFloatingDock currentApp="mosaic" />
    </HintsProvider>
  );
}

export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    user,
    isLoading,
    isReady,
    handleSignOut,
    updatePreferences,
    updateProfile,
    updateProfileImage,
    removeProfileImage,
    generateAnimatedAvatar,
    saveAnimatedAvatar,
    toggleAnimatedAvatar,
    removeAnimatedAvatar,
    pollAnimationStatus,
  } = useWorkspaceAuth();

  // Sync user font preferences from Firestore (theme sync is handled by WorkspaceLayout)
  useFontPreference(user?.preferences?.fontFamily);
  useFontSizePreference(user?.preferences?.fontSize);

  // Show standardized loading screen while checking auth
  // This prevents providers from mounting and making Firestore calls before auth is confirmed
  if (isLoading || !isReady || !user) {
    return <WorkspaceLoadingScreen />;
  }

  return (
    <SpacesProvider>
      <WorkspaceLayoutInner
        user={user}
        handleSignOut={handleSignOut}
        updatePreferences={updatePreferences}
        updateProfile={updateProfile}
        updateProfileImage={updateProfileImage}
        removeProfileImage={removeProfileImage}
        generateAnimatedAvatar={generateAnimatedAvatar}
        saveAnimatedAvatar={saveAnimatedAvatar}
        toggleAnimatedAvatar={toggleAnimatedAvatar}
        removeAnimatedAvatar={removeAnimatedAvatar}
        pollAnimationStatus={pollAnimationStatus}
      >
        {children}
      </WorkspaceLayoutInner>
    </SpacesProvider>
  );
}
