'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { Loader2, LayoutGrid, ArrowLeft } from 'lucide-react';
import { ProjectsBoard } from '@/components/projects-board';
import { ProjectDashboard } from '@/components/project-dashboard';

export default function WorkspacePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'dashboard' | 'whiteboard'>('dashboard');

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
      console.error('Error signing out:', error);
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
      searchPlaceholder="Search projects..."
      appName="Projects"
    >
      {/* Welcome and Dashboard Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-text-primary mb-2">
              {viewMode === 'dashboard' 
                ? `Welcome to Projects, ${user.displayName ? user.displayName.split(' ')[0] : 'there'}!`
                : 'Planning Whiteboard'
              }
            </h2>
            <p className="text-lg text-text-muted">
              {viewMode === 'dashboard'
                ? 'Your project workspace'
                : 'Brainstorm and map out your ideas'
              }
            </p>
          </div>
          
          {/* View Toggle Button */}
          {viewMode === 'whiteboard' ? (
            <button
              onClick={() => setViewMode('dashboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-elevated border border-white/10 hover:bg-surface-hover transition-colors text-sm font-medium text-text-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          ) : (
            <button
              onClick={() => setViewMode('whiteboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm font-medium"
            >
              <LayoutGrid className="h-4 w-4" />
              Open Whiteboard
            </button>
          )}
        </div>

        {/* Content */}
        <div className="min-h-[600px]">
          {viewMode === 'whiteboard' ? (
            <div className="h-[calc(100vh-200px)] w-full">
              <ProjectsBoard />
            </div>
          ) : (
            <ProjectDashboard onOpenWhiteboard={() => setViewMode('whiteboard')} />
          )}
        </div>
      </section>
    </WorkspaceLayout>
  );
}