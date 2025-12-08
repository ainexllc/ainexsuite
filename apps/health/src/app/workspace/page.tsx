'use client';

import { useState, useCallback, useEffect } from 'react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import type { HealthMetric } from '@ainexsuite/types';
import {
  getHealthMetrics,
  getHealthMetricByDate,
  createHealthMetric,
  updateHealthMetric,
  deleteHealthMetric,
  getTodayDate,
} from '@/lib/health-metrics';
import { HealthCheckinComposer } from '@/components/health-checkin-composer';
import { HealthEditModal } from '@/components/health-edit-modal';
import { HealthStats } from '@/components/health-stats';
import { HealthHistory } from '@/components/health-history';
import { HealthInsights } from '@/components/health-insights';
import { AIAssistant } from '@/components/ai-assistant';
import { FitIntegrationWidget } from '@/components/fit-integration-widget';
import { Activity, Calendar } from 'lucide-react';
import { WorkspaceLoadingScreen, WorkspacePageLayout } from '@ainexsuite/ui';

export default function HealthWorkspacePage() {
  const { user } = useWorkspaceAuth();
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayMetric, setTodayMetric] = useState<HealthMetric | null>(null);
  const [editingMetric, setEditingMetric] = useState<HealthMetric | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedMetrics, todayData] = await Promise.all([
        getHealthMetrics(),
        getHealthMetricByDate(getTodayDate()),
      ]);
      setMetrics(fetchedMetrics);
      setTodayMetric(todayData);
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      void loadData();
    }
  }, [user, loadData]);


  const handleSaveCheckin = async (data: Partial<HealthMetric>) => {
    try {
      if (todayMetric && data.date === getTodayDate()) {
        await updateHealthMetric(todayMetric.id, data);
      } else {
        await createHealthMetric({
          date: data.date || getTodayDate(),
          sleep: data.sleep ?? null,
          water: data.water ?? null,
          exercise: data.exercise ?? null,
          mood: data.mood ?? null,
          energy: data.energy ?? null,
          weight: data.weight ?? null,
          heartRate: data.heartRate ?? null,
          bloodPressure: data.bloodPressure ?? null,
          customMetrics: {},
          notes: data.notes || '',
        });
      }
      await loadData();
    } catch (error) {
      console.error('Failed to save check-in:', error);
    }
  };

  const handleEditMetric = async (data: Partial<HealthMetric>) => {
    if (!editingMetric) return;
    try {
      await updateHealthMetric(editingMetric.id, data);
      await loadData();
      setEditingMetric(null);
    } catch (error) {
      console.error('Failed to update check-in:', error);
    }
  };

  const handleDeleteMetric = async (id: string) => {
    try {
      await deleteHealthMetric(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete metric:', error);
    }
  };

  // Show standardized loading screen if internal data is loading
  if (loading) {
    return <WorkspaceLoadingScreen />;
  }

  if (!user) return null;

  return (
    <>
      <WorkspacePageLayout
        insightsBanner={<HealthInsights metrics={metrics} variant="sidebar" />}
        composer={
          <HealthCheckinComposer
            existingMetric={todayMetric}
            date={getTodayDate()}
            onSave={handleSaveCheckin}
          />
        }
      >
        {/* Today's Status Card */}
        {todayMetric && (
          <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 text-foreground">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-6 w-6" />
              <h2 className="text-lg font-semibold">Today&apos;s Check-in</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {todayMetric.weight && (
                <div>
                  <p className="text-foreground/70 text-sm">Weight</p>
                  <p className="text-xl font-bold">{todayMetric.weight} lbs</p>
                </div>
              )}
              {todayMetric.sleep && (
                <div>
                  <p className="text-foreground/70 text-sm">Sleep</p>
                  <p className="text-xl font-bold">{todayMetric.sleep} hrs</p>
                </div>
              )}
              {todayMetric.water && (
                <div>
                  <p className="text-foreground/70 text-sm">Water</p>
                  <p className="text-xl font-bold">{todayMetric.water} glasses</p>
                </div>
              )}
              {todayMetric.energy && (
                <div>
                  <p className="text-foreground/70 text-sm">Energy</p>
                  <p className="text-xl font-bold">{todayMetric.energy}/10</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!todayMetric && metrics.length === 0 && (
          <div className="text-center py-12 rounded-2xl bg-foreground/5 border border-border">
            <Activity className="h-16 w-16 mx-auto mb-4 text-primary/50" />
            <p className="text-foreground/70 mb-2">No health data yet</p>
            <p className="text-muted-foreground text-sm">
              Click above to start tracking your wellness journey
            </p>
          </div>
        )}

        {/* Stats and Integration - Side by Side on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HealthStats metrics={metrics} />
          <FitIntegrationWidget />
        </div>

        {/* Health History */}
        {metrics.length > 0 && (
          <HealthHistory
            metrics={metrics}
            onEdit={setEditingMetric}
            onDelete={handleDeleteMetric}
          />
        )}
      </WorkspacePageLayout>

      <AIAssistant />

      {/* Edit Modal */}
      {editingMetric && (
        <HealthEditModal
          metric={editingMetric}
          onSave={handleEditMetric}
          onClose={() => setEditingMetric(null)}
        />
      )}
    </>
  );
}