'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, FileText, CheckSquare, Target, Image as ImageIcon, BookOpen, Activity, Dumbbell } from 'lucide-react';
import { SearchResult, SearchableApp } from '@ainexsuite/types';

interface UniversalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const APP_ICONS: Record<SearchableApp, React.ReactNode> = {
  notes: <FileText className="h-4 w-4" />,
  journey: <BookOpen className="h-4 w-4" />,
  tasks: <CheckSquare className="h-4 w-4" />,
  track: <Target className="h-4 w-4" />,
  moments: <ImageIcon className="h-4 w-4" />,
  grow: <BookOpen className="h-4 w-4" />,
  pulse: <Activity className="h-4 w-4" />,
  fit: <Dumbbell className="h-4 w-4" />,
};

const APP_NAMES: Record<SearchableApp, string> = {
  notes: 'Notes',
  journey: 'Journey',
  tasks: 'Tasks',
  track: 'Track',
  moments: 'Moments',
  grow: 'Grow',
  pulse: 'Pulse',
  fit: 'Fit',
};

const APP_COLORS: Record<SearchableApp, string> = {
  notes: 'bg-yellow-500/10 text-yellow-500',
  journey: 'bg-blue-500/10 text-blue-500',
  tasks: 'bg-green-500/10 text-green-500',
  track: 'bg-purple-500/10 text-purple-500',
  moments: 'bg-pink-500/10 text-pink-500',
  grow: 'bg-indigo-500/10 text-indigo-500',
  pulse: 'bg-red-500/10 text-red-500',
  fit: 'bg-orange-500/10 text-orange-500',
};

export default function UniversalSearch({ isOpen, onClose }: UniversalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [appCounts, setAppCounts] = useState<Record<SearchableApp, number>>({
    notes: 0,
    journey: 0,
    tasks: 0,
    track: 0,
    moments: 0,
    grow: 0,
    pulse: 0,
    fit: 0,
  });

  // Search function with debouncing
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=20`
      );
      const data = await response.json();

      setResults(data.results || []);
      setAppCounts(data.appCounts || {});
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  // Handle result click
  const handleResultClick = useCallback((result: SearchResult) => {
    window.open(result.url, '_blank');
    onClose();
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleResultClick(results[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, handleResultClick]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const getTotalResults = () => {
    return Object.values(appCounts).reduce((sum, count) => sum + count, 0);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl surface-card rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-outline-base">
          <Search className="h-5 w-5 text-ink-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all apps..."
            className="flex-1 bg-transparent text-ink-900 text-lg placeholder-ink-500 outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-surface-hover rounded transition-colors"
            >
              <X className="h-4 w-4 text-ink-500" />
            </button>
          )}
          <kbd className="px-2 py-1 text-xs text-ink-600 bg-surface-muted rounded">
            ESC
          </kbd>
        </div>

        {/* Results Count */}
        {query && (
          <div className="px-4 py-2 bg-surface-elevated border-b border-outline-base">
            <p className="text-sm text-ink-600">
              {loading ? (
                'Searching...'
              ) : (
                <>
                  Found {getTotalResults()} result{getTotalResults() !== 1 ? 's' : ''}{' '}
                  {getTotalResults() > 0 && (
                    <span className="text-ink-500">
                      across{' '}
                      {Object.entries(appCounts)
                        .filter(([, count]) => count > 0)
                        .map(([app, count]) => `${APP_NAMES[app as SearchableApp]} (${count})`)
                        .join(', ')}
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        )}

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query && (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-ink-500 mx-auto mb-3" />
              <p className="text-ink-600">
                Search across Notes, Journal, Todo, Track, Moments, Grow, Pulse, and Fit
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                {Object.entries(APP_NAMES).map(([app, name]) => (
                  <div
                    key={app}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                      APP_COLORS[app as SearchableApp]
                    }`}
                  >
                    {APP_ICONS[app as SearchableApp]}
                    <span className="text-sm font-medium">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query && results.length === 0 && !loading && (
            <div className="p-8 text-center">
              <p className="text-ink-600">
                No results found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-sm text-ink-500 mt-2">
                Try searching for notes, tasks, journal entries, habits, and more
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="divide-y divide-outline-base">
              {results.map((result, index) => (
                <button
                  key={`${result.app}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className={`w-full p-4 text-left hover:bg-surface-hover transition-colors ${
                    index === selectedIndex ? 'bg-surface-hover' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${APP_COLORS[result.app]}`}>
                      {APP_ICONS[result.app]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-ink-900 font-medium truncate">
                          {result.title}
                        </h3>
                        <span className="text-xs text-ink-500 shrink-0">
                          {APP_NAMES[result.app]}
                        </span>
                      </div>
                      {result.content && (
                        <p className="text-sm text-ink-600 line-clamp-2">
                          {result.content}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-ink-500">
                          {new Date(result.updatedAt).toLocaleDateString()}
                        </span>
                        {result.metadata && Object.keys(result.metadata).length > 0 && (
                          <span className="text-xs text-ink-500">
                            •{' '}
                            {Object.entries(result.metadata)
                              .slice(0, 2)
                              .map(([key, value]) =>
                                typeof value === 'boolean'
                                  ? value
                                    ? key
                                    : null
                                  : `${key}: ${value}`
                              )
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Help */}
        <div className="px-4 py-3 bg-surface-elevated border-t border-outline-base">
          <div className="flex items-center gap-4 text-xs text-ink-600">
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-surface-muted rounded">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-surface-muted rounded">↵</kbd>
              <span>Open</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-surface-muted rounded">ESC</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
