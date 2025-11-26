'use client';

import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { useRouter } from 'next/navigation';
import { Loader2, Cpu } from 'lucide-react';

function SmartHubWorkspaceContent() {
  const { user, loading, bootstrapStatus } = useAuth();
  const router = useRouter();

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

  // Show loading while authenticating or bootstrapping
  if (loading || bootstrapStatus === 'running') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={handleSignOut}
      searchPlaceholder="Search devices..."
      appName="Smart"
      appColor="#0ea5e9"
    >
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-sky-500/10 mb-6">
          <Cpu className="h-10 w-10 text-sky-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Smart Coming Soon</h1>
        <p className="text-white/50 max-w-lg mx-auto text-lg leading-relaxed">
          We are building the ultimate command center for your smart home. 
          Google Home integration, automation routines, and real-time device monitoring will be available here shortly.
        </p>
      </div>
    </WorkspaceLayout>
  );
}

export default function SmartHubWorkspacePage() {
  return (
    // @ts-expect-error - AppName type needs update
    <SuiteGuard appName="smarthub">
      <SmartHubWorkspaceContent />
    </SuiteGuard>
  );
}