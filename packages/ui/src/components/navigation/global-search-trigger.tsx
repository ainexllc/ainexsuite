'use client';

import React, { useEffect, useState } from 'react';
import { Search, Command } from 'lucide-react';

/**
 * GlobalSearchTrigger Component
 *
 * A button that looks like a search input and triggers the command palette.
 * Shows a keyboard shortcut hint (Cmd+K on Mac, Ctrl+K on Windows).
 */

export interface GlobalSearchTriggerProps {
  /** Callback when the trigger is clicked */
  onClick: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Custom keyboard shortcut key (default: 'K') */
  shortcutKey?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
}

export function GlobalSearchTrigger({
  onClick,
  placeholder = 'Search...',
  shortcutKey = 'K',
  className = '',
  disabled = false,
}: GlobalSearchTriggerProps) {
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    // Detect platform for showing correct modifier key
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === shortcutKey.toLowerCase()) {
        e.preventDefault();
        if (!disabled) {
          onClick();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClick, shortcutKey, disabled]);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 rounded-full
        bg-foreground/5 hover:bg-foreground/10
        px-3 py-1.5 h-9
        text-sm text-muted-foreground
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
        disabled:opacity-50 disabled:cursor-not-allowed
        min-w-[140px] sm:min-w-[200px] md:min-w-[280px]
        ${className}
      `}
      aria-label={`Search, press ${isMac ? 'Command' : 'Control'}+${shortcutKey}`}
    >
      <Search className="h-4 w-4 shrink-0" aria-hidden />
      <span className="flex-1 text-left truncate">{placeholder}</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-foreground/10 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
        {isMac ? (
          <Command className="h-3 w-3" aria-hidden />
        ) : (
          <span>Ctrl</span>
        )}
        <span>{shortcutKey}</span>
      </kbd>
    </button>
  );
}
