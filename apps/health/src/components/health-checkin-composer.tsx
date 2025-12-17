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
  Pin,
  PinOff,
  StickyNote,
} from 'lucide-react';
import { clsx } from 'clsx';

interface HealthCheckinComposerProps {
  existingMetric?: HealthMetric | null;
  date: string;
  onSave: (data: Partial<HealthMetric>) => Promise<void>;
}

const moodOptions: { value: MoodType; icon: typeof Smile; label: string; color: string }[] = [
  { value: 'excited', icon: Smile, label: 'Great', color: 'text-[var(--color-primary)]' },
  { value: 'happy', icon: Smile, label: 'Good', color: 'text-green-500' },
  { value: 'neutral', icon: Meh, label: 'Okay', color: 'text-yellow-500' },
  { value: 'anxious', icon: Frown, label: 'Low', color: 'text-orange-500' },
  { value: 'tired', icon: Frown, label: 'Bad', color: 'text-red-500' },
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
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    weight: existingMetric?.weight ?? null,
    sleep: existingMetric?.sleep ?? null,
    water: existingMetric?.water ?? null,
    energy: existingMetric?.energy ?? null,
    mood: existingMetric?.mood ?? null,
    heartRate: existingMetric?.heartRate ?? null,
    notes: existingMetric?.notes ?? '',
    pinned: false,
  });

  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showNotesField, setShowNotesField] = useState(!!existingMetric?.notes);

  // Sync form data when existingMetric changes
  useEffect(() => {
    if (existingMetric) {
      setFormData({
        title: '',
        weight: existingMetric.weight ?? null,
        sleep: existingMetric.sleep ?? null,
        water: existingMetric.water ?? null,
        energy: existingMetric.energy ?? null,
        mood: existingMetric.mood ?? null,
        heartRate: existingMetric.heartRate ?? null,
        notes: existingMetric.notes ?? '',
        pinned: false,
      });
      if (existingMetric.notes) setShowNotesField(true);
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
      title: '',
      weight: existingMetric?.weight ?? null,
      sleep: existingMetric?.sleep ?? null,
      water: existingMetric?.water ?? null,
      energy: existingMetric?.energy ?? null,
      mood: existingMetric?.mood ?? null,
      heartRate: existingMetric?.heartRate ?? null,
      notes: existingMetric?.notes ?? '',
      pinned: false,
    });
    setShowMoodPicker(false);
    setShowNotesField(!!existingMetric?.notes);
    isSubmittingRef.current = false;
  }, [existingMetric]);

  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current || !hasContent) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
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

  const selectedMood = moodOptions.find(m => m.value === formData.mood);

  return (
    <section className="w-full">
      {!expanded ? (
        <button
          type="button"
          className="flex w-full items-center rounded-2xl border px-5 py-4 text-left text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
          onClick={() => setExpanded(true)}
        >
          <span>{existingMetric ? 'Update today\'s check-in...' : 'Log a health check-in...'}</span>
        </button>
      ) : (
        <div
          ref={composerRef}
          className="w-full rounded-2xl shadow-xl bg-background border border-border backdrop-blur-xl transition-all"
        >
          <div className="flex flex-col gap-3 px-5 py-4">
            {/* Header - Title input + mood badge + pin (matches notes/journey) */}
            <div className="flex items-start gap-3">
              <input
                value={formData.title || new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Title"
                className="w-full bg-transparent text-lg font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
                autoFocus
                ref={titleInputRef}
              />
              {selectedMood && (
                <button
                  onClick={() => setShowMoodPicker(!showMoodPicker)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                    "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                  )}
                >
                  <selectedMood.icon className="w-3.5 h-3.5" />
                  {selectedMood.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => updateField('pinned', !formData.pinned)}
                className={clsx(
                  "p-2 rounded-full transition-colors flex-shrink-0",
                  formData.pinned
                    ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                )}
                aria-label={formData.pinned ? "Unpin" : "Pin"}
              >
                {formData.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              </button>
            </div>

            {/* Health Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="space-y-1">
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Scale className="h-3.5 w-3.5" />
                  Weight
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight ?? ''}
                  onChange={(e) => updateField('weight', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="lbs"
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:border-primary text-foreground text-sm placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Moon className="h-3.5 w-3.5" />
                  Sleep
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={formData.sleep ?? ''}
                  onChange={(e) => updateField('sleep', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="hrs"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-[var(--color-primary)] text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  <Droplets className="h-3.5 w-3.5" />
                  Water
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.water ?? ''}
                  onChange={(e) => updateField('water', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="glasses"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-[var(--color-primary)] text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  <Heart className="h-3.5 w-3.5" />
                  Heart Rate
                </label>
                <input
                  type="number"
                  min="40"
                  max="200"
                  value={formData.heartRate ?? ''}
                  onChange={(e) => updateField('heartRate', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="bpm"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-[var(--color-primary)] text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* Energy Level */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <Activity className="h-3.5 w-3.5" />
                Energy Level
              </label>
              <div className="flex gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => updateField('energy', formData.energy === level ? null : level)}
                    className={clsx(
                      'flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      formData.energy === level
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes field (toggleable) */}
            {showNotesField && (
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Any notes about how you're feeling..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:border-primary text-foreground text-sm placeholder:text-muted-foreground resize-none"
              />
            )}

            {/* Mood Picker Popup */}
            {showMoodPicker && (
              <div className="flex gap-2 p-3 rounded-xl bg-muted border border-border">
                {moodOptions.map(({ value, icon: Icon, label, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      updateField('mood', formData.mood === value ? null : value);
                      setShowMoodPicker(false);
                    }}
                    className={clsx(
                      'flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-colors',
                      formData.mood === value
                        ? 'bg-primary/20'
                        : 'hover:bg-muted'
                    )}
                  >
                    <Icon className={clsx('h-5 w-5', color)} />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Footer - Icon toolbar + Close/Save (matches notes/journey) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className={clsx(
                    "p-2 rounded-full transition-colors",
                    showMoodPicker
                      ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={() => setShowMoodPicker(!showMoodPicker)}
                  title="Set mood"
                >
                  <Smile className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className={clsx(
                    "p-2 rounded-full transition-colors",
                    showNotesField
                      ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={() => setShowNotesField(!showNotesField)}
                  title="Add notes"
                >
                  <StickyNote className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
                  onClick={resetState}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !hasContent}
                  className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/20 transition hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
