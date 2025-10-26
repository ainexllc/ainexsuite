'use client';

import { useState } from 'react';
import type { Note } from '@ainexsuite/types';
import { Pin, Archive, Trash2, MoreVertical } from 'lucide-react';
import { updateNote, deleteNote } from '@/lib/notes';
import { cn } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onUpdate: () => void;
}

const NOTE_COLORS: Record<string, string> = {
  default: 'bg-surface-card',
  'note-white': 'bg-note-white/20 border-note-white/30',
  'note-lemon': 'bg-note-lemon/20 border-note-lemon/30',
  'note-mint': 'bg-note-mint/20 border-note-mint/30',
  'note-sky': 'bg-note-sky/20 border-note-sky/30',
  'note-lavender': 'bg-note-lavender/20 border-note-lavender/30',
  'note-pink': 'bg-note-pink/20 border-note-pink/30',
  'note-coral': 'bg-note-coral/20 border-note-coral/30',
};

const NOTE_PATTERNS: Record<string, string> = {
  none: '',
  grid: 'bg-grid-pattern bg-grid-sm',
  dots: 'bg-dots-pattern bg-dots-sm',
};

export function NoteCard({ note, onClick, onUpdate }: NoteCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await updateNote(note.id, { pinned: !note.pinned });
      onUpdate();
    } catch (error) {
      console.error('Failed to pin note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await updateNote(note.id, { archived: !note.archived });
      onUpdate();
    } catch (error) {
      console.error('Failed to archive note:', error);
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this note?')) return;

    setLoading(true);
    try {
      await deleteNote(note.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete note:', error);
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-lg border p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg',
        NOTE_COLORS[note.color] || NOTE_COLORS.default,
        NOTE_PATTERNS[note.pattern] || NOTE_PATTERNS.none,
        loading && 'opacity-50 pointer-events-none'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        {note.title && (
          <h3 className="font-semibold text-lg text-ink-900 pr-8">{note.title}</h3>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={handlePin}
            className={cn(
              'p-1 rounded hover:bg-surface-hover transition-colors',
              note.pinned && 'text-accent-500'
            )}
            title={note.pinned ? 'Unpin' : 'Pin'}
          >
            <Pin className="h-4 w-4" />
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded hover:bg-surface-hover transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 surface-elevated border border-surface-hover rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
                <button
                  onClick={handleArchive}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-surface-hover transition-colors text-left"
                >
                  <Archive className="h-4 w-4" />
                  <span className="text-sm">
                    {note.archived ? 'Unarchive' : 'Archive'}
                  </span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-surface-hover transition-colors text-left text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm">Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      {note.body && (
        <p className="text-ink-800 text-sm whitespace-pre-wrap line-clamp-6 mb-3">
          {note.body}
        </p>
      )}

      {/* Labels */}
      {note.labels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {note.labels.map((label) => (
            <span
              key={label}
              className="text-xs px-2 py-1 surface-elevated rounded-full text-ink-700"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
