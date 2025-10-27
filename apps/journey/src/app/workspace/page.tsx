'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import type { JournalEntry } from '@ainexsuite/types';
import { getJournalEntries } from '@/lib/journal';
import { AppShell } from '@/components/layout/app-shell';
import { Container } from '@/components/layout/container';
import { Calendar } from '@/components/calendar';
import { EntryCard } from '@/components/entry-card';
import { EntryEditor } from '@/components/entry-editor';
import { MoodChart } from '@/components/mood-chart';
import { AIAssistant } from '@/components/ai-assistant';
import { Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

function JourneyWorkspaceContent() {
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [searchQuery, setSearchQuery] = useState('');

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      const fetchedEntries = await getJournalEntries(start, end);
      setEntries(fetchedEntries);
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (user) {
      void loadEntries();
    }
  }, [user, selectedDate, loadEntries]);

  // Filter entries by search query
  const filteredEntries = searchQuery
    ? entries.filter(
        (entry) =>
          entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : entries;

  if (authLoading || loading) {
    return (
      <AppShell onSearchChange={setSearchQuery} searchQuery={searchQuery}>
        <Container className="py-12">
          <div className="text-center text-gray-600 dark:text-gray-400">Loading entries...</div>
        </Container>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell onSearchChange={setSearchQuery} searchQuery={searchQuery}>
        <Container className="py-12">
          <div className="text-center text-gray-600 dark:text-gray-400">Please sign in to access Journey.</div>
        </Container>
      </AppShell>
    );
  }

  return (
    <AppShell onSearchChange={setSearchQuery} searchQuery={searchQuery}>
      <Container className="py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Journey</h1>
                <p className="text-ink-600">{format(selectedDate, 'MMMM yyyy')}</p>
              </div>

              <button
                onClick={() => setIsCreatingEntry(true)}
                className="flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 rounded-lg font-medium transition-colors"
                type="button"
              >
                <Plus className="h-5 w-5" />
                New Entry
              </button>
            </div>

            <div className="flex gap-2 surface-card rounded-lg p-1">
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'timeline' ? 'bg-accent-500 text-white' : 'hover:bg-surface-hover'
                }`}
                type="button"
              >
                Timeline
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'calendar' ? 'bg-accent-500 text-white' : 'hover:bg-surface-hover'
                }`}
                type="button"
              >
                Calendar
              </button>
            </div>

            {viewMode === 'timeline' ? (
              <div className="space-y-4">
                {filteredEntries.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {searchQuery ? 'No entries found' : 'No entries this month'}
                    </p>
                    <button
                      onClick={() => setIsCreatingEntry(true)}
                      className="text-purple-500 hover:text-purple-600 dark:text-purple-400 font-medium"
                      type="button"
                    >
                      Create your first entry
                    </button>
                  </div>
                ) : (
                  filteredEntries.map((entry) => (
                    <EntryCard key={entry.id} entry={entry} onClick={() => setEditingEntry(entry)} />
                  ))
                )}
              </div>
            ) : (
              <Calendar
                entries={filteredEntries}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onCreateEntry={(date) => {
                  setSelectedDate(date);
                  setIsCreatingEntry(true);
                }}
              />
            )}
          </div>

          <div className="space-y-6">
            <div className="surface-card rounded-lg p-6">
              <h3 className="font-semibold mb-4">Mood Trend</h3>
              <MoodChart entries={entries} />
            </div>

            <div className="surface-card rounded-lg p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-ink-600">Entries This Month</div>
                  <div className="text-2xl font-bold">{entries.length}</div>
                </div>
                <div>
                  <div className="text-sm text-ink-600">Current Streak</div>
                  <div className="text-2xl font-bold">-</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {(isCreatingEntry || editingEntry) && (
          <EntryEditor
            entry={editingEntry}
            initialDate={selectedDate}
            onClose={() => {
              setIsCreatingEntry(false);
              setEditingEntry(null);
            }}
            onSave={() => {
              void loadEntries();
              setIsCreatingEntry(false);
              setEditingEntry(null);
            }}
          />
        )}

        <AIAssistant />
      </Container>
    </AppShell>
  );
}

export default function JourneyWorkspacePage() {
  return (
    <SuiteGuard appName="journey">
      <JourneyWorkspaceContent />
    </SuiteGuard>
  );
}

