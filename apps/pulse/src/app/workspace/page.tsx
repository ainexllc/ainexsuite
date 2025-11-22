'use client';

import { useEffect, useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { useRouter } from 'next/navigation';
import { DigitalClock } from '@/components/digital-clock';
import { Loader2 } from 'lucide-react';

function PulseWorkspaceContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  // Loading state to prevent flash of content
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load or wait for user
    if (user) {
      setLoading(false);
    } else if (!authLoading && !user) {
      // If auth is done and no user, let the guard or router handle it
      setLoading(false);
    }
  }, [user, authLoading]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { auth } = await import('@ainexsuite/firebase');
      const firebaseAuth = await import('firebase/auth');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (firebaseAuth as any).signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  if (authLoading || loading) {
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
      searchPlaceholder="Search health data..."
      appName="Pulse"
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">
          My Pulse
        </h1>

        <DigitalClock />
      </div>
    </WorkspaceLayout>
  );
}

export default function PulseWorkspacePage() {
  return (
    <SuiteGuard appName="pulse">
      <PulseWorkspaceContent />
    </SuiteGuard>
  );
}
