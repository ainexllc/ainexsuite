'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { X, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernTagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  suggestions?: string[];
  maxTags?: number;
  className?: string;
}

export function ModernTagInput({
  tags,
  onTagsChange,
  placeholder = 'Add tags...',
  disabled = false,
  suggestions = [],
  maxTags,
  className,
}: ModernTagInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input and exclude already added tags
  const filteredSuggestions = suggestions
    .filter(
      (suggestion) =>
        !tags.includes(suggestion.toLowerCase()) &&
        suggestion.toLowerCase().includes(input.toLowerCase())
    )
    .slice(0, 5);

  useEffect(() => {
    setShowSuggestions(input.length > 0 && filteredSuggestions.length > 0);
    setSelectedSuggestionIndex(0);
  }, [input, filteredSuggestions.length]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();

    if (!trimmedTag) return;
    if (tags.includes(trimmedTag)) {
      setInput('');
      return;
    }
    if (maxTags && tags.length >= maxTags) {
      setInput('');
      return;
    }

    onTagsChange([...tags, trimmedTag]);
    setInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter key
    if (e.key === 'Enter') {
      e.preventDefault();

      if (showSuggestions && filteredSuggestions.length > 0) {
        addTag(filteredSuggestions[selectedSuggestionIndex]);
      } else if (input.trim()) {
        addTag(input);
      }
      return;
    }

    // Handle Backspace when input is empty - remove last tag
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      e.preventDefault();
      removeTag(tags[tags.length - 1]);
      return;
    }

    // Handle arrow navigation in suggestions
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Input Container */}
      <div
        className={cn(
          'flex flex-wrap gap-2 p-3 rounded-xl border bg-white dark:bg-zinc-900 transition-all',
          'focus-within:border-orange-500 dark:focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-500/20',
          disabled
            ? 'border-gray-200 dark:border-zinc-700 opacity-60 cursor-not-allowed'
            : 'border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-600'
        )}
      >
        {/* Existing Tags */}
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
              'bg-orange-500/10 dark:bg-orange-400/10 text-orange-600 dark:text-orange-400',
              'border border-orange-500/20 dark:border-orange-400/20',
              'animate-in fade-in slide-in-from-bottom-1 duration-200',
              'hover:bg-orange-500/20 dark:hover:bg-orange-400/20 transition-colors'
            )}
          >
            <Hash className="w-3 h-3" />
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              disabled={disabled}
              className={cn(
                'ml-1 rounded-full p-0.5 hover:bg-orange-500/30 dark:hover:bg-orange-400/30 transition-colors',
                'focus:outline-none focus:ring-1 focus:ring-orange-500 dark:focus:ring-orange-400'
              )}
              aria-label={`Remove ${tag} tag`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Input Field */}
        <div className="flex-1 min-w-[120px] flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={tags.length === 0 ? placeholder : ''}
            className={cn(
              'w-full bg-transparent border-none outline-none',
              'text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'disabled:cursor-not-allowed'
            )}
          />
        </div>
      </div>

      {/* Tag Count & Max Tags Info */}
      {maxTags && tags.length > 0 && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {tags.length} / {maxTags} tags
        </p>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          className={cn(
            'absolute z-50 w-full mt-2 py-2 rounded-xl border shadow-lg',
            'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700',
            'animate-in fade-in slide-in-from-top-2 duration-200'
          )}
        >
          <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
            Suggested tags
          </div>
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              onMouseEnter={() => setSelectedSuggestionIndex(index)}
              className={cn(
                'w-full px-3 py-2 text-left text-sm flex items-center gap-2',
                'transition-colors',
                index === selectedSuggestionIndex
                  ? 'bg-orange-500/10 dark:bg-orange-400/10 text-orange-600 dark:text-orange-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
              )}
            >
              <Hash className="w-3 h-3" />
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Helper Text */}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 font-mono">Enter</kbd> to add tag, <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 font-mono">Backspace</kbd> to remove last tag
      </p>
    </div>
  );
}
