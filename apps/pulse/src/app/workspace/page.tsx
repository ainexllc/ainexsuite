'use client';

import { useEffect, useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { useRouter } from 'next/navigation';
import type { HealthMetric } from '@ainexsuite/types';
import { MetricEntry } from '@/components/metric-entry';
import { HealthChart } from '@/components/health-chart';
import { AIAssistant } from '@/components/ai-assistant';
import { getHealthMetrics } from '@/lib/health';
import { Activity, Loader2 } from 'lucide-react';

function PulseWorkspaceContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadMetrics = async () => {
      setLoading(true);
      try {
        const data = await getHealthMetrics(30);
        setMetrics(data);
      } catch (error) {
        console.error('Failed to load metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadMetrics();
  }, [user]);

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

  const handleUpdate = async () => {
    if (!user) return;
    const data = await getHealthMetrics(30);
    setMetrics(data);
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
          Health Overview
        </h1>

        {metrics.length === 0 ? (
          <div className="grid gap-6 lg:grid-cols-3">
             <div className="lg:col-span-2 flex flex-col items-center justify-center p-12 bg-surface-elevated rounded-2xl border border-outline-subtle">
                <Activity className="h-16 w-16 text-text-muted mb-4" />
                <p className="text-text-muted">No health metrics recorded yet.</p>
             </div>
             <div>
                <MetricEntry onUpdate={handleUpdate} existingMetrics={metrics} />
             </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <HealthChart metrics={metrics} />
            </div>
            <div>
              <MetricEntry onUpdate={handleUpdate} existingMetrics={metrics} />
            </div>
          </div>
        )}
      </div>

      <AIAssistant />
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