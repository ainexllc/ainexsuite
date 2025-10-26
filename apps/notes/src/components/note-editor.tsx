'use client';

import { useState } from 'react';
import type { Note, NoteColor, NotePattern } from '@ainexsuite/types';
import { createNote, updateNote } from '@/lib/notes';
import { X, Tag, Palette, Grid3x3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
  note: Note | null;
  onClose: () => void;
  onSave: () => void;
}

const COLORS: { value: NoteColor; label: string; class: string }[] = [
  { value: 'default', label: 'Default', class: 'bg-surface-card' },
  { value: 'note-white', label: 'White', class: 'bg-note-white' },
  { value: 'note-lemon', label: 'Lemon', class: 'bg-note-lemon' },
  { value: 'note-mint', label: 'Mint', class: 'bg-note-mint' },
  { value: 'note-sky', label: 'Sky', class: 'bg-note-sky' },
  { value: 'note-lavender', label: 'Lavender', class: 'bg-note-lavender' },
  { value: 'note-pink', label: 'Pink', class: 'bg-note-pink' },
  { value: 'note-coral', label: 'Coral', class: 'bg-note-coral' },
];

const PATTERNS: { value: NotePattern; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'grid', label: 'Grid' },
  { value: 'dots', label: 'Dots' },
];

export function NoteEditor({ note, onClose, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [body, setBody] = useState(note?.body || '');
  const [color, setColor] = useState<NoteColor>(note?.color || 'default');
  const [pattern, setPattern] = useState<NotePattern>(note?.pattern || 'none');
  const [labels, setLabels] = useState<string[]>(note?.labels || []);
  const [labelInput, setLabelInput] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPatternPicker, setShowPatternPicker] = useState(false);
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() && !body.trim()) {
      alert('Please enter a title or body');
      return;
    }

    setSaving(true);
    try {
      if (note) {
        // Update existing note
        await updateNote(note.id, {
          title: title.trim(),
          body: body.trim(),
          color,
          pattern,
          labels,
        });
      } else {
        // Create new note
        await createNote({
          title: title.trim(),
          body: body.trim(),
          color,
          pattern,
          labels,
          pinned: false,
          archived: false,
          deleted: false,
        });
      }
      onSave();
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLabel = () => {
    const newLabel = labelInput.trim();
    if (newLabel && !labels.includes(newLabel)) {
      setLabels([...labels, newLabel]);
      setLabelInput('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter((l) => l !== labelToRemove));
  };

  const selectedColor = COLORS.find((c) => c.value === color) || COLORS[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={cn(
          'w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden',
          selectedColor.class,
          pattern === 'grid' && 'bg-grid-pattern bg-grid-sm',
          pattern === 'dots' && 'bg-dots-pattern bg-dots-sm'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-hover">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                title="Change color"
              >
                <Palette className="h-5 w-5" />
              </button>

              {showColorPicker && (
                <div className="absolute top-12 left-0 surface-elevated border border-surface-hover rounded-lg shadow-lg p-3 z-10">
                  <div className="grid grid-cols-3 gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => {
                          setColor(c.value);
                          setShowColorPicker(false);
                        }}
                        className={cn(
                          'w-12 h-12 rounded-lg border-2 transition-all hover:scale-110',
                          c.class,
                          c.value === color ? 'border-accent-500' : 'border-transparent'
                        )}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowPatternPicker(!showPatternPicker)}
                className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                title="Change pattern"
              >
                <Grid3x3 className="h-5 w-5" />
              </button>

              {showPatternPicker && (
                <div className="absolute top-12 left-0 surface-elevated border border-surface-hover rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                  {PATTERNS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => {
                        setPattern(p.value);
                        setShowPatternPicker(false);
                      }}
                      className={cn(
                        'w-full px-4 py-2 text-left hover:bg-surface-hover transition-colors',
                        p.value === pattern && 'text-accent-500'
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowLabelInput(!showLabelInput)}
              className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
              title="Add label"
            >
              <Tag className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-accent-500 hover:bg-accent-600 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Label Input */}
        {showLabelInput && (
          <div className="p-4 border-b border-surface-hover">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add label..."
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddLabel();
                  }
                }}
                className="flex-1 px-3 py-2 surface-card rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none"
              />
              <button
                onClick={handleAddLabel}
                className="px-4 py-2 bg-accent-500 hover:bg-accent-600 rounded-lg font-medium transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Labels */}
        {labels.length > 0 && (
          <div className="p-4 border-b border-surface-hover flex flex-wrap gap-2">
            {labels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 px-3 py-1 surface-elevated rounded-full text-sm"
              >
                {label}
                <button
                  onClick={() => handleRemoveLabel(label)}
                  className="hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-4 text-2xl font-semibold bg-transparent border-none focus:outline-none placeholder-ink-600"
          />

          <textarea
            placeholder="Take a note..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="w-full bg-transparent border-none focus:outline-none placeholder-ink-600 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
