'use client';

import { useState } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { DatePicker } from '@ainexsuite/ui';
import type { LabResult, LabCategory, LabResultValue } from '@ainexsuite/types';

interface LabResultEditorProps {
  initialResult?: LabResult;
  onSave: (result: Omit<LabResult, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const categories: { value: LabCategory; label: string }[] = [
  { value: 'blood', label: 'Blood Test' },
  { value: 'metabolic', label: 'Metabolic Panel' },
  { value: 'lipid', label: 'Lipid Panel' },
  { value: 'thyroid', label: 'Thyroid' },
  { value: 'vitamin', label: 'Vitamins' },
  { value: 'hormone', label: 'Hormones' },
  { value: 'other', label: 'Other' },
];

export function LabResultEditor({ initialResult, onSave, onCancel }: LabResultEditorProps) {
  const [date, setDate] = useState(
    initialResult?.date || new Date().toISOString().split('T')[0]
  );
  const [category, setCategory] = useState<LabCategory>(initialResult?.category || 'blood');
  const [testName, setTestName] = useState(initialResult?.testName || '');
  const [values, setValues] = useState<LabResultValue[]>(
    initialResult?.values || [{ name: '', value: 0, unit: '' }]
  );
  const [notes, setNotes] = useState(initialResult?.notes || '');
  const [saving, setSaving] = useState(false);

  const handleValueChange = (index: number, field: 'name' | 'value' | 'unit' | 'refMin' | 'refMax', val: string | number) => {
    setValues((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v;
        if (field === 'name' || field === 'unit') {
          return { ...v, [field]: val as string };
        }
        if (field === 'value') {
          return { ...v, value: Number(val) };
        }
        if (field === 'refMin' || field === 'refMax') {
          const refRange = v.referenceRange || { min: 0, max: 0 };
          return {
            ...v,
            referenceRange: field === 'refMin'
              ? { ...refRange, min: Number(val) }
              : { ...refRange, max: Number(val) },
          };
        }
        return v;
      })
    );
  };

  const addValue = () => {
    setValues((prev) => [...prev, { name: '', value: 0, unit: '' }]);
  };

  const removeValue = (index: number) => {
    setValues((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!testName.trim() || values.length === 0) return;

    setSaving(true);
    try {
      await onSave({
        date,
        category,
        testName: testName.trim(),
        values: values.filter((v) => v.name.trim()),
        notes: notes.trim() || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date & Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Test Date
          </label>
          <DatePicker
            value={date ? new Date(date) : null}
            onChange={(d) => setDate(d ? d.toISOString().split('T')[0] : '')}
            placeholder="Test date"
            presets="smart"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as LabCategory)}
            className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Test Name */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Test Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          placeholder="e.g., Complete Blood Count, Lipid Panel..."
          className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Values */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-ink-700">Test Values</label>
          <button
            onClick={addValue}
            className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
          >
            <Plus className="w-4 h-4" />
            Add Value
          </button>
        </div>

        <div className="space-y-3">
          {values.map((val, index) => (
            <div key={index} className="p-3 bg-surface-subtle rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-500">Value #{index + 1}</span>
                {values.length > 1 && (
                  <button
                    onClick={() => removeValue(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={val.name}
                  onChange={(e) => handleValueChange(index, 'name', e.target.value)}
                  placeholder="Name (e.g., Hemoglobin)"
                  className="col-span-3 px-3 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <input
                  type="number"
                  step="0.01"
                  value={val.value}
                  onChange={(e) => handleValueChange(index, 'value', e.target.value)}
                  placeholder="Value"
                  className="px-3 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <input
                  type="text"
                  value={val.unit}
                  onChange={(e) => handleValueChange(index, 'unit', e.target.value)}
                  placeholder="Unit (e.g., g/dL)"
                  className="col-span-2 px-3 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={val.referenceRange?.min ?? ''}
                  onChange={(e) => handleValueChange(index, 'refMin', e.target.value || '')}
                  placeholder="Ref Min"
                  className="flex-1 px-3 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <input
                  type="number"
                  step="0.01"
                  value={val.referenceRange?.max ?? ''}
                  onChange={(e) => handleValueChange(index, 'refMax', e.target.value || '')}
                  placeholder="Ref Max"
                  className="flex-1 px-3 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Doctor's comments, follow-up recommendations..."
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
          disabled={saving || !testName.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Result'}
        </button>
      </div>
    </div>
  );
}
