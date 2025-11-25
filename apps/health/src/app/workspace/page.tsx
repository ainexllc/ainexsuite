'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { useRouter } from 'next/navigation';
import type { HealthMetric } from '@ainexsuite/types';
import {
  getHealthMetrics,
  getHealthMetricByDate,
  createHealthMetric,
  updateHealthMetric,
  deleteHealthMetric,
  getTodayDate,
} from '@/lib/health-metrics';
import { HealthCheckinForm } from '@/components/health-checkin-form';
import { HealthStats } from '@/components/health-stats';
import { HealthHistory } from '@/components/health-history';
import { AIAssistant } from '@/components/ai-assistant';
import { FitIntegrationWidget } from '@/components/fit-integration-widget';
import { Plus, Activity, Loader2, Calendar } from 'lucide-react';

function HealthWorkspaceContent() {
  const { user, loading: authLoading, bootstrapStatus } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayMetric, setTodayMetric] = useState<HealthMetric | null>(null);
  const [showCheckinForm, setShowCheckinForm] = useState(false);
  const [editingMetric, setEditingMetric] = useState<HealthMetric | null>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

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

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { auth } = await import('@ainexsuite/firebase');
      const firebaseAuth = await import('firebase/auth');
      await firebaseAuth.signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSaveCheckin = async (data: Partial<HealthMetric>) => {
    try {
      if (editingMetric) {
        await updateHealthMetric(editingMetric.id, data);
      } else if (todayMetric && data.date === getTodayDate()) {
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
      setShowCheckinForm(false);
      setEditingMetric(null);
    } catch (error) {
      console.error('Failed to save check-in:', error);
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

  // Show loading while authenticating or bootstrapping
  if (authLoading || loading || bootstrapStatus === 'running') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
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
      appName="Health"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header with Quick Check-in */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-ink-900">Health Dashboard</h1>
                <p className="text-ink-500 mt-1">Track your wellness journey</p>
              </div>
              <button
                onClick={() => {
                  setSelectedDate(getTodayDate());
                  setEditingMetric(null);
                  setShowCheckinForm(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20"
                type="button"
              >
                <Plus className="h-5 w-5" />
                {todayMetric ? 'Update Today' : 'Check-in Today'}
              </button>
            </div>

            {/* Today's Status Card */}
            {todayMetric && (
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="h-6 w-6" />
                  <h2 className="text-lg font-semibold">Today&apos;s Check-in Complete</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {todayMetric.weight && (
                    <div>
                      <p className="text-white/70 text-sm">Weight</p>
                      <p className="text-xl font-bold">{todayMetric.weight} lbs</p>
                    </div>
                  )}
                  {todayMetric.sleep && (
                    <div>
                      <p className="text-white/70 text-sm">Sleep</p>
                      <p className="text-xl font-bold">{todayMetric.sleep} hrs</p>
                    </div>
                  )}
                  {todayMetric.water && (
                    <div>
                      <p className="text-white/70 text-sm">Water</p>
                      <p className="text-xl font-bold">{todayMetric.water} glasses</p>
                    </div>
                  )}
                  {todayMetric.energy && (
                    <div>
                      <p className="text-white/70 text-sm">Energy</p>
                      <p className="text-xl font-bold">{todayMetric.energy}/10</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!todayMetric && metrics.length === 0 && (
              <div className="text-center py-12 rounded-2xl bg-surface-elevated border border-outline-subtle">
                <Activity className="h-16 w-16 mx-auto mb-4 text-emerald-500/50" />
                <p className="text-ink-600 mb-2">No health data yet</p>
                <p className="text-ink-400 text-sm mb-4">
                  Start tracking your weight, sleep, hydration, and more
                </p>
                <button
                  onClick={() => setShowCheckinForm(true)}
                  className="text-emerald-500 hover:text-emerald-600 font-medium"
                  type="button"
                >
                  Create your first check-in
                </button>
              </div>
            )}

            {/* Health History */}
            {metrics.length > 0 && (
              <HealthHistory
                metrics={metrics}
                onEdit={(metric) => {
                  setEditingMetric(metric);
                  setSelectedDate(metric.date);
                  setShowCheckinForm(true);
                }}
                onDelete={handleDeleteMetric}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <HealthStats metrics={metrics} />
            <FitIntegrationWidget />
          </div>
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckinForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-elevated rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <HealthCheckinForm
              existingMetric={editingMetric || (selectedDate === getTodayDate() ? todayMetric : null)}
              date={selectedDate}
              onSave={handleSaveCheckin}
              onClose={() => {
                setShowCheckinForm(false);
                setEditingMetric(null);
              }}
            />
          </div>
        </div>
      )}

      <AIAssistant />
    </WorkspaceLayout>
  );
}

export default function HealthWorkspacePage() {
  return (
    <SuiteGuard appName="health">
      <HealthWorkspaceContent />
    </SuiteGuard>
  );
}
