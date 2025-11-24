'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { Loader2 } from 'lucide-react';

export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, bootstrapStatus } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  // Wait for bootstrap to complete before redirecting to prevent interrupting auto-login
  useEffect(() => {
    if (!loading && !user && bootstrapStatus !== 'running') {
      router.push('/');
    }
  }, [user, loading, bootstrapStatus, router]);

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

  // Show loading while authenticating or bootstrapping
  if (loading || bootstrapStatus === 'running') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
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
      searchPlaceholder="Search journal entries..."
      appName="Journey"
    >
      {children}
    </WorkspaceLayout>
  );
}
