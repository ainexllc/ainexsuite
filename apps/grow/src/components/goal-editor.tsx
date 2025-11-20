'use client';

import { useState } from 'react';
import type { LearningGoal, LearningResource } from '@ainexsuite/types';
import { createLearningGoal, updateLearningGoal, deleteLearningGoal } from '@/lib/learning';
import { X, Trash2, Plus, Link as LinkIcon } from 'lucide-react';

interface GoalEditorProps {
  goal: LearningGoal | null;
  onClose: () => void;
  onSave: () => void;
}

const RESOURCE_TYPES: LearningResource['type'][] = ['article', 'video', 'course', 'book', 'tutorial'];

export function GoalEditor({ goal, onClose, onSave }: GoalEditorProps) {
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [category, setCategory] = useState(goal?.category || '');
  const [currentLevel, setCurrentLevel] = useState(goal?.currentLevel || 0);
  const [targetLevel, setTargetLevel] = useState(goal?.targetLevel || 100);
  const [targetDate, setTargetDate] = useState(
    goal?.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : ''
  );
  const [skills, setSkills] = useState<string[]>(goal?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [resources, setResources] = useState<LearningResource[]>(goal?.resources || []);
  const [saving, setSaving] = useState(false);

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    setSkills([...skills, trimmed]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleAddResource = () => {
    setResources([
      ...resources,
      { type: 'article', title: '', url: '', completed: false },
    ]);
  };

  const handleUpdateResource = (index: number, updates: Partial<LearningResource>) => {
    const updated = [...resources];
    updated[index] = { ...updated[index], ...updates };
    setResources(updated);
  };

  const handleRemoveResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a goal title');
      return;
    }

    setSaving(true);
    try {
      const data = {
        title,
        description: description.trim() || '',
        category: category.trim() || 'General',
        currentLevel,
        targetLevel,
        targetDate: targetDate ? new Date(targetDate).getTime() : null,
        skills: skills.filter((s) => s.trim()),
        resources: resources.filter((r) => r.title.trim() && r.url.trim()),
        active: goal?.active ?? true,
      };

      if (goal) {
        await updateLearningGoal(goal.id, data);
      } else {
        await createLearningGoal(data);
      }

      onSave();
    } catch (error) {
      alert('Failed to save goal');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!goal) return;
    if (!confirm('Are you sure you want to delete this learning goal?')) return;

    try {
      await deleteLearningGoal(goal.id);
      onSave();
    } catch (error) {
      alert('Failed to delete goal');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl surface-card rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-surface-hover sticky top-0 surface-card">
          <h2 className="text-xl font-semibold">
            {goal ? 'Edit Learning Goal' : 'New Learning Goal'}
          </h2>

          <div className="flex items-center gap-2">
            {goal && (
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
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Goal Title *</label>
              <input
                type="text"
                placeholder="e.g., Master React Development"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 surface-elevated rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                placeholder="What do you want to achieve?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 surface-elevated rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <input
                type="text"
                placeholder="e.g., Web Development"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 surface-elevated rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 surface-elevated rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Current Level: {currentLevel}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={currentLevel}
                onChange={(e) => setCurrentLevel(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Target Level: {targetLevel}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={targetLevel}
                onChange={(e) => setTargetLevel(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Skills to Learn</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add a skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 px-3 py-2 surface-elevated rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none"
              />
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 bg-surface-hover hover:bg-surface-card rounded-lg font-medium"
              >
                Add
              </button>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 surface-elevated rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button onClick={() => handleRemoveSkill(skill)} className="hover:text-red-400">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium">Learning Resources</label>
              <button
                onClick={handleAddResource}
                className="px-3 py-1 bg-accent-500 hover:bg-accent-600 rounded-lg text-sm font-medium flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Resource
              </button>
            </div>

            {resources.length > 0 && (
              <div className="space-y-3">
                {resources.map((resource, index) => (
                  <div key={index} className="surface-elevated p-3 rounded-lg space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={resource.type}
                        onChange={(e) =>
                          handleUpdateResource(index, {
                            type: e.target.value as LearningResource['type'],
                          })
                        }
                        className="px-2 py-1 surface-card rounded border border-surface-hover focus:border-accent-500 focus:outline-none text-sm"
                      >
                        {RESOURCE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Resource title"
                        value={resource.title}
                        onChange={(e) => handleUpdateResource(index, { title: e.target.value })}
                        className="flex-1 px-2 py-1 surface-card rounded border border-surface-hover focus:border-accent-500 focus:outline-none text-sm"
                      />

                      <button
                        onClick={() => handleRemoveResource(index)}
                        className="p-1 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="relative">
                      <LinkIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-ink-600" />
                      <input
                        type="url"
                        placeholder="URL"
                        value={resource.url}
                        onChange={(e) => handleUpdateResource(index, { url: e.target.value })}
                        className="w-full pl-8 pr-2 py-1 surface-card rounded border border-surface-hover focus:border-accent-500 focus:outline-none text-sm"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={resource.completed}
                        onChange={(e) =>
                          handleUpdateResource(index, { completed: e.target.checked })
                        }
                        className="rounded"
                      />
                      Completed
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
