'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Pill,
  Clock,
  Package,
  Bell,
  ChevronDown,
  Link2,
} from 'lucide-react';
import { Modal } from '@ainexsuite/ui';
import {
  createMedication,
  updateMedication,
  getMedicationById,
} from '@/lib/medication-service';
import type {
  MedicationType,
  DoseFrequency,
  DoseTime,
  MedicationSchedule,
} from '@ainexsuite/types';

interface MedicationEditorProps {
  isOpen: boolean;
  onClose: () => void;
  editMedicationId?: string;
  onSave?: () => void;
}

const MEDICATION_TYPES: { value: MedicationType; label: string; icon: string }[] = [
  { value: 'prescription', label: 'Prescription', icon: '💊' },
  { value: 'otc', label: 'Over-the-Counter', icon: '🏪' },
  { value: 'supplement', label: 'Supplement', icon: '🌿' },
  { value: 'vitamin', label: 'Vitamin', icon: '🍊' },
];

const FREQUENCY_OPTIONS: { value: DoseFrequency; label: string }[] = [
  { value: 'once_daily', label: 'Once daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'three_times_daily', label: '3 times daily' },
  { value: 'four_times_daily', label: '4 times daily' },
  { value: 'every_other_day', label: 'Every other day' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'as_needed', label: 'As needed' },
];

const DOSE_TIMES: { value: DoseTime; label: string; time: string }[] = [
  { value: 'morning', label: 'Morning', time: '8:00 AM' },
  { value: 'afternoon', label: 'Afternoon', time: '12:00 PM' },
  { value: 'evening', label: 'Evening', time: '6:00 PM' },
  { value: 'night', label: 'Night', time: '9:00 PM' },
  { value: 'with_food', label: 'With Food', time: 'With meals' },
  { value: 'before_bed', label: 'Before Bed', time: '10:00 PM' },
];

const MEDICATION_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
];

export function MedicationEditor({
  isOpen,
  onClose,
  editMedicationId,
  onSave,
}: MedicationEditorProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<MedicationType>('prescription');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<DoseFrequency>('once_daily');
  const [times, setTimes] = useState<DoseTime[]>(['morning']);
  const [instructions, setInstructions] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState(MEDICATION_COLORS[0]);

  // Refill tracking
  const [trackRefill, setTrackRefill] = useState(false);
  const [currentSupply, setCurrentSupply] = useState<number>(30);
  const [refillAt, setRefillAt] = useState<number>(7);

  // Habits integration
  const [createLinkedHabit, setCreateLinkedHabit] = useState(true);

  // Reminders
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Request notification permission when reminders are enabled
  async function requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notifications not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  // Handle reminder toggle with permission request
  async function handleReminderToggle(enabled: boolean) {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        // Still allow enabling reminders, but show a note
        console.warn('Notifications not permitted, reminders will only work in-app');
      }
    }
    setReminderEnabled(enabled);
  }

  // Schedule medication reminders
  function scheduleMedicationReminders(
    medicationId: string,
    medicationName: string,
    dosage: string,
    reminderTimes: DoseTime[]
  ) {
    if (typeof window === 'undefined') return;

    // Get time for each dose time
    const timeMap: Record<DoseTime, { hour: number; minute: number }> = {
      morning: { hour: 8, minute: 0 },
      afternoon: { hour: 12, minute: 0 },
      evening: { hour: 18, minute: 0 },
      night: { hour: 21, minute: 0 },
      with_food: { hour: 12, minute: 30 },
      before_bed: { hour: 22, minute: 0 },
    };

    // Store reminder schedule in localStorage as backup
    const reminderSchedule = {
      medicationId,
      medicationName,
      dosage,
      times: reminderTimes.map((time) => ({
        doseTime: time,
        ...timeMap[time],
      })),
      createdAt: new Date().toISOString(),
    };

    // Get existing schedules
    const existingSchedules = JSON.parse(
      localStorage.getItem('medication-reminders') || '[]'
    ) as Array<typeof reminderSchedule>;

    // Remove existing schedule for this medication
    const updatedSchedules = existingSchedules.filter(
      (s) => s.medicationId !== medicationId
    );

    // Add new schedule
    updatedSchedules.push(reminderSchedule);
    localStorage.setItem('medication-reminders', JSON.stringify(updatedSchedules));

    // Schedule browser notifications for today
    if (Notification.permission === 'granted') {
      const now = new Date();
      reminderTimes.forEach((doseTime) => {
        const { hour, minute } = timeMap[doseTime];
        const reminderDate = new Date();
        reminderDate.setHours(hour, minute, 0, 0);

        // Only schedule if the time is in the future today
        if (reminderDate > now) {
          const delay = reminderDate.getTime() - now.getTime();

          // Use setTimeout for same-day notifications (clears on page refresh)
          setTimeout(() => {
            showMedicationNotification(medicationName, dosage, doseTime);
          }, delay);
        }
      });
    }
  }

  // Show a medication reminder notification
  function showMedicationNotification(
    medicationName: string,
    dosage: string,
    doseTime: DoseTime
  ) {
    if (typeof window === 'undefined' || Notification.permission !== 'granted') {
      return;
    }

    const timeLabels: Record<DoseTime, string> = {
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
      night: 'Night',
      with_food: 'Mealtime',
      before_bed: 'Bedtime',
    };

    new Notification(`Time for ${medicationName}`, {
      body: `Take ${dosage} - ${timeLabels[doseTime]} dose`,
      icon: '/icons/pill-icon.png',
      tag: `medication-${medicationName}-${doseTime}`,
      requireInteraction: true,
    });
  }

  // Load existing medication for editing
  useEffect(() => {
    if (isOpen && editMedicationId) {
      loadMedication(editMedicationId);
    } else if (isOpen) {
      resetForm();
    }
  }, [isOpen, editMedicationId]);

  async function loadMedication(id: string) {
    setLoading(true);
    try {
      const medication = await getMedicationById(id);
      if (medication) {
        setName(medication.name);
        setType(medication.type);
        setDosage(medication.dosage);
        setFrequency(medication.schedule.frequency);
        setTimes(medication.schedule.times);
        setInstructions(medication.schedule.instructions || '');
        setNotes(medication.notes || '');
        setColor(medication.color || MEDICATION_COLORS[0]);
        setTrackRefill(!!medication.refill);
        if (medication.refill) {
          setCurrentSupply(medication.refill.currentSupply);
          setRefillAt(medication.refill.refillAt);
        }
        setCreateLinkedHabit(medication.createLinkedHabit);
        setReminderEnabled(medication.reminderEnabled);
      }
    } catch (error) {
      console.error('Failed to load medication:', error);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setName('');
    setType('prescription');
    setDosage('');
    setFrequency('once_daily');
    setTimes(['morning']);
    setInstructions('');
    setNotes('');
    setColor(MEDICATION_COLORS[0]);
    setTrackRefill(false);
    setCurrentSupply(30);
    setRefillAt(7);
    setCreateLinkedHabit(true);
    setReminderEnabled(true);
  }

  // Update times based on frequency
  useEffect(() => {
    switch (frequency) {
      case 'once_daily':
        if (times.length !== 1) setTimes(['morning']);
        break;
      case 'twice_daily':
        if (times.length !== 2) setTimes(['morning', 'evening']);
        break;
      case 'three_times_daily':
        if (times.length !== 3) setTimes(['morning', 'afternoon', 'evening']);
        break;
      case 'four_times_daily':
        if (times.length !== 4) setTimes(['morning', 'afternoon', 'evening', 'night']);
        break;
      case 'as_needed':
        setTimes([]);
        break;
    }
  }, [frequency, times.length]);

  function toggleTime(time: DoseTime) {
    if (times.includes(time)) {
      setTimes(times.filter((t) => t !== time));
    } else {
      setTimes([...times, time]);
    }
  }

  async function handleSave() {
    if (!name.trim() || !dosage.trim()) return;

    setSaving(true);
    try {
      const schedule: MedicationSchedule = {
        frequency,
        times,
        instructions: instructions.trim() || undefined,
      };

      const medicationData = {
        name: name.trim(),
        type,
        dosage: dosage.trim(),
        schedule,
        refill: trackRefill
          ? { currentSupply, refillAt }
          : undefined,
        createLinkedHabit,
        reminderEnabled,
        color,
        notes: notes.trim() || undefined,
        isActive: true,
      };

      let savedMedicationId: string;
      if (editMedicationId) {
        await updateMedication(editMedicationId, medicationData);
        savedMedicationId = editMedicationId;
      } else {
        const newMedication = await createMedication(medicationData);
        if (!newMedication) {
          throw new Error('Failed to create medication');
        }
        savedMedicationId = newMedication.id;
      }

      // Schedule reminders if enabled
      if (reminderEnabled && times.length > 0) {
        scheduleMedicationReminders(
          savedMedicationId,
          name.trim(),
          dosage.trim(),
          times
        );
      } else if (!reminderEnabled) {
        // Remove reminders from localStorage if disabled
        const existingSchedules = JSON.parse(
          localStorage.getItem('medication-reminders') || '[]'
        ) as Array<{ medicationId: string }>;
        const updatedSchedules = existingSchedules.filter(
          (s) => s.medicationId !== savedMedicationId
        );
        localStorage.setItem('medication-reminders', JSON.stringify(updatedSchedules));
      }

      onSave?.();
      onClose();
    } catch (error) {
      console.error('Failed to save medication:', error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <Pill className="h-5 w-5" style={{ color }} />
            </div>
            <h2 className="text-xl font-bold text-ink-900">
              {editMedicationId ? 'Edit Medication' : 'Add Medication'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-ink-100 transition-colors"
          >
            <X className="h-5 w-5 text-ink-500" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Medication Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Vitamin D, Metformin"
                  className="w-full h-11 px-4 rounded-xl bg-surface-muted border border-outline-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-ink-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">
                    Type
                  </label>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as MedicationType)}
                      className="w-full h-11 px-4 pr-10 rounded-xl bg-surface-muted border border-outline-subtle focus:border-primary outline-none appearance-none text-ink-900"
                    >
                      {MEDICATION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.icon} {t.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g., 500mg, 2 tablets"
                    className="w-full h-11 px-4 rounded-xl bg-surface-muted border border-outline-subtle focus:border-primary outline-none text-ink-900"
                  />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-ink-500" />
                <h3 className="font-medium text-ink-900">Schedule</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Frequency
                </label>
                <div className="relative">
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as DoseFrequency)}
                    className="w-full h-11 px-4 pr-10 rounded-xl bg-surface-muted border border-outline-subtle focus:border-primary outline-none appearance-none text-ink-900"
                  >
                    {FREQUENCY_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
                </div>
              </div>

              {frequency !== 'as_needed' && (
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    Times
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DOSE_TIMES.map((time) => (
                      <button
                        key={time.value}
                        onClick={() => toggleTime(time.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          times.includes(time.value)
                            ? 'bg-primary text-white'
                            : 'bg-surface-muted text-ink-600 hover:bg-ink-100'
                        }`}
                      >
                        {time.label}
                        <span className="text-xs opacity-70 ml-1">({time.time})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Special Instructions (optional)
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g., Take with food, Avoid grapefruit"
                  className="w-full h-11 px-4 rounded-xl bg-surface-muted border border-outline-subtle focus:border-primary outline-none text-ink-900"
                />
              </div>
            </div>

            {/* Refill Tracking */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trackRefill}
                  onChange={(e) => setTrackRefill(e.target.checked)}
                  className="h-5 w-5 rounded border-outline-subtle text-primary focus:ring-primary"
                />
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-ink-500" />
                  <span className="font-medium text-ink-900">Track Supply & Refills</span>
                </div>
              </label>

              {trackRefill && (
                <div className="grid grid-cols-2 gap-4 pl-8">
                  <div>
                    <label className="block text-sm text-ink-600 mb-1.5">
                      Current Supply
                    </label>
                    <input
                      type="number"
                      value={currentSupply}
                      onChange={(e) => setCurrentSupply(Number(e.target.value))}
                      min={0}
                      className="w-full h-10 px-3 rounded-lg bg-surface-muted border border-outline-subtle focus:border-primary outline-none text-ink-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-ink-600 mb-1.5">
                      Remind when below
                    </label>
                    <input
                      type="number"
                      value={refillAt}
                      onChange={(e) => setRefillAt(Number(e.target.value))}
                      min={1}
                      className="w-full h-10 px-3 rounded-lg bg-surface-muted border border-outline-subtle focus:border-primary outline-none text-ink-900"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Habits Integration */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={createLinkedHabit}
                onChange={(e) => setCreateLinkedHabit(e.target.checked)}
                className="h-5 w-5 rounded border-outline-subtle text-primary focus:ring-primary"
              />
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-ink-500" />
                <span className="font-medium text-ink-900">Create linked habit for quick check-off</span>
              </div>
            </label>

            {/* Reminders */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => handleReminderToggle(e.target.checked)}
                  className="h-5 w-5 rounded border-outline-subtle text-primary focus:ring-primary"
                />
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-ink-500" />
                  <span className="font-medium text-ink-900">Enable reminders</span>
                </div>
              </label>
              {reminderEnabled && (
                <div className="pl-8">
                  {notificationPermission === 'granted' ? (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Browser notifications enabled
                    </p>
                  ) : notificationPermission === 'denied' ? (
                    <p className="text-sm text-amber-600">
                      Browser notifications blocked. Reminders will only work in-app.
                      <button
                        type="button"
                        onClick={() => requestNotificationPermission()}
                        className="ml-1 underline hover:no-underline"
                      >
                        Try again
                      </button>
                    </p>
                  ) : (
                    <p className="text-sm text-ink-500">
                      Click to enable browser notifications for reminders
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Color
              </label>
              <div className="flex gap-2">
                {MEDICATION_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full transition-all ${
                      color === c
                        ? 'ring-2 ring-offset-2 ring-ink-900 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-surface-muted border border-outline-subtle focus:border-primary outline-none text-ink-900 resize-none"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-outline-subtle">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-outline-subtle text-ink-700 font-medium hover:bg-ink-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || !dosage.trim()}
            className="flex-1 h-11 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : editMedicationId ? 'Save Changes' : 'Add Medication'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
