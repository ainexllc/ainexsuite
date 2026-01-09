'use client';

import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  modifiers?: {
    meta?: boolean;   // Cmd on Mac, Ctrl on Windows
    shift?: boolean;
    alt?: boolean;
  };
  action: () => void;
  description: string;
  category: 'navigation' | 'editing' | 'actions';
  label: string;
}

// Get the platform-specific modifier key
export const getModifierKey = () => {
  if (typeof window === 'undefined') return 'Ctrl';
  return navigator.platform.toLowerCase().includes('mac') ? 'Cmd' : 'Ctrl';
};

// Format shortcut for display
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];
  const mod = getModifierKey();

  if (shortcut.modifiers?.meta) parts.push(mod);
  if (shortcut.modifiers?.shift) parts.push('Shift');
  if (shortcut.modifiers?.alt) parts.push('Alt');

  // Format special keys
  const keyDisplay = shortcut.key === 'Escape' ? 'Esc' :
                     shortcut.key === 'ArrowUp' ? '↑' :
                     shortcut.key === 'ArrowDown' ? '↓' :
                     shortcut.key === 'ArrowLeft' ? '←' :
                     shortcut.key === 'ArrowRight' ? '→' :
                     shortcut.key === 'Enter' ? '↵' :
                     shortcut.key === 'Backspace' ? '⌫' :
                     shortcut.key.toUpperCase();

  parts.push(keyDisplay);
  return parts.join('+');
};

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs or textareas
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    const isEditable = target.isContentEditable;
    const isInput = tagName === 'input' || tagName === 'textarea' || isEditable;

    // Allow Escape in inputs
    if (isInput && event.key !== 'Escape') {
      return;
    }

    for (const shortcut of shortcutsRef.current) {
      const metaMatches = shortcut.modifiers?.meta
        ? (event.metaKey || event.ctrlKey)
        : !(event.metaKey || event.ctrlKey);
      const shiftMatches = shortcut.modifiers?.shift
        ? event.shiftKey
        : !event.shiftKey;
      const altMatches = shortcut.modifiers?.alt
        ? event.altKey
        : !event.altKey;

      if (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        metaMatches &&
        shiftMatches &&
        altMatches
      ) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.action();
        break;
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return {
    shortcuts: shortcutsRef.current,
    formatShortcut,
    getModifierKey,
  };
}
