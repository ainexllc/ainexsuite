'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { Loader2 } from 'lucide-react';
import { WorkflowCanvas } from '@/components/workflow-canvas/WorkflowCanvas';

export default function WorkspacePage() {
  const { user, loading } = useAuth();
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
      console.error('Sign out failed:', error);
    }
  };

  if (loading) {
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
      searchPlaceholder="Search workflows..."
      appName="Workflow"
    >
      {/* Welcome and Workflow Canvas Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">
            Welcome to Workflow, {user.displayName ? user.displayName.split(' ')[0] : 'there'}!
          </h2>
          <p className="text-lg text-text-muted">
            Your workflow design workspace
          </p>
        </div>

        {/* Workflow Canvas */}
        <div className="h-[calc(100vh-200px)] min-h-[600px] rounded-xl border border-outline-subtle bg-surface-elevated/50 backdrop-blur overflow-hidden relative shadow-inner">
          <WorkflowCanvas />
        </div>
      </section>
    </WorkspaceLayout>
  );
}