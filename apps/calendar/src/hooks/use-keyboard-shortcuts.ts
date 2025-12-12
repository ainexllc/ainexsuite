'use client';

import { useEffect, useCallback, useState } from 'react';
import { CalendarViewType } from '@/components/calendar/calendar-header';

interface KeyboardShortcutHandlers {
  onNewEvent?: () => void;
  onToday?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onViewChange?: (view: CalendarViewType) => void;
  onCloseComposer?: () => void;
  onToggleSearch?: () => void;
}

interface UseKeyboardShortcutsReturn {
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers): UseKeyboardShortcutsReturn {
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      // Only allow Escape in input fields
      if (event.key === 'Escape') {
        handlers.onCloseComposer?.();
        (target as HTMLInputElement).blur();
      }
      return;
    }

    // Handle keyboard shortcuts
    switch (event.key) {
      case 'n':
      case 'N':
        if (!event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          handlers.onNewEvent?.();
        }
        break;

      case 't':
      case 'T':
        if (!event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          handlers.onToday?.();
        }
        break;

      case 'm':
      case 'M':
        if (!event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          handlers.onViewChange?.('month');
        }
        break;

      case 'w':
      case 'W':
        if (!event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          handlers.onViewChange?.('week');
        }
        break;

      case 'd':
      case 'D':
        if (!event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          handlers.onViewChange?.('day');
        }
        break;

      case 'a':
      case 'A':
        if (!event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          handlers.onViewChange?.('agenda');
        }
        break;

      case 'ArrowLeft':
        if (!event.metaKey && !event.ctrlKey && !event.shiftKey) {
          event.preventDefault();
          handlers.onPrev?.();
        }
        break;

      case 'ArrowRight':
        if (!event.metaKey && !event.ctrlKey && !event.shiftKey) {
          event.preventDefault();
          handlers.onNext?.();
        }
        break;

      case 'Escape':
        event.preventDefault();
        handlers.onCloseComposer?.();
        setShowHelp(false);
        break;

      case '?':
        event.preventDefault();
        setShowHelp(prev => !prev);
        break;

      case '/':
        if (!event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          handlers.onToggleSearch?.();
        }
        break;
    }
  }, [handlers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { showHelp, setShowHelp };
}

// Keyboard shortcuts help data
export const KEYBOARD_SHORTCUTS = [
  { key: 'N', description: 'New event' },
  { key: 'T', description: 'Go to today' },
  { key: 'M', description: 'Month view' },
  { key: 'W', description: 'Week view' },
  { key: 'D', description: 'Day view' },
  { key: 'A', description: 'Agenda view' },
  { key: '←', description: 'Previous period' },
  { key: '→', description: 'Next period' },
  { key: '/', description: 'Search' },
  { key: 'Esc', description: 'Close / Cancel' },
  { key: '?', description: 'Show shortcuts' },
];
