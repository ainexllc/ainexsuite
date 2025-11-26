'use client';

import { useEffect, useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Settings } from 'lucide-react';
import { useSmartHubStore } from '@/lib/store';
import { DeviceGrid } from '@/components/devices/device-grid';
import { RoomSelector } from '@/components/devices/room-selector';
import { SmartHubInsights } from '@/components/insights/smarthub-insights';
import { IntegrationsModal } from '@/components/integrations-modal';

function SmartHubWorkspaceContent() {
  const { user, loading: authLoading, bootstrapStatus } = useAuth();
  const { loadDevices, isLoading: devicesLoading, setIntegrationsModalOpen } = useSmartHubStore();
  const router = useRouter();

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

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
  if (authLoading || bootstrapStatus === 'running') {
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
      <div className="max-w-7xl mx-auto">
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start xl:gap-8">
          
          {/* Main Content */}
          <div className="space-y-8">
            {/* Header & Controls */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 overflow-hidden">
                <RoomSelector />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button 
                  onClick={() => setIntegrationsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Integrations
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-sm font-medium transition-colors">
                  <Plus className="h-4 w-4" />
                  Add Device
                </button>
              </div>
            </div>

            {/* Device Grid */}
            <DeviceGrid />
          </div>

          {/* Sidebar */}
          <div className="hidden xl:flex flex-col gap-6 sticky top-28">
            <SmartHubInsights variant="sidebar" />
            
            {/* Quick Actions / Scenes (Placeholder) */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-4">Quick Scenes</h3>
              <div className="space-y-2">
                {['Good Morning', 'Movie Night', 'Leaving Home'].map(scene => (
                  <button key={scene} className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white/80 transition-colors">
                    {scene}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
      <IntegrationsModal />
    </WorkspaceLayout>
  );
}

export default function SmartHubWorkspacePage() {
  return (
    // @ts-expect-error - AppName type needs update in auth package
    <SuiteGuard appName="smarthub">
      <SmartHubWorkspaceContent />
    </SuiteGuard>
  );
}
