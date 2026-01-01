'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Pill,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Package,
  Calendar,
  ChevronRight,
  ChevronDown,
  Loader2,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MedicationEditor } from './MedicationEditor';
import { MedicationLogCard } from './MedicationLogCard';
import {
  getTodaySchedule,
  getMedicationSummary,
  getRefillAlerts,
  getMedications,
} from '@/lib/medication-service';
import type {
  TodayMedicationSchedule,
  MedicationSummary,
  RefillAlert,
  Medication,
} from '@ainexsuite/types';

export function MedicationDashboard() {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<TodayMedicationSchedule | null>(null);
  const [summary, setSummary] = useState<MedicationSummary | null>(null);
  const [refillAlerts, setRefillAlerts] = useState<RefillAlert[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);

  const [showEditor, setShowEditor] = useState(false);
  const [editingMedicationId, setEditingMedicationId] = useState<string | undefined>();
  const [showAllMeds, setShowAllMeds] = useState(false);
  const [showSchedule, setShowSchedule] = useState(true);
  const [showRefillAlerts, setShowRefillAlerts] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [scheduleData, summaryData, alertsData, medsData] = await Promise.all([
        getTodaySchedule(),
        getMedicationSummary(),
        getRefillAlerts(),
        getMedications(),
      ]);

      setSchedule(scheduleData);
      setSummary(summaryData);
      setRefillAlerts(alertsData);
      setMedications(medsData);
    } catch (error) {
      console.error('Failed to load medication data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = (medicationId: string) => {
    setEditingMedicationId(medicationId);
    setShowEditor(true);
  };

  const handleAdd = () => {
    setEditingMedicationId(undefined);
    setShowEditor(true);
  };

  const handleEditorClose = () => {
    setShowEditor(false);
    setEditingMedicationId(undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasMedications = medications.length > 0;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Pill className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink-900">Medications</h2>
            <p className="text-sm text-ink-500">
              {hasMedications
                ? `${summary?.activeCount || 0} active medications`
                : 'Track your medications and supplements'}
            </p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {!hasMedications ? (
        /* Empty State */
        <div className="bg-surface-elevated rounded-2xl border border-outline-subtle p-8 text-center">
          <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Pill className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-ink-900 mb-2">
            No Medications Yet
          </h3>
          <p className="text-sm text-ink-500 mb-6 max-w-sm mx-auto">
            Track your prescriptions, vitamins, and supplements. Get reminders and
            never miss a dose.
          </p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Your First Medication
          </button>
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <div className="bg-surface-elevated rounded-xl border border-outline-subtle p-3 md:p-4">
              <div className="flex items-center gap-2 mb-1 md:mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-ink-500">Today</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-ink-900">
                {summary?.completedToday || 0}/{summary?.todayDoses || 0}
              </p>
              <p className="text-xs text-ink-500">doses taken</p>
            </div>

            <div className="bg-surface-elevated rounded-xl border border-outline-subtle p-3 md:p-4">
              <div className="flex items-center gap-2 mb-1 md:mb-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-ink-500">7-Day</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-ink-900">
                {Math.round((summary?.adherenceRate7Day || 0) * 100)}%
              </p>
              <p className="text-xs text-ink-500">adherence</p>
            </div>

            <div className="bg-surface-elevated rounded-xl border border-outline-subtle p-3 md:p-4">
              <div className="flex items-center gap-2 mb-1 md:mb-2">
                <Pill className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-ink-500">Active</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-ink-900">
                {summary?.activeCount || 0}
              </p>
              <p className="text-xs text-ink-500">medications</p>
            </div>

            <div className="bg-surface-elevated rounded-xl border border-outline-subtle p-3 md:p-4">
              <div className="flex items-center gap-2 mb-1 md:mb-2">
                <Package className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-ink-500">Refills</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-ink-900">
                {refillAlerts.length}
              </p>
              <p className="text-xs text-ink-500">needed soon</p>
            </div>
          </div>

          {/* Refill Alerts */}
          {refillAlerts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowRefillAlerts(!showRefillAlerts)}
                className="w-full px-3 md:px-4 py-3 flex items-center justify-between hover:bg-amber-100/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-amber-900">Refill Needed</h3>
                  <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full">
                    {refillAlerts.length}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-amber-600 transition-transform duration-200',
                    showRefillAlerts ? 'rotate-0' : '-rotate-90'
                  )}
                />
              </button>
              {showRefillAlerts && (
                <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-2">
                  {refillAlerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.medication.id}
                      className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💊</span>
                        <span className="font-medium text-amber-900">
                          {alert.medication.name}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                          alert.urgency === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : alert.urgency === 'high'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {alert.daysRemaining} day{alert.daysRemaining !== 1 ? 's' : ''} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Today's Schedule */}
          <div className="bg-surface-elevated rounded-2xl border border-outline-subtle overflow-hidden">
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="w-full px-3 md:px-4 py-3 flex items-center justify-between hover:bg-ink-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-ink-500" />
                <h3 className="font-semibold text-ink-900">Today&apos;s Schedule</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-500">
                  {schedule?.completedCount || 0} of {schedule?.totalCount || 0} complete
                </span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-ink-400 transition-transform duration-200',
                    showSchedule ? 'rotate-0' : '-rotate-90'
                  )}
                />
              </div>
            </button>

            {showSchedule && (
              <>
                {schedule && schedule.doses.length > 0 ? (
                  <div className="p-3 md:p-4 space-y-2 md:space-y-3 border-t border-outline-subtle">
                    {schedule.doses.map((dose, index) => (
                      <MedicationLogCard
                        key={`${dose.medication.id}-${dose.scheduledTime}-${index}`}
                        dose={dose}
                        onUpdate={loadData}
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-6 md:p-8 text-center border-t border-outline-subtle">
                    <Clock className="h-10 w-10 text-ink-300 mx-auto mb-3" />
                    <p className="text-ink-500">No doses scheduled for today</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* All Medications */}
          <div className="bg-surface-elevated rounded-2xl border border-outline-subtle overflow-hidden">
            <button
              onClick={() => setShowAllMeds(!showAllMeds)}
              className="w-full px-3 md:px-4 py-3 flex items-center justify-between hover:bg-ink-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-ink-500" />
                <h3 className="font-semibold text-ink-900">All Medications</h3>
              </div>
              <ChevronDown
                className={cn(
                  'h-5 w-5 text-ink-400 transition-transform duration-200',
                  showAllMeds ? 'rotate-0' : '-rotate-90'
                )}
              />
            </button>

            {showAllMeds && (
              <div className="border-t border-outline-subtle">
                {medications.map((med) => (
                  <button
                    key={med.id}
                    onClick={() => handleEdit(med.id)}
                    className="w-full px-3 md:px-4 py-3 flex items-center gap-3 hover:bg-ink-50 transition-colors border-b border-outline-subtle last:border-b-0"
                  >
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${med.color || '#ef4444'}15` }}
                    >
                      <span className="text-xl">💊</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-ink-900">{med.name}</p>
                      <p className="text-sm text-ink-500">
                        {med.dosage} • {med.schedule.times.length}x daily
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!med.isActive && (
                        <span className="text-xs text-ink-400 bg-ink-100 px-2 py-0.5 rounded">
                          Inactive
                        </span>
                      )}
                      <ChevronRight className="h-5 w-5 text-ink-300" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Medication Editor Modal */}
      <MedicationEditor
        isOpen={showEditor}
        onClose={handleEditorClose}
        editMedicationId={editingMedicationId}
        onSave={loadData}
      />
    </div>
  );
}
