'use client';

import { forwardRef, ReactNode, KeyboardEvent, useState, useRef, useEffect } from 'react';
import { Plus, Sparkles, Send, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BaseComposerProps {
  /**
   * Placeholder text for the input
   */
  placeholder?: string;
  /**
   * Current input value
   */
  value: string;
  /**
   * Called when input value changes
   */
  onChange: (value: string) => void;
  /**
   * Called when user submits (Enter key or button click)
   */
  onSubmit: () => void;
  /**
   * Whether submission is in progress
   */
  isSubmitting?: boolean;
  /**
   * Whether AI enhancement is available
   */
  hasAI?: boolean;
  /**
   * Called when AI button is clicked
   */
  onAIClick?: () => void;
  /**
   * Whether AI is currently processing
   */
  isAILoading?: boolean;
  /**
   * App accent color
   */
  accentColor?: string;
  /**
   * Icon to show on the left (defaults to Plus)
   */
  icon?: ReactNode;
  /**
   * Additional content to render below the input (e.g., tags, options)
   */
  children?: ReactNode;
  /**
   * Whether the composer is expanded (for multi-line input)
   */
  expanded?: boolean;
  /**
   * Called when expanded state changes
   */
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * Additional class names
   */
  className?: string;
  /**
   * Whether to auto-focus the input
   */
  autoFocus?: boolean;
  /**
   * Minimum rows for textarea (when expanded)
   */
  minRows?: number;
  /**
   * Maximum rows for textarea (when expanded)
   */
  maxRows?: number;
  /**
   * Whether to show the submit button
   * @default true
   */
  showSubmitButton?: boolean;
  /**
   * Variant style
   * @default 'default'
   */
  variant?: 'default' | 'minimal' | 'outlined';
}

/**
 * BaseComposer - Unified form input component for creating new items
 *
 * Provides consistent styling across all apps for:
 * - Note creation
 * - Task creation
 * - Moment creation
 * - Workout logging
 * - etc.
 *
 * @example
 * ```tsx
 * <BaseComposer
 *   placeholder="Add a new task..."
 *   value={input}
 *   onChange={setInput}
 *   onSubmit={handleCreate}
 *   hasAI
 *   onAIClick={handleAIEnhance}
 *   accentColor="#8b5cf6"
 * />
 * ```
 */
export const BaseComposer = forwardRef<HTMLInputElement | HTMLTextAreaElement, BaseComposerProps>(
  function BaseComposer(
    {
      placeholder = 'Add something new...',
      value,
      onChange,
      onSubmit,
      isSubmitting = false,
      hasAI = false,
      onAIClick,
      isAILoading = false,
      accentColor = 'var(--color-primary)',
      icon,
      children,
      expanded = false,
      onExpandedChange,
      className,
      autoFocus = false,
      minRows = 2,
      maxRows = 6,
      showSubmitButton = true,
      variant = 'default',
    },
    ref
  ) {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    // Merge refs
    useEffect(() => {
      if (ref && typeof ref === 'function') {
        ref(inputRef.current);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>).current = inputRef.current;
      }
    }, [ref]);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !expanded) {
        e.preventDefault();
        if (value.trim() && !isSubmitting) {
          onSubmit();
        }
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
      if (onExpandedChange && !expanded) {
        onExpandedChange(true);
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      // Don't collapse if there's content
      if (onExpandedChange && expanded && !value.trim()) {
        onExpandedChange(false);
      }
    };

    const variantClasses = {
      default: 'bg-surface-elevated/80 backdrop-blur-sm border border-border shadow-sm',
      minimal: 'bg-transparent border-b border-border',
      outlined: 'bg-transparent border-2 border-border',
    };

    const focusedClasses = isFocused
      ? 'ring-2 ring-offset-2 ring-offset-background'
      : '';

    const IconComponent = icon || <Plus className="h-5 w-5" />;

    return (
      <div
        className={cn(
          'rounded-xl transition-all duration-200',
          variantClasses[variant],
          focusedClasses,
          className
        )}
        style={{
          '--tw-ring-color': isFocused ? accentColor : undefined,
        } as React.CSSProperties}
      >
        <div className="flex items-start gap-3 p-3">
          {/* Left Icon */}
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 transition-colors"
            style={{
              backgroundColor: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
              color: accentColor,
            }}
          >
            {IconComponent}
          </div>

          {/* Input Area */}
          <div className="flex-1 min-w-0">
            {expanded ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                autoFocus={autoFocus}
                rows={minRows}
                className="w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                style={{ maxHeight: `${maxRows * 1.5}rem` }}
              />
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className="w-full h-10 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* AI Button */}
            {hasAI && onAIClick && (
              <button
                type="button"
                onClick={onAIClick}
                disabled={isAILoading || !value.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                title="Enhance with AI"
              >
                {isAILoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <Sparkles
                    className="h-5 w-5"
                    style={{ color: value.trim() ? accentColor : undefined }}
                  />
                )}
              </button>
            )}

            {/* Submit Button */}
            {showSubmitButton && (
              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting || !value.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: value.trim() ? accentColor : 'var(--color-muted)',
                  color: value.trim() ? 'white' : 'var(--color-muted-foreground)',
                }}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Additional Content (tags, options, etc.) */}
        {children && (
          <div className="px-3 pb-3 pt-0 border-t border-border/50">
            {children}
          </div>
        )}
      </div>
    );
  }
);

export type { BaseComposerProps };
