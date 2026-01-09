'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, FileText, ExternalLink, ArrowRight, Command } from 'lucide-react';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  section: 'recent' | 'pages' | 'actions' | 'apps';
  onSelect: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  items?: CommandItem[];
  placeholder?: string;
}

const defaultItems: CommandItem[] = [
  // Apps section - navigate to other AinexSuite apps
  { id: 'app-main', label: 'Main Dashboard', description: 'Central hub', icon: <ExternalLink className="h-4 w-4" />, section: 'apps', onSelect: () => window.location.href = 'http://localhost:3000/workspace' },
  { id: 'app-notes', label: 'Notes', description: 'Colorful notes', icon: <ExternalLink className="h-4 w-4" />, section: 'apps', onSelect: () => window.location.href = 'http://localhost:3001/workspace' },
  { id: 'app-journal', label: 'Journal', description: 'Mood & reflections', icon: <ExternalLink className="h-4 w-4" />, section: 'apps', onSelect: () => window.location.href = 'http://localhost:3002/workspace' },
  { id: 'app-todo', label: 'Todo', description: 'Task management', icon: <ExternalLink className="h-4 w-4" />, section: 'apps', onSelect: () => window.location.href = 'http://localhost:3003/workspace' },
  { id: 'app-calendar', label: 'Calendar', description: 'Scheduling', icon: <ExternalLink className="h-4 w-4" />, section: 'apps', onSelect: () => window.location.href = 'http://localhost:3014/workspace' },
];

export function CommandPalette({
  isOpen,
  onClose,
  items = defaultItems,
  placeholder = 'Type to search...',
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter items based on query
  const filteredItems = items.filter((item) => {
    if (!query) return true;
    const searchStr = `${item.label} ${item.description || ''}`.toLowerCase();
    return searchStr.includes(query.toLowerCase());
  });

  // Group items by section
  const groupedItems = filteredItems.reduce(
    (acc, item) => {
      if (!acc[item.section]) acc[item.section] = [];
      acc[item.section].push(item);
      return acc;
    },
    {} as Record<string, CommandItem[]>
  );

  // Flat list for keyboard navigation
  const flatItems = Object.values(groupedItems).flat();

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(flatItems.length, 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + flatItems.length) % Math.max(flatItems.length, 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (flatItems[selectedIndex]) {
            flatItems[selectedIndex].onSelect();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [isOpen, flatItems, selectedIndex, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && flatItems.length > 0) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, flatItems.length]);

  if (!isOpen) return null;

  const sectionLabels: Record<string, string> = {
    recent: 'Recent',
    pages: 'Pages',
    actions: 'Actions',
    apps: 'Apps',
  };

  let globalIndex = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="relative w-full max-w-lg mx-4 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-zinc-200 px-4 dark:border-zinc-800">
          <Search className="h-5 w-5 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={placeholder}
            className="flex-1 bg-transparent py-4 text-base outline-none placeholder:text-zinc-400 dark:text-white"
          />
          <kbd className="hidden sm:flex items-center gap-1 rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {flatItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            Object.entries(groupedItems).map(([section, sectionItems]) => (
              <div key={section} className="mb-2">
                <div className="px-2 py-1.5 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  {sectionLabels[section] || section}
                </div>
                {sectionItems.map((item) => {
                  const currentIndex = globalIndex++;
                  const isSelected = currentIndex === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      data-index={currentIndex}
                      onClick={() => {
                        item.onSelect();
                        onClose();
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        isSelected
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300'
                          : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span className={`flex-shrink-0 ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400'}`}>
                        {item.icon || <FileText className="h-4 w-4" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.label}</div>
                        {item.description && (
                          <div className={`text-xs truncate ${isSelected ? 'text-amber-700/70 dark:text-amber-300/70' : 'text-zinc-500'}`}>
                            {item.description}
                          </div>
                        )}
                      </div>
                      {item.shortcut && (
                        <kbd className="hidden sm:block text-xs px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
                          {item.shortcut}
                        </kbd>
                      )}
                      {isSelected && (
                        <ArrowRight className="h-4 w-4 flex-shrink-0 text-amber-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
