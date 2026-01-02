'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, AlertCircle, FileText, Calendar, Clock } from 'lucide-react';
import { Modal } from '@ainexsuite/ui';
import { useAuth } from '@ainexsuite/auth';
import type { SymptomEntry, LabResult, Appointment, SymptomPattern, MedicalTimelineEvent } from '@ainexsuite/types';
import { SymptomCard } from './SymptomCard';
import { SymptomLogger } from './SymptomLogger';
import { SymptomPatterns } from './SymptomPatterns';
import { LabResultCard } from './LabResultCard';
import { LabResultEditor } from './LabResultEditor';
import { AppointmentCard } from './AppointmentCard';
import { AppointmentEditor } from './AppointmentEditor';
import { MedicalTimeline } from './MedicalTimeline';
import {
  getSymptomsByDateRange,
  createSymptom,
  deleteSymptom,
  getSymptomPatterns,
  getLabResults,
  createLabResult,
  deleteLabResult,
  getUpcomingAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getMedicalTimeline,
} from '@/lib/medical-service';

type TabView = 'overview' | 'symptoms' | 'labs' | 'appointments' | 'timeline';

export function MedicalDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabView>('overview');
  const [loading, setLoading] = useState(true);

  // Data
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [patterns, setPatterns] = useState<SymptomPattern[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timeline, setTimeline] = useState<MedicalTimelineEvent[]>([]);

  // Modals
  const [showSymptomLogger, setShowSymptomLogger] = useState(false);
  const [showLabEditor, setShowLabEditor] = useState(false);
  const [showAppointmentEditor, setShowAppointmentEditor] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState<SymptomEntry | null>(null);
  const [editingLab, setEditingLab] = useState<LabResult | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [symptomsData, patternsData, labsData, appointmentsData, timelineData] = await Promise.all([
        getSymptomsByDateRange(thirtyDaysAgo.toISOString().split('T')[0], new Date().toISOString().split('T')[0]),
        getSymptomPatterns(),
        getLabResults(),
        getUpcomingAppointments(),
        getMedicalTimeline(),
      ]);

      setSymptoms(symptomsData);
      setPatterns(patternsData);
      setLabResults(labsData);
      setAppointments(appointmentsData);
      setTimeline(timelineData);
    } catch (error) {
      console.error('Failed to load medical data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Symptom handlers
  const handleSaveSymptom = async (data: Omit<SymptomEntry, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.uid) return;
    await createSymptom(data);
    setShowSymptomLogger(false);
    setEditingSymptom(null);
    loadData();
  };

  const handleDeleteSymptom = async (id: string) => {
    if (!user?.uid) return;
    await deleteSymptom(id);
    loadData();
  };

  // Lab handlers
  const handleSaveLab = async (data: Omit<LabResult, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.uid) return;
    await createLabResult(data);
    setShowLabEditor(false);
    setEditingLab(null);
    loadData();
  };

  const handleDeleteLab = async (id: string) => {
    if (!user?.uid) return;
    await deleteLabResult(id);
    loadData();
  };

  // Appointment handlers
  const handleSaveAppointment = async (data: Omit<Appointment, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.uid) return;
    if (editingAppointment) {
      await updateAppointment(editingAppointment.id, data);
    } else {
      await createAppointment(data);
    }
    setShowAppointmentEditor(false);
    setEditingAppointment(null);
    loadData();
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!user?.uid) return;
    await deleteAppointment(id);
    loadData();
  };

  const handleAppointmentStatusChange = async (id: string, status: Appointment['status']) => {
    if (!user?.uid) return;
    await updateAppointment(id, { status });
    loadData();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Clock },
    { id: 'symptoms', label: 'Symptoms', icon: AlertCircle },
    { id: 'labs', label: 'Lab Results', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink-900">Medical Tracking</h2>
          <p className="text-sm text-ink-500">Track symptoms, lab results, and appointments</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabView)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-surface-elevated text-ink-600 hover:bg-surface-subtle'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Symptoms */}
          <div className="p-4 bg-surface-elevated border border-outline-subtle rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink-900">Recent Symptoms</h3>
              <button
                onClick={() => setShowSymptomLogger(true)}
                className="text-emerald-600 hover:text-emerald-700"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {symptoms.slice(0, 3).length > 0 ? (
              <div className="space-y-2">
                {symptoms.slice(0, 3).map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span className="text-ink-700">{s.symptom}</span>
                    <span className="text-ink-400">{s.severity}/5</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-500">No recent symptoms</p>
            )}
          </div>

          {/* Upcoming Appointments */}
          <div className="p-4 bg-surface-elevated border border-outline-subtle rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink-900">Upcoming Appointments</h3>
              <button
                onClick={() => setShowAppointmentEditor(true)}
                className="text-emerald-600 hover:text-emerald-700"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {appointments.filter(a => a.status === 'scheduled').slice(0, 3).length > 0 ? (
              <div className="space-y-2">
                {appointments.filter(a => a.status === 'scheduled').slice(0, 3).map((a) => (
                  <div key={a.id} className="text-sm">
                    <div className="font-medium text-ink-700">{a.reason}</div>
                    <div className="text-ink-400">{new Date(a.date).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-500">No upcoming appointments</p>
            )}
          </div>

          {/* Recent Labs */}
          <div className="p-4 bg-surface-elevated border border-outline-subtle rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink-900">Recent Lab Results</h3>
              <button
                onClick={() => setShowLabEditor(true)}
                className="text-emerald-600 hover:text-emerald-700"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {labResults.slice(0, 3).length > 0 ? (
              <div className="space-y-2">
                {labResults.slice(0, 3).map((lab) => (
                  <div key={lab.id} className="text-sm">
                    <div className="font-medium text-ink-700">{lab.testName}</div>
                    <div className="text-ink-400">{new Date(lab.date).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-500">No lab results</p>
            )}
          </div>

          {/* Symptom Patterns */}
          <div className="md:col-span-2 lg:col-span-3">
            <SymptomPatterns patterns={patterns} />
          </div>
        </div>
      )}

      {/* Symptoms Tab */}
      {activeTab === 'symptoms' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowSymptomLogger(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Log Symptom
            </button>
          </div>
          {symptoms.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {symptoms.map((symptom) => (
                <SymptomCard
                  key={symptom.id}
                  symptom={symptom}
                  onEdit={(s) => {
                    setEditingSymptom(s);
                    setShowSymptomLogger(true);
                  }}
                  onDelete={handleDeleteSymptom}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-ink-300 mx-auto mb-4" />
              <p className="text-ink-500">No symptoms logged yet</p>
            </div>
          )}
        </div>
      )}

      {/* Labs Tab */}
      {activeTab === 'labs' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowLabEditor(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Lab Result
            </button>
          </div>
          {labResults.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {labResults.map((lab) => (
                <LabResultCard
                  key={lab.id}
                  result={lab}
                  onEdit={(l) => {
                    setEditingLab(l);
                    setShowLabEditor(true);
                  }}
                  onDelete={handleDeleteLab}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-ink-300 mx-auto mb-4" />
              <p className="text-ink-500">No lab results recorded</p>
            </div>
          )}
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAppointmentEditor(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Appointment
            </button>
          </div>
          {appointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onEdit={(a) => {
                    setEditingAppointment(a);
                    setShowAppointmentEditor(true);
                  }}
                  onDelete={handleDeleteAppointment}
                  onStatusChange={handleAppointmentStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-ink-300 mx-auto mb-4" />
              <p className="text-ink-500">No appointments scheduled</p>
            </div>
          )}
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="p-4 bg-surface-elevated border border-outline-subtle rounded-xl">
          <MedicalTimeline items={timeline} />
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={showSymptomLogger}
        onClose={() => {
          setShowSymptomLogger(false);
          setEditingSymptom(null);
        }}
      >
        <h2 className="text-xl font-bold text-ink-900 mb-4">{editingSymptom ? 'Edit Symptom' : 'Log Symptom'}</h2>
        <SymptomLogger
          initialSymptom={editingSymptom || undefined}
          onSave={handleSaveSymptom}
          onCancel={() => {
            setShowSymptomLogger(false);
            setEditingSymptom(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={showLabEditor}
        onClose={() => {
          setShowLabEditor(false);
          setEditingLab(null);
        }}
      >
        <h2 className="text-xl font-bold text-ink-900 mb-4">{editingLab ? 'Edit Lab Result' : 'Add Lab Result'}</h2>
        <LabResultEditor
          initialResult={editingLab || undefined}
          onSave={handleSaveLab}
          onCancel={() => {
            setShowLabEditor(false);
            setEditingLab(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={showAppointmentEditor}
        onClose={() => {
          setShowAppointmentEditor(false);
          setEditingAppointment(null);
        }}
      >
        <h2 className="text-xl font-bold text-ink-900 mb-4">{editingAppointment ? 'Edit Appointment' : 'Add Appointment'}</h2>
        <AppointmentEditor
          initialAppointment={editingAppointment || undefined}
          onSave={handleSaveAppointment}
          onCancel={() => {
            setShowAppointmentEditor(false);
            setEditingAppointment(null);
          }}
        />
      </Modal>
    </div>
  );
}
