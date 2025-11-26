'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  Loader2,
} from 'lucide-react';
import { clsx } from 'clsx';

interface HealthCheckinComposerProps {
  existingMetric?: HealthMetric | null;
  date: string;
  onSave: (data: Partial<HealthMetric>) => Promise<void>;
}

const moodOptions: { value: MoodType; icon: typeof Smile; label: string; color: string }[] = [
  { value: 'energetic', icon: Smile, label: 'Great', color: 'text-emerald-500' },
  { value: 'happy', icon: Smile, label: 'Good', color: 'text-green-500' },
  { value: 'neutral', icon: Meh, label: 'Okay', color: 'text-yellow-500' },
  { value: 'stressed', icon: Frown, label: 'Bad', color: 'text-orange-500' },
  { value: 'tired', icon: Frown, label: 'Terrible', color: 'text-red-500' },
];

export function HealthCheckinComposer({
  existingMetric,
  date,
  onSave,
}: HealthCheckinComposerProps) {
  const [expanded, setExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const composerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    weight: existingMetric?.weight ?? null,
    sleep: existingMetric?.sleep ?? null,
    water: existingMetric?.water ?? null,
    energy: existingMetric?.energy ?? null,
    mood: existingMetric?.mood ?? null,
    heartRate: existingMetric?.heartRate ?? null,
    notes: existingMetric?.notes ?? '',
  });

  // Sync form data when existingMetric changes
  useEffect(() => {
    if (existingMetric) {
      setFormData({
        weight: existingMetric.weight ?? null,
        sleep: existingMetric.sleep ?? null,
        water: existingMetric.water ?? null,
        energy: existingMetric.energy ?? null,
        mood: existingMetric.mood ?? null,
        heartRate: existingMetric.heartRate ?? null,
        notes: existingMetric.notes ?? '',
      });
    }
  }, [existingMetric]);

  const hasContent =
    formData.weight !== null ||
    formData.sleep !== null ||
    formData.water !== null ||
    formData.energy !== null ||
    formData.mood !== null ||
    formData.heartRate !== null ||
    formData.notes.trim() !== '';

  const updateField = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const resetState = useCallback(() => {
    setExpanded(false);
    setFormData({
      weight: existingMetric?.weight ?? null,
      sleep: existingMetric?.sleep ?? null,
      water: existingMetric?.water ?? null,
      energy: existingMetric?.energy ?? null,
      mood: existingMetric?.mood ?? null,
      heartRate: existingMetric?.heartRate ?? null,
      notes: existingMetric?.notes ?? '',
    });
    isSubmittingRef.current = false;
  }, [existingMetric]);

  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current || !hasContent) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      // Filter out null values for Firestore
      const dataToSave: Partial<HealthMetric> = { date };
      if (formData.weight !== null) dataToSave.weight = formData.weight;
      if (formData.sleep !== null) dataToSave.sleep = formData.sleep;
      if (formData.water !== null) dataToSave.water = formData.water;
      if (formData.energy !== null) dataToSave.energy = formData.energy;
      if (formData.mood !== null) dataToSave.mood = formData.mood;
      if (formData.heartRate !== null) dataToSave.heartRate = formData.heartRate;
      if (formData.notes.trim()) dataToSave.notes = formData.notes.trim();

      await onSave(dataToSave);
      resetState();
    } catch (error) {
      console.error('Failed to save check-in:', error);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [hasContent, date, formData, onSave, resetState]);

  // Handle click outside
  useEffect(() => {
    if (!expanded) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!composerRef.current) return;
      if (composerRef.current.contains(event.target as Node)) return;

      if (!hasContent) {
        resetState();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [expanded, hasContent, resetState]);

  return (
    <section className="w-full mb-6">
      {!expanded ? (
        <button
          type="button"
          className="flex w-full items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left text-sm text-white/50 shadow-sm transition hover:bg-white/10 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 backdrop-blur-sm"
          onClick={() => setExpanded(true)}
        >
          <span>{existingMetric ? 'Update today\'s check-in...' : 'Check in today...'}</span>
        </button>
      ) : (
        <div
          ref={composerRef}
          className="w-full rounded-2xl shadow-xl bg-[#121212] border border-white/10 backdrop-blur-xl transition-all overflow-hidden"
        >
          <div className="flex flex-col gap-5 px-5 py-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {existingMetric ? 'Update Check-in' : 'Daily Check-in'}
              </h3>
              <span className="text-sm text-white/40">
                {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Weight */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-white/50">
                  <Scale className="h-3.5 w-3.5 text-emerald-500" />
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight ?? ''}
                  onChange={(e) =>
                    updateField('weight', e.target.value ? parseFloat(e.target.value) : null)
                  }
                  placeholder="—"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-emerald-500 text-white text-sm placeholder:text-white/30"
                />
              </div>

              {/* Sleep */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-white/50">
                  <Moon className="h-3.5 w-3.5 text-indigo-500" />
                  Sleep (hrs)
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
                  placeholder="—"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-emerald-500 text-white text-sm placeholder:text-white/30"
                />
              </div>

              {/* Water */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-white/50">
                  <Droplets className="h-3.5 w-3.5 text-blue-500" />
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
                  placeholder="—"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-emerald-500 text-white text-sm placeholder:text-white/30"
                />
              </div>

              {/* Heart Rate */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-white/50">
                  <Heart className="h-3.5 w-3.5 text-red-500" />
                  Heart Rate
                </label>
                <input
                  type="number"
                  min="40"
                  max="200"
                  value={formData.heartRate ?? ''}
                  onChange={(e) =>
                    updateField('heartRate', e.target.value ? parseInt(e.target.value) : null)
                  }
                  placeholder="—"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-emerald-500 text-white text-sm placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Energy Level */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-white/50">
                <Activity className="h-3.5 w-3.5 text-amber-500" />
                Energy Level
              </label>
              <div className="flex gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => updateField('energy', formData.energy === level ? null : level)}
                    className={clsx(
                      'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                      formData.energy === level
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-white/50">
                <Heart className="h-3.5 w-3.5 text-pink-500" />
                How are you feeling?
              </label>
              <div className="flex gap-2">
                {moodOptions.map(({ value, icon: Icon, label, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateField('mood', formData.mood === value ? null : value)}
                    className={clsx(
                      'flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-colors',
                      formData.mood === value
                        ? 'bg-emerald-500/20 border-2 border-emerald-500'
                        : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                    )}
                  >
                    <Icon className={clsx('h-5 w-5', color)} />
                    <span className="text-xs text-white/60">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/50">Notes (optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="How are you feeling today? Any symptoms or observations?"
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-emerald-500 text-white text-sm placeholder:text-white/30 resize-none"
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                className="text-sm font-medium text-white/50 hover:text-white transition-colors"
                onClick={resetState}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !hasContent}
                className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-600 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-emerald-500 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : existingMetric ? (
                  'Update'
                ) : (
                  'Save Check-in'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
