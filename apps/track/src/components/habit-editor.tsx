'use client';

import { useState } from 'react';
import type { Habit, Frequency } from '@ainexsuite/types';
import { createHabit, updateHabit, deleteHabit } from '@/lib/habits';
import { X, Trash2 } from 'lucide-react';

interface HabitEditorProps {
  habit: Habit | null;
  onClose: () => void;
  onSave: () => void;
}

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom' },
];

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
];

export function HabitEditor({ habit, onClose, onSave }: HabitEditorProps) {
  const [name, setName] = useState(habit?.name || '');
  const [description, setDescription] = useState(habit?.description || '');
  const [frequency, setFrequency] = useState<Frequency>(habit?.frequency || 'daily');
  const [color, setColor] = useState(habit?.color || COLORS[0]);
  const [goal, setGoal] = useState(habit?.goal || 1);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a habit name');
      return;
    }

    setSaving(true);
    try {
      if (habit) {
        await updateHabit(habit.id, { name, description, frequency, color, goal });
      } else {
        await createHabit({ name, description, frequency, color, goal });
      }
      onSave();
    } catch (error) {
      console.error('Failed to save habit:', error);
      alert('Failed to save habit');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!habit) return;
    if (!confirm('Are you sure you want to delete this habit?')) return;

    try {
      await deleteHabit(habit.id);
      onSave();
    } catch (error) {
      console.error('Failed to delete habit:', error);
      alert('Failed to delete habit');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md surface-card rounded-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-surface-hover">
          <h2 className="text-xl font-semibold">{habit ? 'Edit Habit' : 'New Habit'}</h2>

          <div className="flex items-center gap-2">
            {habit && (
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-surface-hover rounded-lg text-red-400"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-accent-500 hover:bg-accent-600 rounded-lg font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Habit Name</label>
            <input
              type="text"
              placeholder="e.g., Exercise, Read, Meditate"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 surface-elevated rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (optional)</label>
            <textarea
              placeholder="What's this habit about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 surface-elevated rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as Frequency)}
                className="w-full px-3 py-2 surface-elevated rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Daily Goal</label>
              <input
                type="number"
                min="1"
                value={goal}
                onChange={(e) => setGoal(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 surface-elevated rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                    color === c ? 'border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
