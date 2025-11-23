'use client';

import { useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { DashboardEngine } from '@/components/dashboard-v2/dashboard-engine';
import { Loader2 } from 'lucide-react';

function PulseV2Content() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={async () => {}} // Mock signout for preview
      appName="Pulse V2 (Mockup)"
    >
      <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)]">
        <DashboardEngine user={user} />
      </div>
    </WorkspaceLayout>
  );
}

export default function PulseV2Page() {
  return (
    <SuiteGuard appName="pulse">
      <PulseV2Content />
    </SuiteGuard>
  );
}
