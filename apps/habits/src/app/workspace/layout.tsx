'use client';

import { useCallback, useState, useMemo } from 'react';
import { useWorkspaceAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLoadingScreen, SettingsModal, SpaceSettings, InviteMemberModal, useFontPreference, useFontSizePreference, AppFloatingDock } from '@ainexsuite/ui';
import type { SpaceSettingsItem, SettingsTab } from '@ainexsuite/ui';
import type { SpaceType, SpaceRole } from '@ainexsuite/types';
import { createInvitation } from '@ainexsuite/firebase';
import { WorkspaceLayoutWithInsights } from '@/components/layouts/workspace-layout-with-insights';
import { NotificationToast } from '@/components/gamification/NotificationToast';
import { FirestoreSync } from '@/components/FirestoreSync';
import { SpacesProvider, useSpaces } from '@/components/providers/spaces-provider';
import { SettingsContext } from '@/components/providers/settings-context';
import { useSpaceNotifications } from '@/hooks/use-space-notifications';
import { Sprout } from 'lucide-react';

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
  handleSignOut: () => void;
  updatePreferences: (updates: { theme?: 'light' | 'dark' | 'system' }) => Promise<void>;
  updateProfile: (updates: { displayName?: string }) => Promise<void>;
  updateProfileImage: (imageData: string) => Promise<{ success: boolean; error?: string }>;
  removeProfileImage: () => Promise<boolean>;
  generateAnimatedAvatar: (style: string) => Promise<{ success: boolean; videoData?: string; error?: string; pending?: boolean; operationId?: string }>;
  saveAnimatedAvatar: (videoData: string, style: string) => Promise<{ success: boolean; error?: string }>;
  toggleAnimatedAvatar: (useAnimated: boolean) => Promise<void>;
  removeAnimatedAvatar: () => Promise<boolean>;
  pollAnimationStatus: (operationId: string) => Promise<{ success: boolean; done: boolean; videoData?: string; error?: string }>;
}) {
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settingsDefaultTab, setSettingsDefaultTab] = useState<SettingsTab>('profile');
  const [spaceSettingsOpen, setSpaceSettingsOpen] = useState(false);
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const { spaces, currentSpace, updateSpace, deleteSpace, refreshSpaces } = useSpaces();
  const { notifications, handleAcceptInvitation, handleDeclineInvitation } = useSpaceNotifications();

  // Open settings modal with optional tab selection
  const openSettings = useCallback((tab?: SettingsTab) => {
    setSettingsDefaultTab(tab || 'profile');
    setSettingsModalOpen(true);
  }, []);

  // Open invite modal for current space
  const openInviteModal = useCallback(() => {
    if (currentSpace && currentSpace.type !== 'personal') {
      setInviteModalOpen(true);
    }
  }, [currentSpace]);

  // Get current space being edited for SpaceSettings
  const editingSpace = useMemo(() => {
    if (!editingSpaceId) return null;
    return spaces.find((s) => s.id === editingSpaceId) || null;
  }, [editingSpaceId, spaces]);

  // Map ALL spaces to SpaceSettingsItem format (excluding personal space)
  // Use allSpaces so users can see and toggle visibility of hidden spaces
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
        isOwner: s.createdBy === user?.uid,
      }));
  }, [spaces, user?.uid]);

  // Handle updating space visibility
  const handleUpdateSpaceVisibility = useCallback(async (spaceId: string, hiddenInApps: string[]) => {
    await updateSpace(spaceId, { hiddenInApps });
  }, [updateSpace]);

  // Handle opening SpaceSettings modal
  const handleEditSpace = useCallback((spaceId: string) => {
    setEditingSpaceId(spaceId);
    setSpaceSettingsOpen(true);
  }, []);

  // Handle saving space settings
  const handleSaveSpaceSettings = useCallback(
    async (data: { name: string; color?: string; icon?: string }) => {
      if (!editingSpaceId) return;
      await updateSpace(editingSpaceId, data);
      refreshSpaces();
    },
    [editingSpaceId, updateSpace, refreshSpaces]
  );

  // Handle deleting a space
  const handleDeleteSpace = useCallback(async () => {
    if (!editingSpaceId) return;
    await deleteSpace(editingSpaceId);
    setSpaceSettingsOpen(false);
    setEditingSpaceId(null);
  }, [editingSpaceId, deleteSpace]);

  // Handle settings click (from header)
  const handleSettingsClick = useCallback(() => {
    openSettings('profile');
  }, [openSettings]);

  // Handle invite for current space
  const handleInviteMember = useCallback(async (email: string, role: SpaceRole) => {
    if (!currentSpace || !user) {
      return { success: false, error: 'No space selected' };
    }
    try {
      await createInvitation({
        spaceId: currentSpace.id,
        spaceName: currentSpace.name,
        spaceType: currentSpace.type as SpaceType,
        email,
        role,
        inviter: {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to send invitation' };
    }
  }, [currentSpace, user]);

  // Context value for child components
  const settingsContextValue = useMemo(() => ({ openSettings, openInviteModal }), [openSettings, openInviteModal]);

  return (
    <SettingsContext.Provider value={settingsContextValue}>
      <FirestoreSync />
      <WorkspaceLayoutWithInsights
        user={user}
        onSignOut={handleSignOut}
        onUpdatePreferences={updatePreferences}
        onSettingsClick={handleSettingsClick}
        notifications={notifications}
        onAcceptInvitation={handleAcceptInvitation}
        onDeclineInvitation={handleDeclineInvitation}
      >
        <NotificationToast />
        {children}
      </WorkspaceLayoutWithInsights>

      {/* Global Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        defaultTab={settingsDefaultTab}
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
        currentAppId="habits"
        onEditSpace={handleEditSpace}
        onUpdateSpaceVisibility={handleUpdateSpaceVisibility}
        onDeleteSpace={deleteSpace}
        showGlobalSpacesTab={false}
        appSettingsLabel="Habits"
        appSettingsIcon={<Sprout className="h-4 w-4" />}
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

      {/* Space Settings Modal */}
      {editingSpace && (
        <SpaceSettings
          isOpen={spaceSettingsOpen}
          onClose={() => {
            setSpaceSettingsOpen(false);
            setEditingSpaceId(null);
          }}
          space={{
            id: editingSpace.id,
            name: editingSpace.name,
            type: editingSpace.type as SpaceType,
            color: (editingSpace as { color?: string }).color as Parameters<typeof SpaceSettings>[0]['space']['color'],
            icon: (editingSpace as { icon?: string }).icon as Parameters<typeof SpaceSettings>[0]['space']['icon'],
            isGlobal: (editingSpace as { isGlobal?: boolean }).isGlobal,
            members: (editingSpace.members || []).map((m) => ({
              uid: m.uid,
              displayName: m.displayName,
              email: undefined as string | undefined,
              photoURL: m.photoURL,
              role: m.role as SpaceRole,
              joinedAt: typeof m.joinedAt === 'string' ? new Date(m.joinedAt).getTime() : m.joinedAt,
            })),
          }}
          currentUserId={user.uid}
          onSave={handleSaveSpaceSettings}
          onDelete={handleDeleteSpace}
          canEdit={
            (editingSpace.members || []).find((m) => m.uid === user.uid)?.role === 'admin'
          }
          canDelete={editingSpace.createdBy === user.uid}
        />
      )}

      {/* Invite Member Modal */}
      {currentSpace && currentSpace.type !== 'personal' && (
        <InviteMemberModal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          space={{
            id: currentSpace.id,
            name: currentSpace.name,
            type: currentSpace.type as SpaceType,
            memberCount: currentSpace.memberUids?.length || 1,
          }}
          memberLimit={null}
          onInvite={handleInviteMember}
        />
      )}

      {/* App Floating Dock - Desktop only */}
      <AppFloatingDock currentApp="habits" />
    </SettingsContext.Provider>
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

  // Show loading screen while checking auth - prevents Firestore calls before auth is confirmed
  if (isLoading || !isReady || !user) {
    return <WorkspaceLoadingScreen />;
  }

  return (
    <SuiteGuard appName="habits">
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
    </SuiteGuard>
  );
}