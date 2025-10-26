'use client';

import { useEffect, useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import type { HealthMetric } from '@ainexsuite/types';
import { TopNav } from '@/components/top-nav';
import { MetricEntry } from '@/components/metric-entry';
import { HealthChart } from '@/components/health-chart';
import { AIAssistant } from '@/components/ai-assistant';
import { getHealthMetrics } from '@/lib/health';
import { Activity } from 'lucide-react';

function PulseWorkspaceContent() {
  const { user, loading: authLoading } = useAuth();
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

  const handleUpdate = async () => {
    if (!user) return;
    const data = await getHealthMetrics(30);
    setMetrics(data);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-ink-600">Loading health metrics...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Activity className="h-16 w-16 text-ink-600 mx-auto" />
          <p className="text-ink-600">Please sign in to track your health metrics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <HealthChart metrics={metrics} />
          </div>
          <div>
            <MetricEntry onUpdate={handleUpdate} existingMetrics={metrics} />
          </div>
        </div>
      </main>

      <AIAssistant />
    </div>
  );
}

export default function PulseWorkspacePage() {
  return (
    <SuiteGuard appName="pulse">
      <PulseWorkspaceContent />
    </SuiteGuard>
  );
}

