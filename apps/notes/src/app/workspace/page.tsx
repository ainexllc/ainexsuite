'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { WorkspaceLayout, WorkspacePageHeader } from '@ainexsuite/ui';
import { useAppColors } from '@ainexsuite/theme';
import { Loader2 } from 'lucide-react';
import { NoteBoard } from '@/components/notes/note-board';
import { WorkspaceInsights } from '@/components/notes/workspace-insights';
import { NavigationPanel } from '../../components/layout/navigation-panel';

export default function NotesWorkspace() {
  const { user, loading } = useAuth();
  const { primary } = useAppColors();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

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

  if (loading) {
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
      renderSidebar={(props) => <NavigationPanel {...props} />}
    >
      <WorkspacePageHeader
        title={`Welcome to Notes, ${user.displayName ? user.displayName.split(' ')[0] : 'there'}!`}
        description="Your personal note-taking workspace"
      >
        {/* AI Workspace Insights */}
        <WorkspaceInsights />

        {/* Notes Content */}
        <NoteBoard />
      </WorkspacePageHeader>
    </WorkspaceLayout>
  );
}
