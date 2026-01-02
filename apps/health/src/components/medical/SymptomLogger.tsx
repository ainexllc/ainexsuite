'use client';

import { useState } from 'react';
import { Save, X, Plus } from 'lucide-react';
import type { SymptomEntry, SymptomCategory, SymptomSeverity } from '@ainexsuite/types';

interface SymptomLoggerProps {
  initialSymptom?: SymptomEntry;
  onSave: (symptom: Omit<SymptomEntry, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const categories: { value: SymptomCategory; label: string }[] = [
  { value: 'pain', label: 'Pain' },
  { value: 'digestive', label: 'Digestive' },
  { value: 'respiratory', label: 'Respiratory' },
  { value: 'neurological', label: 'Neurological' },
  { value: 'skin', label: 'Skin' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'mental', label: 'Mental Health' },
  { value: 'other', label: 'Other' },
];

const commonTriggers = [
  'Stress', 'Poor sleep', 'Food', 'Weather', 'Exercise',
  'Caffeine', 'Alcohol', 'Medication', 'Allergens', 'Dehydration'
];

export function SymptomLogger({ initialSymptom, onSave, onCancel }: SymptomLoggerProps) {
  const [symptom, setSymptom] = useState(initialSymptom?.symptom || '');
  const [category, setCategory] = useState<SymptomCategory>(initialSymptom?.category || 'other');
  const [severity, setSeverity] = useState<SymptomSeverity>(initialSymptom?.severity || 3);
  const [triggers, setTriggers] = useState<string[]>(initialSymptom?.triggers || []);
  const [customTrigger, setCustomTrigger] = useState('');
  const [notes, setNotes] = useState(initialSymptom?.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!symptom.trim()) return;

    setSaving(true);
    try {
      await onSave({
        date: initialSymptom?.date || new Date().toISOString().split('T')[0],
        time: initialSymptom?.time || new Date().toTimeString().slice(0, 5),
        symptom: symptom.trim(),
        category,
        severity,
        triggers: triggers.length > 0 ? triggers : undefined,
        notes: notes.trim() || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleTrigger = (trigger: string) => {
    setTriggers((prev) =>
      prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger]
    );
  };

  const addCustomTrigger = () => {
    if (customTrigger.trim() && !triggers.includes(customTrigger.trim())) {
      setTriggers((prev) => [...prev, customTrigger.trim()]);
      setCustomTrigger('');
    }
  };

  const severityLabels: Record<SymptomSeverity, string> = {
    1: 'Mild',
    2: 'Minor',
    3: 'Moderate',
    4: 'Severe',
    5: 'Very Severe',
  };

  return (
    <div className="space-y-6">
      {/* Symptom Name */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Symptom <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          placeholder="e.g., Headache, Nausea, Joint pain..."
          className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as SymptomCategory)}
          className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Severity */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Severity: <span className="text-emerald-600">{severityLabels[severity]}</span>
        </label>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as SymptomSeverity[]).map((level) => (
            <button
              key={level}
              onClick={() => setSeverity(level)}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
                severity === level
                  ? level <= 2
                    ? 'bg-green-500 text-white'
                    : level <= 3
                    ? 'bg-amber-500 text-white'
                    : 'bg-red-500 text-white'
                  : 'bg-surface-subtle text-ink-600 hover:bg-surface-elevated'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-ink-400 mt-1">
          <span>Mild</span>
          <span>Severe</span>
        </div>
      </div>

      {/* Triggers */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Possible Triggers
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {commonTriggers.map((trigger) => (
            <button
              key={trigger}
              onClick={() => toggleTrigger(trigger)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                triggers.includes(trigger)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-surface-subtle text-ink-600 hover:bg-surface-elevated'
              }`}
            >
              {trigger}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTrigger}
            onChange={(e) => setCustomTrigger(e.target.value)}
            placeholder="Add custom trigger..."
            className="flex-1 px-3 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            onKeyDown={(e) => e.key === 'Enter' && addCustomTrigger()}
          />
          <button
            onClick={addCustomTrigger}
            disabled={!customTrigger.trim()}
            className="px-3 py-2 bg-surface-subtle rounded-lg hover:bg-surface-elevated transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4 text-ink-600" />
          </button>
        </div>
        {triggers.filter((t) => !commonTriggers.includes(t)).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {triggers
              .filter((t) => !commonTriggers.includes(t))
              .map((trigger) => (
                <span
                  key={trigger}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm"
                >
                  {trigger}
                  <button
                    onClick={() => toggleTrigger(trigger)}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional details about this symptom..."
          rows={3}
          className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
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
          disabled={saving || !symptom.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Log Symptom'}
        </button>
      </div>
    </div>
  );
}
