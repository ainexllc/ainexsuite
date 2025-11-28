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
  X,
} from 'lucide-react';
import { clsx } from 'clsx';

interface HealthEditModalProps {
  metric: HealthMetric;
  onSave: (data: Partial<HealthMetric>) => Promise<void>;
  onClose: () => void;
}

const moodOptions: { value: MoodType; icon: typeof Smile; label: string; color: string }[] = [
  { value: 'energetic', icon: Smile, label: 'Great', color: 'text-primary' },
  { value: 'happy', icon: Smile, label: 'Good', color: 'text-green-500' },
  { value: 'neutral', icon: Meh, label: 'Okay', color: 'text-yellow-500' },
  { value: 'stressed', icon: Frown, label: 'Bad', color: 'text-orange-500' },
  { value: 'tired', icon: Frown, label: 'Terrible', color: 'text-red-500' },
];

export function HealthEditModal({ metric, onSave, onClose }: HealthEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const modalRef = useRef<HTMLDivElement>(null);

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

  // Handle click outside
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!modalRef.current) return;
      if (modalRef.current.contains(event.target as Node)) return;
      onClose();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const formattedDate = new Date(metric.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4">
      <div
        ref={modalRef}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-[#121212] border border-border"
      >
        <div className="flex flex-col gap-5 px-5 py-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Edit Check-in</h3>
              <p className="text-sm text-muted-foreground">{formattedDate}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
          <div className="space-y-2">
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
          <div className="space-y-2">
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
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-foreground/5 border border-border focus:outline-none focus:border-primary text-foreground text-sm placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-primary flex items-center gap-2"
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
        </div>
      </div>
    </div>
  );
}
