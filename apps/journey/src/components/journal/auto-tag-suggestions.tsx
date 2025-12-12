'use client';

import { useState, useEffect, useCallback } from 'react';
import { JournalEntry } from '@ainexsuite/types';
import { Sparkles, Plus, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagSuggestion {
  tag: string;
  confidence: number;
  reason?: string;
}

interface AutoTagSuggestionsProps {
  entry: Partial<JournalEntry>;
  currentTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  className?: string;
}

export function AutoTagSuggestions({
  entry,
  currentTags,
  onAddTag,
  onRemoveTag,
  className,
}: AutoTagSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/ai/auto-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: entry.content || '',
          title: entry.title || '',
          mood: entry.mood,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate tag suggestions');
      }

      const data = await response.json();

      // Filter out tags that are already added
      const filteredSuggestions = (data.suggestions || [])
        .filter((suggestion: TagSuggestion) =>
          !currentTags.includes(suggestion.tag.toLowerCase())
        );

      setSuggestions(filteredSuggestions);
    } catch (err) {
      setError('Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  }, [entry.content, entry.title, entry.mood, currentTags]);

  useEffect(() => {
    if (entry.content && entry.content.length > 50) {
      generateSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [entry.content, entry.title, generateSuggestions]);

  // Filter out tags that have been added since we generated suggestions
  const availableSuggestions = suggestions.filter(
    (suggestion) => !currentTags.includes(suggestion.tag.toLowerCase())
  );

  const visibleSuggestions = showAll
    ? availableSuggestions
    : availableSuggestions.slice(0, 5);

  if (!entry.content || entry.content.length < 50) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-500 dark:text-orange-400" />
          <span className="text-sm font-medium text-foreground">
            Suggested Tags
          </span>
          {loading && (
            <Loader2 className="w-3 h-3 text-orange-500 dark:text-orange-400 animate-spin" />
          )}
        </div>

        {availableSuggestions.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
          >
            {showAll ? 'Show less' : `Show all (${availableSuggestions.length})`}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <X className="w-3 h-3" />
          {error}
        </div>
      )}

      {/* Suggestions */}
      {visibleSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {visibleSuggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.tag}-${index}`}
              type="button"
              onClick={() => onAddTag(suggestion.tag)}
              className={cn(
                'group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm',
                'border border-orange-200 dark:border-orange-800/50',
                'bg-orange-50 dark:bg-orange-900/20',
                'text-orange-700 dark:text-orange-300',
                'hover:bg-orange-100 dark:hover:bg-orange-900/30',
                'hover:border-orange-300 dark:hover:border-orange-700/50',
                'transition-all duration-200',
                'animate-in fade-in slide-in-from-bottom-1',
                'cursor-pointer'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Plus className="w-3 h-3 transition-transform group-hover:scale-110" />
              {suggestion.tag}
              {suggestion.confidence > 0 && (
                <span className="text-xs opacity-60">
                  {Math.round(suggestion.confidence * 100)}%
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Current Tags */}
      {currentTags.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            Current Tags
          </div>
          <div className="flex flex-wrap gap-2">
            {currentTags.map((tag, index) => (
              <span
                key={`current-${tag}-${index}`}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm',
                  'bg-muted',
                  'text-muted-foreground',
                  'border border-border'
                )}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className={cn(
                    'ml-1 rounded-full p-0.5 hover:bg-accent transition-colors',
                    'focus:outline-none focus:ring-1 focus:ring-orange-500'
                  )}
                  aria-label={`Remove ${tag} tag`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && suggestions.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Analyzing content for tag suggestions...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && availableSuggestions.length === 0 && currentTags.length === 0 && (
        <div className="text-sm text-muted-foreground">
          Write more content to get tag suggestions
        </div>
      )}
    </div>
  );
}
