'use client';

import { useState, useEffect } from 'react';
import type { HealthMetric, MoodType } from '@ainexsuite/types';
import {
  Scale,
  Moon,
  Droplets,
  Heart,
  Activity,
  Smile,
  Meh,
  Frown,
  Save,
  X,
} from 'lucide-react';

interface HealthCheckinFormProps {
  existingMetric?: HealthMetric | null;
  date: string;
  onSave: (data: Partial<HealthMetric>) => Promise<void>;
  onClose?: () => void;
}

const moodOptions: { value: MoodType; icon: typeof Smile; label: string; color: string }[] = [
  { value: 'energetic', icon: Smile, label: 'Great', color: 'text-emerald-500' },
  { value: 'happy', icon: Smile, label: 'Good', color: 'text-green-500' },
  { value: 'neutral', icon: Meh, label: 'Okay', color: 'text-yellow-500' },
  { value: 'stressed', icon: Frown, label: 'Bad', color: 'text-orange-500' },
  { value: 'tired', icon: Frown, label: 'Terrible', color: 'text-red-500' },
];

export function HealthCheckinForm({
  existingMetric,
  date,
  onSave,
  onClose,
}: HealthCheckinFormProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    weight: existingMetric?.weight ?? null,
    sleep: existingMetric?.sleep ?? null,
    water: existingMetric?.water ?? null,
    energy: existingMetric?.energy ?? null,
    mood: existingMetric?.mood ?? null,
    heartRate: existingMetric?.heartRate ?? null,
    bloodPressure: existingMetric?.bloodPressure ?? null,
    notes: existingMetric?.notes ?? '',
  });

  useEffect(() => {
    if (existingMetric) {
      setFormData({
        weight: existingMetric.weight ?? null,
        sleep: existingMetric.sleep ?? null,
        water: existingMetric.water ?? null,
        energy: existingMetric.energy ?? null,
        mood: existingMetric.mood ?? null,
        heartRate: existingMetric.heartRate ?? null,
        bloodPressure: existingMetric.bloodPressure ?? null,
        notes: existingMetric.notes ?? '',
      });
    }
  }, [existingMetric]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        date,
        ...formData,
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ink-900">
          Health Check-in for {new Date(date).toLocaleDateString()}
        </h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-surface-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-ink-500" />
          </button>
        )}
      </div>

      {/* Weight */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
          <Scale className="h-4 w-4 text-emerald-500" />
          Weight (lbs)
        </label>
        <input
          type="number"
          step="0.1"
          value={formData.weight ?? ''}
          onChange={(e) =>
            updateField('weight', e.target.value ? parseFloat(e.target.value) : null)
          }
          placeholder="Enter weight"
          className="w-full px-4 py-3 rounded-xl bg-surface-muted border border-outline-subtle focus:outline-none focus:ring-2 focus:ring-emerald-500 text-ink-900"
        />
      </div>

      {/* Sleep */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
          <Moon className="h-4 w-4 text-indigo-500" />
          Sleep (hours)
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          max="24"
          value={formData.sleep ?? ''}
          onChange={(e) =>
            updateField('sleep', e.target.value ? parseFloat(e.target.value) : null)
          }
          placeholder="Hours of sleep"
          className="w-full px-4 py-3 rounded-xl bg-surface-muted border border-outline-subtle focus:outline-none focus:ring-2 focus:ring-emerald-500 text-ink-900"
        />
      </div>

      {/* Water Intake */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
          <Droplets className="h-4 w-4 text-blue-500" />
          Water (glasses)
        </label>
        <input
          type="number"
          min="0"
          max="20"
          value={formData.water ?? ''}
          onChange={(e) =>
            updateField('water', e.target.value ? parseInt(e.target.value) : null)
          }
          placeholder="Glasses of water"
          className="w-full px-4 py-3 rounded-xl bg-surface-muted border border-outline-subtle focus:outline-none focus:ring-2 focus:ring-emerald-500 text-ink-900"
        />
      </div>

      {/* Energy Level */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
          <Activity className="h-4 w-4 text-amber-500" />
          Energy Level (1-10)
        </label>
        <div className="flex gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => updateField('energy', level)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.energy === level
                  ? 'bg-emerald-500 text-white'
                  : 'bg-surface-muted text-ink-600 hover:bg-surface-hover'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
          <Heart className="h-4 w-4 text-pink-500" />
          Mood
        </label>
        <div className="flex gap-2">
          {moodOptions.map(({ value, icon: Icon, label, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => updateField('mood', value)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-colors ${
                formData.mood === value
                  ? 'bg-emerald-500/10 border-2 border-emerald-500'
                  : 'bg-surface-muted border-2 border-transparent hover:bg-surface-hover'
              }`}
            >
              <Icon className={`h-5 w-5 ${color}`} />
              <span className="text-xs text-ink-600">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Heart Rate */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
          <Heart className="h-4 w-4 text-red-500" />
          Resting Heart Rate (bpm)
        </label>
        <input
          type="number"
          min="40"
          max="200"
          value={formData.heartRate ?? ''}
          onChange={(e) =>
            updateField('heartRate', e.target.value ? parseInt(e.target.value) : null)
          }
          placeholder="Enter heart rate"
          className="w-full px-4 py-3 rounded-xl bg-surface-muted border border-outline-subtle focus:outline-none focus:ring-2 focus:ring-emerald-500 text-ink-900"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-ink-700">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="How are you feeling today? Any symptoms or observations?"
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-surface-muted border border-outline-subtle focus:outline-none focus:ring-2 focus:ring-emerald-500 text-ink-900 resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
      >
        <Save className="h-5 w-5" />
        {saving ? 'Saving...' : existingMetric ? 'Update Check-in' : 'Save Check-in'}
      </button>
    </form>
  );
}
