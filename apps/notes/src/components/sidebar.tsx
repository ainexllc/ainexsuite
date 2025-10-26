'use client';

import { useMemo } from 'react';
import type { Note } from '@ainexsuite/types';
import { FileText, Archive, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  selectedLabel: string | null;
  onSelectLabel: (label: string | null) => void;
  notes: Note[];
}

export function Sidebar({ selectedLabel, onSelectLabel, notes }: SidebarProps) {
  // Extract all unique labels
  const labels = useMemo(() => {
    const labelSet = new Set<string>();
    notes.forEach((note) => {
      note.labels.forEach((label) => labelSet.add(label));
    });
    return Array.from(labelSet).sort();
  }, [notes]);

  const activeNotes = notes.filter((n) => !n.archived && !n.deleted);
  const archivedNotes = notes.filter((n) => n.archived && !n.deleted);

  return (
    <aside className="w-[280px] h-[calc(100vh-64px)] surface-elevated border-r border-surface-hover fixed left-0 top-16 overflow-y-auto">
      <div className="p-4">
        {/* Main Navigation */}
        <div className="mb-6">
          <button
            onClick={() => onSelectLabel(null)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left',
              !selectedLabel ? 'bg-accent-500 text-white' : 'hover:surface-card'
            )}
          >
            <FileText className="h-5 w-5" />
            <span className="font-medium">All Notes</span>
            <span className="ml-auto text-sm opacity-75">{activeNotes.length}</span>
          </button>
        </div>

        {/* Labels */}
        {labels.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-medium text-ink-600 uppercase tracking-wider mb-2 px-4">
              Labels
            </h3>
            <div className="space-y-1">
              {labels.map((label) => {
                const count = notes.filter(
                  (n) => n.labels.includes(label) && !n.archived && !n.deleted
                ).length;

                return (
                  <button
                    key={label}
                    onClick={() => onSelectLabel(label === selectedLabel ? null : label)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-left',
                      selectedLabel === label
                        ? 'bg-accent-500 text-white'
                        : 'hover:surface-card'
                    )}
                  >
                    <Tag className="h-4 w-4" />
                    <span className="text-sm">{label}</span>
                    <span className="ml-auto text-xs opacity-75">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Archived */}
        {archivedNotes.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-ink-600 uppercase tracking-wider mb-2 px-4">
              Other
            </h3>
            <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:surface-card transition-colors text-left">
              <Archive className="h-4 w-4" />
              <span className="text-sm">Archive</span>
              <span className="ml-auto text-xs opacity-75">{archivedNotes.length}</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
