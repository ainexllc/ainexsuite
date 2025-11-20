'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, FileText, CheckSquare, Target, Image as ImageIcon, BookOpen, Activity, Dumbbell } from 'lucide-react';
import { SearchResult, SearchableApp } from '@ainexsuite/types';
import { useAuth } from '@ainexsuite/auth';
import { ActionDispatcher } from '@/lib/action-dispatcher';

interface UniversalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const APP_ICONS: Record<string, React.ReactNode> = {
  notes: <FileText className="h-4 w-4" />,
  journey: <BookOpen className="h-4 w-4" />,
  todo: <CheckSquare className="h-4 w-4" />,
  track: <Target className="h-4 w-4" />,
  moments: <ImageIcon className="h-4 w-4" />,
  grow: <BookOpen className="h-4 w-4" />,
  pulse: <Activity className="h-4 w-4" />,
  fit: <Dumbbell className="h-4 w-4" />,
};

const APP_NAMES: Record<string, string> = {
  notes: 'Notes',
  journey: 'Journey',
  todo: 'Todo',
  track: 'Track',
  moments: 'Moments',
  grow: 'Grow',
  pulse: 'Pulse',
  fit: 'Fit',
};

const APP_COLORS: Record<string, string> = {
  notes: 'bg-yellow-500/10 text-yellow-500',
  journey: 'bg-blue-500/10 text-blue-500',
  todo: 'bg-green-500/10 text-green-500',
  track: 'bg-purple-500/10 text-purple-500',
  moments: 'bg-pink-500/10 text-pink-500',
  grow: 'bg-indigo-500/10 text-indigo-500',
  pulse: 'bg-red-500/10 text-red-500',
  fit: 'bg-orange-500/10 text-orange-500',
};

export default function UniversalSearch({ isOpen, onClose }: UniversalSearchProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [appCounts, setAppCounts] = useState<Record<string, number>>({});
  const [isAiMode, setIsAiMode] = useState(false);

  // Search function with debouncing
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    // Check for AI command triggers
    const aiTriggers = ['create', 'remind', 'add', 'log', 'track', 'start', 'schedule'];
    const firstWord = searchQuery.split(' ')[0].toLowerCase();
    
    if (aiTriggers.includes(firstWord)) {
      setIsAiMode(true);
      // In a real implementation, we wouldn't fetch search results here,
      // but rather show AI command suggestions. For now, we'll just mock it.
      setResults([
        {
          id: 'ai-command',
          app: 'ai' as unknown as SearchableApp,
          type: 'command',
          title: `AI Command: ${firstWord}...`,
          content: `I can help you ${searchQuery}. Press Enter to execute.`,
          url: '#',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          metadata: { type: 'command' }
        }
      ]);
      return;
    } else {
      setIsAiMode(false);
    }

    setLoading(true);
    try {
      // TODO: Replace with real cross-app search API
      // For now, we'll simulate empty results or basic mock results
      // In a real app, this would hit an endpoint that aggregates Algolia/Elasticsearch results
      
      // Mock results for demonstration
      if (searchQuery.toLowerCase().includes('note')) {
        setResults([
          { id: '1', app: 'notes', type: 'note', title: 'Meeting Notes', content: 'Discussed Q4 roadmap...', url: 'https://notes.ainexsuite.com/1', createdAt: Date.now(), updatedAt: Date.now() },
          { id: '2', app: 'notes', type: 'note', title: 'Ideas', content: 'App ideas: Smart workspace...', url: 'https://notes.ainexsuite.com/2', createdAt: Date.now(), updatedAt: Date.now() }
        ]);
      } else if (searchQuery.toLowerCase().includes('task')) {
         setResults([
          { id: '3', app: 'todo', type: 'task', title: 'Finish design', content: 'Due tomorrow', url: 'https://tasks.ainexsuite.com/3', createdAt: Date.now(), updatedAt: Date.now() }
        ]);
      } else {
        setResults([]);
      }
      
      setAppCounts({ notes: 2, todo: 1 });
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
  const handleResultClick = useCallback(async (result: SearchResult) => {
    if (result.id === 'ai-command' && user?.uid) {
      // Handle AI Command Execution
      const dispatcher = new ActionDispatcher(user.uid);
      const response = await dispatcher.dispatch(query);

      alert(response.message);
    } else {
      window.open(result.url, '_blank');
    }
    onClose();
  }, [onClose, query, user]);

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
      } else if (e.key === 'Enter' && (results[selectedIndex] || isAiMode)) {
        e.preventDefault();
        handleResultClick(results[selectedIndex] || { id: 'ai-command', app: 'ai' as unknown as SearchableApp, type: 'command', title: 'Command', content: '', url: '#', createdAt: Date.now(), updatedAt: Date.now() });
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, handleResultClick, isAiMode]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setIsAiMode(false);
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
        className={`w-full max-w-2xl surface-card rounded-xl shadow-2xl overflow-hidden transition-colors duration-300 ${isAiMode ? 'ring-2 ring-purple-500 bg-purple-900/20' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-outline-base relative overflow-hidden">
          {!isAiMode && (
            <Search className="h-5 w-5 text-ink-500" />
          )}
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isAiMode ? "Ask AI to do something..." : "Search across all apps..."}
            className="flex-1 bg-transparent text-ink-900 text-lg placeholder-ink-500 outline-none relative z-10"
            autoFocus
          />
          
          {/* AI Mode Indicator Background */}
          {isAiMode && (
             <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 pointer-events-none" />
          )}

          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-surface-hover rounded transition-colors z-10"
            >
              <X className="h-4 w-4 text-ink-500" />
            </button>
          )}
          <kbd className="px-2 py-1 text-xs text-ink-600 bg-surface-muted rounded z-10">
            ESC
          </kbd>
        </div>

        {/* Results Count */}
        {query && !isAiMode && (
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
                        .map(([app, count]) => `${APP_NAMES[app as SearchableApp] || app} (${count})`)
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
              <div className="flex justify-center mb-4 space-x-4">
                 <div className="flex flex-col items-center">
                   <Search className="h-8 w-8 text-ink-500 mb-2" />
                   <span className="text-xs text-ink-500">Find</span>
                 </div>
                 <div className="h-12 w-px bg-white/10" />
                 <div className="flex flex-col items-center">
                   <span className="text-xs text-purple-400">Create</span>
                 </div>
              </div>
              
              <p className="text-ink-600 mb-2">
                Search for content OR type a command
              </p>
              <p className="text-sm text-ink-500 italic">
                &quot;Create a task to buy milk&quot; • &quot;Log a 30 min run&quot;
              </p>
            </div>
          )}

          {query && results.length === 0 && !loading && (
            <div className="p-8 text-center">
              <p className="text-ink-600">
                No results found for &ldquo;{query}&rdquo;
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="divide-y divide-outline-base">
              {results.map((result, index) => (
                <button
                  key={`${result.app}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className={`w-full p-4 text-left hover:bg-surface-hover transition-colors ${index === selectedIndex ? 'bg-surface-hover' : ''} ${result.id === 'ai-command' ? 'bg-purple-500/5 hover:bg-purple-500/10' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${result.id === 'ai-command' ? 'bg-purple-500/20 text-purple-400' : APP_COLORS[result.app]}`}>
                      {result.id === 'ai-command' ? '✨' : APP_ICONS[result.app]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-ink-900 font-medium truncate">
                          {result.title}
                        </h3>
                        {result.id !== 'ai-command' && (
                            <span className="text-xs text-ink-500 shrink-0">
                            {APP_NAMES[result.app]}
                            </span>
                        )}
                      </div>
                      {result.content && (
                        <p className="text-sm text-ink-600 line-clamp-2">
                          {result.content}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
