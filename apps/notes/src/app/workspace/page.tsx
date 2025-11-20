'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { useAppColors } from '@ainexsuite/theme';
import { Loader2 } from 'lucide-react';
import { NoteBoard } from '@/components/notes/note-board';

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
      // Ignore sign out error
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
    >
      {/* Welcome and Notes Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome to Notes, {user.displayName ? user.displayName.split(' ')[0] : 'there'}!
          </h2>
          <p className="text-lg text-white/70">
            Your personal note-taking workspace
          </p>
        </div>

        {/* Notes Content */}
        <NoteBoard />
      </section>
    </WorkspaceLayout>
  );
}
