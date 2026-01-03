'use client';

import { useState } from 'react';
import { Save, X, Plus } from 'lucide-react';
import type {
  Supplement,
  CreateSupplementInput,
  SupplementTime,
} from '@ainexsuite/types';

interface SupplementEditorProps {
  initialSupplement?: Supplement;
  onSave: (data: Omit<CreateSupplementInput, 'ownerId'>) => Promise<void>;
  onCancel: () => void;
}

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'as_needed', label: 'As Needed' },
] as const;

const TIME_OPTIONS: { value: SupplementTime; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'night', label: 'Night' },
  { value: 'with_food', label: 'With Food' },
  { value: 'before_bed', label: 'Before Bed' },
];

export function SupplementEditor({
  initialSupplement,
  onSave,
  onCancel,
}: SupplementEditorProps) {
  const [name, setName] = useState(initialSupplement?.name || '');
  const [brand, setBrand] = useState(initialSupplement?.brand || '');
  const [dosage, setDosage] = useState(initialSupplement?.dosage || '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'as_needed'>(
    initialSupplement?.schedule.frequency || 'daily'
  );
  const [times, setTimes] = useState<SupplementTime[]>(
    initialSupplement?.schedule.times || ['morning']
  );
  const [benefits, setBenefits] = useState<string[]>(
    initialSupplement?.benefits || []
  );
  const [newBenefit, setNewBenefit] = useState('');
  const [notes, setNotes] = useState(initialSupplement?.notes || '');
  const [inventory, setInventory] = useState<string>(
    initialSupplement?.inventory?.toString() || ''
  );
  const [lowStockThreshold, setLowStockThreshold] = useState<string>(
    initialSupplement?.lowStockThreshold?.toString() || ''
  );
  const [isActive, setIsActive] = useState(initialSupplement?.isActive ?? true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleTime = (time: SupplementTime) => {
    setTimes((prev) =>
      prev.includes(time)
        ? prev.filter((t) => t !== time)
        : [...prev, time]
    );
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !benefits.includes(newBenefit.trim())) {
      setBenefits((prev) => [...prev, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    setBenefits((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a supplement name');
      return;
    }

    if (!dosage.trim()) {
      setError('Please enter a dosage');
      return;
    }

    if (times.length === 0) {
      setError('Please select at least one time');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const data: Omit<CreateSupplementInput, 'ownerId'> = {
        name: name.trim(),
        brand: brand.trim() || undefined,
        dosage: dosage.trim(),
        schedule: {
          times,
          frequency,
        },
        benefits: benefits.length > 0 ? benefits : undefined,
        notes: notes.trim() || undefined,
        inventory: inventory ? parseInt(inventory) : undefined,
        lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : undefined,
        isActive,
      };

      await onSave(data);
    } catch (err) {
      setError('Failed to save supplement');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {/* Name & Brand */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Vitamin D3"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Brand
          </label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g., NOW Foods"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
          />
        </div>
      </div>

      {/* Dosage */}
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">
          Dosage <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          placeholder="e.g., 2000 IU, 1 capsule"
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
        />
      </div>

      {/* Frequency */}
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">
          Frequency
        </label>
        <div className="flex gap-2">
          {FREQUENCY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFrequency(opt.value)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                frequency === opt.value
                  ? 'bg-[hsl(var(--app-primary))] text-white'
                  : 'border border-border text-muted-foreground hover:bg-foreground/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Times */}
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">
          When to Take <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleTime(opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                times.includes(opt.value)
                  ? 'bg-[hsl(var(--app-primary))] text-white'
                  : 'border border-border text-muted-foreground hover:bg-foreground/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">
          Benefits
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newBenefit}
            onChange={(e) => setNewBenefit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addBenefit()}
            placeholder="e.g., Bone health, Immunity"
            className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
          />
          <button
            type="button"
            onClick={addBenefit}
            className="px-3 py-2 bg-foreground/10 rounded-lg hover:bg-foreground/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {benefits.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {benefits.map((benefit, index) => (
              <span
                key={index}
                className="flex items-center gap-1 px-2 py-1 bg-foreground/10 rounded-full text-sm"
              >
                {benefit}
                <button
                  type="button"
                  onClick={() => removeBenefit(index)}
                  className="p-0.5 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Inventory */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Current Inventory
          </label>
          <input
            type="number"
            min="0"
            value={inventory}
            onChange={(e) => setInventory(e.target.value)}
            placeholder="0"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Low Stock Alert At
          </label>
          <input
            type="number"
            min="0"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
            placeholder="10"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes..."
          rows={2}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))] resize-none"
        />
      </div>

      {/* Active Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground/80">Active</span>
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            isActive ? 'bg-[hsl(var(--app-primary))]' : 'bg-foreground/20'
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              isActive ? 'left-6' : 'left-1'
            }`}
          />
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-foreground/5 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[hsl(var(--app-primary))] text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
