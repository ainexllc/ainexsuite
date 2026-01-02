'use client';

import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { DateSuggestions } from '@ainexsuite/date-detection';
import type { Appointment, AppointmentType, AppointmentStatus } from '@ainexsuite/types';

interface AppointmentEditorProps {
  initialAppointment?: Appointment;
  onSave: (appointment: Omit<Appointment, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const types: { value: AppointmentType; label: string }[] = [
  { value: 'checkup', label: 'Check-up' },
  { value: 'followup', label: 'Follow-up' },
  { value: 'specialist', label: 'Specialist' },
  { value: 'lab', label: 'Lab Work' },
  { value: 'imaging', label: 'Imaging' },
  { value: 'therapy', label: 'Therapy' },
  { value: 'dental', label: 'Dental' },
  { value: 'vision', label: 'Vision' },
  { value: 'other', label: 'Other' },
];

const statuses: { value: AppointmentStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rescheduled', label: 'Rescheduled' },
];

export function AppointmentEditor({ initialAppointment, onSave, onCancel }: AppointmentEditorProps) {
  const [date, setDate] = useState(
    initialAppointment?.date || new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState(initialAppointment?.time || '09:00');
  const [type, setType] = useState<AppointmentType>(initialAppointment?.type || 'checkup');
  const [provider, setProvider] = useState(initialAppointment?.provider || '');
  const [reason, setReason] = useState(initialAppointment?.reason || '');
  const [status, setStatus] = useState<AppointmentStatus>(initialAppointment?.status || 'scheduled');
  const [notes, setNotes] = useState(initialAppointment?.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!reason.trim() || !provider.trim()) return;

    setSaving(true);
    try {
      await onSave({
        date,
        time,
        type,
        provider: provider.trim(),
        reason: reason.trim(),
        status,
        notes: notes.trim() || undefined,
        reminderEnabled: initialAppointment?.reminderEnabled ?? true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Type & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Appointment Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AppointmentType)}
            className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {types.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
            className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Provider */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Provider / Doctor <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          placeholder="e.g., Dr. Smith, City Medical Center..."
          className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Reason <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g., Annual check-up, Follow-up for blood test..."
          className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Questions to ask, documents to bring..."
          rows={3}
          className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
        {/* Date detection for follow-up mentions */}
        {notes.trim().length > 10 && (
          <DateSuggestions
            text={notes}
            context={{
              app: 'health',
              title: `${reason || 'Appointment'} follow-up`,
            }}
            className="mt-2"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-outline-subtle">
        <button
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-outline-subtle rounded-lg text-ink-600 hover:bg-surface-subtle transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !reason.trim() || !provider.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Appointment'}
        </button>
      </div>
    </div>
  );
}
