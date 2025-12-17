'use client';

import { useCallback, useRef, useState } from 'react';
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
import { EntryEditorShell } from '@ainexsuite/ui';

interface HealthEditModalProps {
  metric: HealthMetric;
  onSave: (data: Partial<HealthMetric>) => Promise<void>;
  onClose: () => void;
}

const moodOptions: { value: MoodType; icon: typeof Smile; label: string; color: string }[] = [
  { value: 'excited', icon: Smile, label: 'Great', color: 'text-primary' },
  { value: 'happy', icon: Smile, label: 'Good', color: 'text-green-500' },
  { value: 'neutral', icon: Meh, label: 'Okay', color: 'text-yellow-500' },
  { value: 'anxious', icon: Frown, label: 'Bad', color: 'text-orange-500' },
  { value: 'tired', icon: Frown, label: 'Terrible', color: 'text-red-500' },
];

export function HealthEditModal({ metric, onSave, onClose }: HealthEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const [formData, setFormData] = useState({
    weight: metric.weight ?? null,
    sleep: metric.sleep ?? null,
    water: metric.water ?? null,
    energy: metric.energy ?? null,
    mood: metric.mood ?? null,
    heartRate: metric.heartRate ?? null,
    notes: metric.notes ?? '',
  });

  const updateField = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const dataToSave: Partial<HealthMetric> = { date: metric.date };
      if (formData.weight !== null) dataToSave.weight = formData.weight;
      if (formData.sleep !== null) dataToSave.sleep = formData.sleep;
      if (formData.water !== null) dataToSave.water = formData.water;
      if (formData.energy !== null) dataToSave.energy = formData.energy;
      if (formData.mood !== null) dataToSave.mood = formData.mood;
      if (formData.heartRate !== null) dataToSave.heartRate = formData.heartRate;
      if (formData.notes.trim()) dataToSave.notes = formData.notes.trim();

      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Failed to save check-in:', error);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [metric.date, formData, onSave, onClose]);

  const formattedDate = new Date(metric.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <EntryEditorShell
      isOpen={true}
      onClose={onClose}
      footerRightContent={
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full border px-4 py-1.5 text-sm font-medium transition border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-full bg-[var(--color-primary)] px-5 py-1.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-60 inline-flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      }
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Edit Check-in</h3>
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {/* Weight */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Scale className="h-3.5 w-3.5 text-primary" />
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
            className="w-full px-3 py-2 rounded-xl bg-foreground/5 border border-border focus:outline-none focus:border-primary text-foreground text-sm placeholder:text-muted-foreground"
          />
        </div>

        {/* Sleep */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
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
            className="w-full px-3 py-2 rounded-xl bg-foreground/5 border border-border focus:outline-none focus:border-primary text-foreground text-sm placeholder:text-muted-foreground"
          />
        </div>

        {/* Water */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
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
            className="w-full px-3 py-2 rounded-xl bg-foreground/5 border border-border focus:outline-none focus:border-primary text-foreground text-sm placeholder:text-muted-foreground"
          />
        </div>

        {/* Heart Rate */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
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
            className="w-full px-3 py-2 rounded-xl bg-foreground/5 border border-border focus:outline-none focus:border-primary text-foreground text-sm placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Energy Level */}
      <div className="space-y-2 mb-5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
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
                  ? 'bg-primary text-foreground'
                  : 'bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground/70'
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div className="space-y-2 mb-5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
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
                  ? 'bg-primary/20 border-2 border-primary'
                  : 'bg-foreground/5 border-2 border-transparent hover:bg-foreground/10'
              )}
            >
              <Icon className={clsx('h-5 w-5', color)} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
        <textarea
          value={formData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="How are you feeling today? Any symptoms or observations?"
          rows={3}
          className="w-full px-3 py-2 rounded-xl bg-foreground/5 border border-border focus:outline-none focus:border-primary text-foreground text-sm placeholder:text-muted-foreground resize-none"
        />
      </div>
    </EntryEditorShell>
  );
}
