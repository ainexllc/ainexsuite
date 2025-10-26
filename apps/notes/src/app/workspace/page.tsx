'use client';

import { useEffect, useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import type { Note } from '@ainexsuite/types';
import { getNotes } from '@/lib/notes';
import { TopNav } from '@/components/top-nav';
import { Sidebar } from '@/components/sidebar';
import { NoteCard } from '@/components/note-card';
import { NoteEditor } from '@/components/note-editor';
import { AIAssistant } from '@/components/ai-assistant';
import { Plus, Search } from 'lucide-react';

function NotesWorkspaceContent() {
  const { user, loading: authLoading } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  useEffect(() => {
    if (user) {
      void loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await getNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter((note) => {
    if (note.deleted) return false;

    const matchesSearch = searchQuery
      ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.body.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesLabel = selectedLabel ? note.labels.includes(selectedLabel) : true;

    return matchesSearch && matchesLabel;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.pinned && !n.archived);
  const unpinnedNotes = filteredNotes.filter((n) => !n.pinned && !n.archived);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-ink-600">Loading your notes...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-ink-600">Please sign in to access your notes.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-base">
      <TopNav />

      <div className="flex">
        <Sidebar selectedLabel={selectedLabel} onSelectLabel={setSelectedLabel} notes={notes} />

        <main className="flex-1 p-6 ml-[280px]">
          <div className="max-w-[1280px] mx-auto mb-8">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-600" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 surface-card rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none text-ink-900 placeholder-ink-600"
                />
              </div>

              <button
                onClick={() => setIsCreatingNote(true)}
                className="flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 rounded-lg font-medium transition-colors"
                type="button"
              >
                <Plus className="h-5 w-5" />
                New Note
              </button>
            </div>
          </div>

          <div className="max-w-[1280px] mx-auto">
            {pinnedNotes.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-medium text-ink-600 uppercase tracking-wider mb-4">
                  Pinned
                </h2>
                <div className="masonry-grid">
                  {pinnedNotes.map((note) => (
                    <div key={note.id} className="masonry-item">
                      <NoteCard
                        note={note}
                        onClick={() => setEditingNote(note)}
                        onUpdate={loadNotes}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {unpinnedNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <h2 className="text-sm font-medium text-ink-600 uppercase tracking-wider mb-4">
                    Others
                  </h2>
                )}
                <div className="masonry-grid">
                  {unpinnedNotes.map((note) => (
                    <div key={note.id} className="masonry-item">
                      <NoteCard
                        note={note}
                        onClick={() => setEditingNote(note)}
                        onUpdate={loadNotes}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredNotes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-ink-600 mb-4">
                  {searchQuery || selectedLabel ? 'No notes found' : 'No notes yet'}
                </p>
                <button
                  onClick={() => setIsCreatingNote(true)}
                  className="text-accent-500 hover:text-accent-600 font-medium"
                  type="button"
                >
                  Create your first note
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {(isCreatingNote || editingNote) && (
        <NoteEditor
          note={editingNote}
          onClose={() => {
            setIsCreatingNote(false);
            setEditingNote(null);
          }}
          onSave={() => {
            void loadNotes();
            setIsCreatingNote(false);
            setEditingNote(null);
          }}
        />
      )}

      <AIAssistant />
    </div>
  );
}

export default function NotesWorkspacePage() {
  return (
    <SuiteGuard appName="notes">
      <NotesWorkspaceContent />
    </SuiteGuard>
  );
}

