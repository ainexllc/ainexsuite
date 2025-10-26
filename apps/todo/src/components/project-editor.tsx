'use client';

import { useState } from 'react';
import { createProject } from '@/lib/todo';
import { X } from 'lucide-react';

interface ProjectEditorProps {
  onClose: () => void;
  onSave: () => void;
}

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
];

export function ProjectEditor({ onClose, onSave }: ProjectEditorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a project name');
      return;
    }

    setSaving(true);
    try {
      await createProject({ name, description, color });
      onSave();
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md surface-card rounded-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-surface-hover">
          <h2 className="text-xl font-semibold">New Project</h2>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-accent-500 hover:bg-accent-600 rounded-lg font-medium disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Project Name</label>
            <input
              type="text"
              placeholder="e.g., Work, Personal, Learning"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 surface-elevated rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (optional)</label>
            <textarea
              placeholder="What's this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 surface-elevated rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none resize-none"
            />
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
