'use client';

import { useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspaceLoadingScreen, SettingsModal, useFontPreference, useFontSizePreference } from '@ainexsuite/ui';
import type { SpaceSettingsItem } from '@ainexsuite/ui';
import { WorkspaceLayoutWithInsights } from '@/components/layouts';
import { FitFirestoreSync } from '@/components/FitFirestoreSync';
import { SpacesProvider, useSpaces } from '@/components/providers/spaces-provider';
import { PreferencesProvider } from '@/components/providers/preferences-provider';
import { WorkoutsProvider } from '@/components/providers/workouts-provider';
import { getQuickActionsForApp } from '@ainexsuite/types';
import { Dumbbell } from 'lucide-react';
import { SettingsPanel } from '@/components/layout/settings-panel';

// Fit app preferences
interface FitAppPreferences {
  defaultView?: 'dashboard' | 'workouts' | 'nutrition' | 'recipes' | 'supplements';
  showPersonalRecords?: boolean;
  defaultUnit?: 'kg' | 'lbs';
  waterGoal?: number; // glasses per day
}

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
  const router = useRouter();
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const { allSpaces, updateSpace, deleteSpace } = useSpaces();

  // Simple local state for Fit app preferences
  const [appPreferences, setAppPreferences] = useState<FitAppPreferences>({
    defaultView: 'dashboard',
    showPersonalRecords: true,
    defaultUnit: 'lbs',
    waterGoal: 8,
  });

  // Map ALL spaces to SpaceSettingsItem format (excluding personal space)
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

  // Get quick actions for Fit app
  const quickActions = getQuickActionsForApp('fit');

  // Handle quick actions
  const handleQuickAction = useCallback((actionId: string) => {
    switch (actionId) {
      case 'new-workout':
        router.push('/workspace?action=new-workout');
        break;
      case 'log-meal':
        router.push('/workspace?action=log-meal');
        break;
      case 'log-weight':
        router.push('/workspace?action=log-weight');
        break;
      default:
        break;
    }
  }, [router]);

  // Handle AI assistant
  const handleAiAssistantClick = useCallback(() => {
    // TODO: Open AI assistant panel
  }, []);

  // Handle settings click
  const handleSettingsClick = useCallback(() => {
    setSettingsModalOpen(true);
  }, []);

  // Handle app preferences update
  const handleUpdateAppPreferences = useCallback(async (updates: Partial<FitAppPreferences>) => {
    setAppPreferences((prev) => ({ ...prev, ...updates }));
    // TODO: Persist to Firestore when ready
  }, []);

  return (
    <>
      <WorkspaceLayoutWithInsights
        user={user}
        onSignOut={handleSignOut}
        quickActions={quickActions}
        onQuickAction={handleQuickAction}
        onAiAssistantClick={handleAiAssistantClick}
        onSettingsClick={handleSettingsClick}
        notifications={[]}
        onUpdatePreferences={updatePreferences}
      >
        <FitFirestoreSync />
        {children}
      </WorkspaceLayoutWithInsights>

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
        } : null}
        preferences={user?.preferences ?? {
          theme: 'dark',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notifications: { email: true, push: false, inApp: true },
        }}
        onUpdatePreferences={updatePreferences}
        spaces={spaceSettingsItems}
        currentAppId="fit"
        onUpdateSpaceVisibility={handleUpdateSpaceVisibility}
        onDeleteSpace={deleteSpace}
        appSettings={
          <SettingsPanel
            preferences={appPreferences}
            isLoading={false}
            onUpdate={handleUpdateAppPreferences}
            onClose={() => setSettingsModalOpen(false)}
          />
        }
        appSettingsLabel="Fit"
        appSettingsIcon={<Dumbbell className="h-4 w-4" />}
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

  // Sync user font preferences from Firestore
  useFontPreference(user?.preferences?.fontFamily);
  useFontSizePreference(user?.preferences?.fontSize);

  // Show loading screen while checking auth
  if (isLoading || !isReady || !user) {
    return <WorkspaceLoadingScreen />;
  }

  return (
    <SpacesProvider>
      <PreferencesProvider>
        <WorkoutsProvider>
          <WorkspaceLayoutInner
            user={user}
            handleSignOut={handleSignOut}
            updatePreferences={updatePreferences}
          >
            {children}
          </WorkspaceLayoutInner>
        </WorkoutsProvider>
      </PreferencesProvider>
    </SpacesProvider>
  );
}
