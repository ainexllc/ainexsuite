'use client';

import { useState } from 'react';
import { useAuth } from '@ainexsuite/auth';
import type { JournalEntry, Mood } from '@ainexsuite/types';
import { createJournalEntry, updateJournalEntry } from '@/lib/firebase/firestore';
import { X, Smile, Meh, Frown, Heart, Zap, type LucideIcon } from 'lucide-react';
import { format } from 'date-fns';

interface EntryEditorProps {
  entry: JournalEntry | null;
  initialDate?: Date;
  onClose: () => void;
  onSave: () => void;
}

type MoodOption = {
  value: Mood;
  icon: LucideIcon;
  label: string;
  color: string;
};

const MOODS: MoodOption[] = [
  { value: 'amazing', icon: Heart, label: 'Amazing', color: 'bg-mood-amazing' },
  { value: 'good', icon: Smile, label: 'Good', color: 'bg-mood-good' },
  { value: 'okay', icon: Meh, label: 'Okay', color: 'bg-mood-okay' },
  { value: 'bad', icon: Frown, label: 'Bad', color: 'bg-mood-bad' },
  { value: 'terrible', icon: Zap, label: 'Terrible', color: 'bg-mood-terrible' },
];

export function EntryEditor({ entry, initialDate, onClose, onSave }: EntryEditorProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState<Mood>(entry?.mood || 'okay');
  const [date, setDate] = useState(entry?.date || (initialDate?.getTime() ?? Date.now()));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    if (!content.trim()) {
      alert('Please write something');
      return;
    }

    setSaving(true);
    try {
      if (entry) {
        await updateJournalEntry(entry.id, { title, content, mood, date });
      } else {
        await createJournalEntry(user.uid, { title, content, mood, date, tags: [] });
      }
      onSave();
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert('Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl surface-card rounded-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-surface-hover">
          <div className="flex-1">
            <input
              type="date"
              value={format(new Date(date), 'yyyy-MM-dd')}
              onChange={(e) => setDate(new Date(e.target.value).getTime())}
              className="surface-elevated rounded px-3 py-2 border border-surface-hover"
            />
          </div>

          <div className="flex items-center gap-2">
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

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">How are you feeling?</label>
            <div className="flex gap-2">
              {MOODS.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      mood === m.value
                        ? `${m.color} border-white text-white`
                        : 'surface-elevated border-surface-hover hover:border-accent-500'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-4 text-2xl font-semibold bg-transparent border-none focus:outline-none placeholder-ink-600"
          />

          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full bg-transparent border-none focus:outline-none placeholder-ink-600 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
