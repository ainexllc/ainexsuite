'use client';

import * as React from 'react';
import { X, Hash, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface TagInputProps {
  /** Current tag values */
  value: string[];
  /** Callback when tags change */
  onChange: (tags: string[]) => void;
  /** Available tag suggestions */
  suggestions?: string[];
  /** Callback to fetch suggestions based on search query */
  onSuggestionsSearch?: (query: string) => void | Promise<void>;
  /** Placeholder text */
  placeholder?: string;
  /** Maximum number of tags allowed */
  maxTags?: number;
  /** Allow custom tags not in suggestions */
  allowCustom?: boolean;
  /** Visual variant */
  variant?: 'default' | 'inline' | 'chips';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Loading state for async suggestions */
  loading?: boolean;
  /** Debounce delay for search (ms) */
  debounceDelay?: number;
  /** Case-sensitive tag matching */
  caseSensitive?: boolean;
  /** Show tag count */
  showCount?: boolean;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Error state */
  error?: boolean;
}

export interface TagProps {
  /** Tag text/label */
  label: string;
  /** Optional color (CSS color value or Tailwind class) */
  color?: string;
  /** Callback when remove is clicked */
  onRemove?: () => void;
  /** Whether tag can be removed */
  removable?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'default' | 'outline' | 'solid';
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Click handler for the tag */
  onClick?: () => void;
}

export interface TagListProps {
  /** Array of tag labels or tag objects */
  tags: string[] | Array<{ label: string; color?: string }>;
  /** Maximum tags to show before +N more */
  max?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Callback when a tag is clicked */
  onTagClick?: (tag: string) => void;
  /** Additional CSS classes */
  className?: string;
  /** Show empty state */
  showEmpty?: boolean;
  /** Empty state text */
  emptyText?: string;
}

// ============================================================================
// Tag Component - Individual tag/chip
// ============================================================================

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      label,
      color,
      onRemove,
      removable = true,
      size = 'md',
      variant = 'default',
      className,
      disabled = false,
      onClick,
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-3 py-1 text-sm gap-1.5',
      lg: 'px-4 py-1.5 text-base gap-2',
    };

    const variantClasses = {
      default: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20',
      outline: 'bg-transparent border border-border text-foreground hover:bg-muted',
      solid: 'bg-primary text-primary-foreground border border-transparent hover:bg-primary/90',
    };

    const iconSize = {
      sm: 'w-3 h-3',
      md: 'w-3.5 h-3.5',
      lg: 'w-4 h-4',
    };

    // Apply custom color if provided
    const colorStyle = color
      ? {
          backgroundColor: variant === 'solid' ? color : `${color}20`,
          borderColor: variant === 'outline' ? color : `${color}40`,
          color: variant === 'solid' ? '#fff' : color,
        }
      : undefined;

    return (
      <span
        ref={ref}
        onClick={onClick}
        className={cn(
          'inline-flex items-center rounded-lg font-medium transition-all duration-200',
          'animate-in fade-in slide-in-from-bottom-1',
          sizeClasses[size],
          variantClasses[variant],
          disabled && 'opacity-50 cursor-not-allowed',
          onClick && 'cursor-pointer',
          className
        )}
        style={colorStyle}
      >
        <Hash className={cn(iconSize[size], 'flex-shrink-0')} />
        <span className="truncate max-w-[200px]">{label}</span>
        {removable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className={cn(
              'ml-0.5 rounded-full p-0.5 hover:bg-muted transition-colors',
              'focus:outline-none focus:ring-1 focus:ring-ring',
              disabled && 'cursor-not-allowed'
            )}
            aria-label={`Remove ${label} tag`}
          >
            <X className={iconSize[size]} />
          </button>
        )}
      </span>
    );
  }
);

Tag.displayName = 'Tag';

// ============================================================================
// TagInput Component - Main tag input with autocomplete
// ============================================================================

export const TagInput = React.forwardRef<HTMLDivElement, TagInputProps>(
  (
    {
      value,
      onChange,
      suggestions = [],
      onSuggestionsSearch,
      placeholder = 'Add tags...',
      maxTags,
      allowCustom = true,
      variant: _variant = 'default',
      size = 'md',
      disabled = false,
      className,
      loading = false,
      debounceDelay = 300,
      caseSensitive = false,
      showCount = false,
      autoFocus = false,
      error = false,
    },
    ref
  ) => {
    const [input, setInput] = React.useState('');
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [isSearching, setIsSearching] = React.useState(false);

    const inputRef = React.useRef<HTMLInputElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const debounceTimerRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

    // Normalize tag based on case sensitivity
    const normalizeTag = React.useCallback(
      (tag: string) => (caseSensitive ? tag : tag.toLowerCase()),
      [caseSensitive]
    );

    // Filter suggestions based on input
    const filteredSuggestions = React.useMemo(() => {
      if (!input.trim()) return [];

      return suggestions
        .filter((suggestion) => {
          const normalizedSuggestion = normalizeTag(suggestion);
          const normalizedInput = normalizeTag(input);
          const alreadyAdded = value.some(
            (tag) => normalizeTag(tag) === normalizedSuggestion
          );

          return (
            !alreadyAdded && normalizedSuggestion.includes(normalizedInput)
          );
        })
        .slice(0, 5); // Limit to 5 suggestions
    }, [input, suggestions, value, normalizeTag]);

    // Debounced search effect
    React.useEffect(() => {
      if (!onSuggestionsSearch || !input.trim()) {
        setIsSearching(false);
        return;
      }

      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      setIsSearching(true);

      // Set new timer
      debounceTimerRef.current = setTimeout(async () => {
        try {
          await onSuggestionsSearch(input);
        } finally {
          setIsSearching(false);
        }
      }, debounceDelay);

      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, [input, onSuggestionsSearch, debounceDelay]);

    // Show/hide suggestions
    React.useEffect(() => {
      setShowSuggestions(input.length > 0 && filteredSuggestions.length > 0);
      setSelectedIndex(0);
    }, [input, filteredSuggestions.length]);

    // Click outside handler
    React.useEffect(() => {
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

    // Add tag handler
    const addTag = React.useCallback(
      (tag: string) => {
        const trimmedTag = tag.trim();
        if (!trimmedTag) return;

        const normalizedTag = normalizeTag(trimmedTag);
        const isDuplicate = value.some(
          (existingTag) => normalizeTag(existingTag) === normalizedTag
        );

        if (isDuplicate) {
          setInput('');
          return;
        }

        if (maxTags && value.length >= maxTags) {
          setInput('');
          return;
        }

        // Check if tag is in suggestions or custom tags are allowed
        const isInSuggestions = suggestions.some(
          (s) => normalizeTag(s) === normalizedTag
        );

        if (!allowCustom && !isInSuggestions) {
          setInput('');
          return;
        }

        onChange([...value, trimmedTag]);
        setInput('');
        setShowSuggestions(false);
      },
      [value, onChange, maxTags, allowCustom, suggestions, normalizeTag]
    );

    // Remove tag handler
    const removeTag = React.useCallback(
      (tagToRemove: string) => {
        onChange(value.filter((tag) => tag !== tagToRemove));
        inputRef.current?.focus();
      },
      [value, onChange]
    );

    // Keyboard handler
    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Enter key - add tag
        if (e.key === 'Enter') {
          e.preventDefault();

          if (showSuggestions && filteredSuggestions.length > 0) {
            addTag(filteredSuggestions[selectedIndex]);
          } else if (input.trim()) {
            addTag(input);
          }
          return;
        }

        // Comma or Tab - add tag
        if (e.key === ',' || e.key === 'Tab') {
          if (input.trim()) {
            e.preventDefault();
            addTag(input);
          }
          return;
        }

        // Backspace with empty input - remove last tag
        if (e.key === 'Backspace' && !input && value.length > 0) {
          e.preventDefault();
          removeTag(value[value.length - 1]);
          return;
        }

        // Arrow navigation in suggestions
        if (showSuggestions && filteredSuggestions.length > 0) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) =>
              prev < filteredSuggestions.length - 1 ? prev + 1 : prev
            );
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          } else if (e.key === 'Escape') {
            setShowSuggestions(false);
          }
        }
      },
      [
        input,
        value,
        showSuggestions,
        filteredSuggestions,
        selectedIndex,
        addTag,
        removeTag,
      ]
    );

    // Size classes
    const sizeClasses = {
      sm: 'p-2 gap-1.5 text-sm',
      md: 'p-3 gap-2 text-base',
      lg: 'p-4 gap-2.5 text-lg',
    };

    const inputSizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    return (
      <div ref={containerRef} className={cn('relative w-full', className)}>
        {/* Main Input Container */}
        <div
          ref={ref}
          className={cn(
            'flex flex-wrap rounded-xl border bg-surface-elevated transition-all duration-200',
            sizeClasses[size],
            disabled
              ? 'border-outline-subtle opacity-60 cursor-not-allowed'
              : error
                ? 'border-danger hover:border-danger/80 focus-within:border-danger focus-within:ring-2 focus-within:ring-danger/20'
                : 'border-outline-subtle hover:border-outline-base focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'
          )}
        >
          {/* Existing Tags */}
          {value.map((tag, index) => (
            <Tag
              key={`${tag}-${index}`}
              label={tag}
              onRemove={() => removeTag(tag)}
              removable={!disabled}
              size={size}
              disabled={disabled}
            />
          ))}

          {/* Input Field */}
          <div className="flex-1 min-w-[120px] flex items-center relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={value.length === 0 ? placeholder : ''}
              autoFocus={autoFocus}
              className={cn(
                'w-full bg-transparent border-none outline-none',
                'text-ink-900 placeholder:text-ink-400',
                'disabled:cursor-not-allowed',
                inputSizeClasses[size]
              )}
              aria-label="Tag input"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
              aria-controls="tag-suggestions"
            />
            {(loading || isSearching) && (
              <Loader2 className="absolute right-2 w-4 h-4 animate-spin text-ink-400" />
            )}
          </div>
        </div>

        {/* Tag Count & Max Info */}
        {showCount && maxTags && value.length > 0 && (
          <p className="mt-1.5 text-xs text-ink-500">
            {value.length} / {maxTags} tags
          </p>
        )}

        {/* Helper Text */}
        {!disabled && (
          <p className="mt-1.5 text-xs text-ink-500">
            Press{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-surface-muted border border-outline-subtle font-mono">
              Enter
            </kbd>{' '}
            or{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-surface-muted border border-outline-subtle font-mono">
              ,
            </kbd>{' '}
            to add tag,{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-surface-muted border border-outline-subtle font-mono">
              Backspace
            </kbd>{' '}
            to remove
          </p>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            id="tag-suggestions"
            role="listbox"
            className={cn(
              'absolute z-50 w-full mt-2 py-2 rounded-xl border shadow-lg',
              'bg-surface-elevated backdrop-blur-xl',
              'border-outline-subtle',
              'animate-in fade-in slide-in-from-top-2 duration-200'
            )}
          >
            <div className="px-3 py-1 text-xs font-medium text-ink-500">
              Suggested tags
            </div>
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => addTag(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm flex items-center gap-2',
                  'transition-colors',
                  index === selectedIndex
                    ? 'bg-primary/10 text-primary'
                    : 'text-ink-700 hover:bg-surface-muted'
                )}
              >
                <Hash className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

TagInput.displayName = 'TagInput';

// ============================================================================
// TagList Component - Read-only tag display
// ============================================================================

export const TagList = React.forwardRef<HTMLDivElement, TagListProps>(
  (
    {
      tags,
      max,
      size = 'md',
      onTagClick,
      className,
      showEmpty = false,
      emptyText = 'No tags',
    },
    ref
  ) => {
    // Normalize tags to objects
    const normalizedTags = React.useMemo(
      () =>
        tags.map((tag) =>
          typeof tag === 'string' ? { label: tag } : tag
        ),
      [tags]
    );

    // Handle overflow
    const displayTags = max
      ? normalizedTags.slice(0, max)
      : normalizedTags;
    const overflowCount = max && normalizedTags.length > max
      ? normalizedTags.length - max
      : 0;

    if (normalizedTags.length === 0 && !showEmpty) {
      return null;
    }

    if (normalizedTags.length === 0 && showEmpty) {
      return (
        <div
          ref={ref}
          className={cn('text-sm text-ink-500 italic', className)}
        >
          {emptyText}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('flex flex-wrap items-center gap-2', className)}
        role="list"
        aria-label="Tags"
      >
        {displayTags.map((tag, index) => (
          <Tag
            key={`${tag.label}-${index}`}
            label={tag.label}
            color={tag.color}
            size={size}
            removable={false}
            className={onTagClick ? 'cursor-pointer' : undefined}
            onClick={onTagClick ? () => onTagClick(tag.label) : undefined}
          />
        ))}
        {overflowCount > 0 && (
          <span
            className={cn(
              'inline-flex items-center px-2 py-1 rounded-lg',
              'bg-surface-muted text-ink-600 text-xs font-medium',
              size === 'sm' && 'px-1.5 py-0.5 text-[10px]',
              size === 'lg' && 'px-3 py-1.5 text-sm'
            )}
          >
            +{overflowCount} more
          </span>
        )}
      </div>
    );
  }
);

TagList.displayName = 'TagList';
