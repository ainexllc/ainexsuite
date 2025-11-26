'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui';
import { useAppColors } from '@ainexsuite/theme';
import { Loader2 } from 'lucide-react';
import { NoteBoard } from '@/components/notes/note-board';
import { WorkspaceInsights } from '@/components/notes/workspace-insights';
import { SpaceSwitcher } from '@/components/spaces';

export default function NotesWorkspace() {
  const { user, loading, bootstrapStatus, ssoInProgress } = useAuth();
  const { primary } = useAppColors();
  const router = useRouter();
  const [mobileInsightsExpanded, setMobileInsightsExpanded] = useState(false);

  // Redirect to login if not authenticated
  // Wait for bootstrap and SSO to complete before redirecting to prevent interrupting auto-login
  useEffect(() => {
    if (!loading && !ssoInProgress && !user && bootstrapStatus !== 'running') {
      router.push('/');
    }
  }, [user, loading, ssoInProgress, bootstrapStatus, router]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { auth } = await import('@ainexsuite/firebase');
      const firebaseAuth = await import('firebase/auth');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (firebaseAuth as any).signOut(auth);
      router.push('/');
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
    }
  };

  // Show loading while authenticating, bootstrapping, or SSO in progress
  if (loading || ssoInProgress || bootstrapStatus === 'running') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={handleSignOut}
      searchPlaceholder="Search notes..."
      appName="NOTES"
      appColor={primary}
    >
      {/* Two-column layout matching Journey: max-w-7xl, mx-auto, gap-8 */}
      <div className="max-w-7xl mx-auto">
        {/* Mobile: Condensed AI Insights at top (hidden on xl+) */}
        <div className="xl:hidden mb-4">
          {mobileInsightsExpanded ? (
            <WorkspaceInsights
              variant="sidebar"
              onExpand={() => setMobileInsightsExpanded(false)}
            />
          ) : (
            <WorkspaceInsights
              variant="condensed"
              onExpand={() => setMobileInsightsExpanded(true)}
            />
          )}
        </div>

        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start xl:gap-8">
          {/* Left: Notes Content */}
          <div className="space-y-6">
            {/* Space Switcher above note composer */}
            <div className="flex items-center gap-4">
              <SpaceSwitcher />
            </div>
            <NoteBoard />
          </div>

          {/* Right: AI Insights Sidebar (visible on xl screens) */}
          <div className="sticky top-28 hidden h-fit flex-col gap-6 xl:flex">
            <WorkspaceInsights variant="sidebar" />
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
