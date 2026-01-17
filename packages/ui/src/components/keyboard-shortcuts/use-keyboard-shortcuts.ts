"use client";

import { useEffect, useCallback, useRef } from "react";

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  /** The key to trigger this shortcut */
  key: string;
  /** Modifier keys required */
  modifiers?: {
    /** Meta key (Cmd on Mac, Ctrl on Windows) */
    meta?: boolean;
    /** Shift key */
    shift?: boolean;
    /** Alt/Option key */
    alt?: boolean;
  };
  /** Callback to execute when shortcut is triggered */
  action: () => void;
  /** Description of what this shortcut does */
  description: string;
  /** Category for grouping in the help modal */
  category: "navigation" | "editing" | "actions";
  /** Short label for display */
  label: string;
}

/**
 * Get the platform-specific modifier key name
 * @returns "Cmd" on Mac, "Ctrl" on Windows/Linux
 */
export const getModifierKey = (): string => {
  if (typeof window === "undefined") return "Ctrl";
  return navigator.platform.toLowerCase().includes("mac") ? "Cmd" : "Ctrl";
};

/**
 * Format a shortcut for display
 * @param shortcut The shortcut to format
 * @returns Human-readable shortcut string like "Cmd+K"
 */
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];
  const mod = getModifierKey();

  if (shortcut.modifiers?.meta) parts.push(mod);
  if (shortcut.modifiers?.shift) parts.push("Shift");
  if (shortcut.modifiers?.alt) parts.push("Alt");

  // Format special keys
  const keyDisplay =
    shortcut.key === "Escape" ? "Esc" :
    shortcut.key === "ArrowUp" ? "↑" :
    shortcut.key === "ArrowDown" ? "↓" :
    shortcut.key === "ArrowLeft" ? "←" :
    shortcut.key === "ArrowRight" ? "→" :
    shortcut.key === "Enter" ? "↵" :
    shortcut.key === "Backspace" ? "⌫" :
    shortcut.key === "/" ? "/" :
    shortcut.key.toUpperCase();

  parts.push(keyDisplay);
  return parts.join("+");
};

export interface UseKeyboardShortcutsOptions {
  /** Array of shortcuts to register */
  shortcuts: KeyboardShortcut[];
  /** Whether shortcuts are enabled (default: true) */
  enabled?: boolean;
}

/**
 * Hook to register and manage keyboard shortcuts
 *
 * Features:
 * - Cross-platform support (Cmd/Ctrl)
 * - Ignores shortcuts when typing in inputs (except Escape)
 * - Prevents default browser behavior
 * - Easily enable/disable shortcuts
 *
 * @example
 * ```tsx
 * const { shortcuts, formatShortcut } = useKeyboardShortcuts({
 *   shortcuts: [
 *     {
 *       key: 'n',
 *       modifiers: { meta: true },
 *       action: () => createNewNote(),
 *       description: 'Create a new note',
 *       category: 'actions',
 *       label: 'New Note',
 *     },
 *   ],
 * });
 * ```
 */
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
    const isInput = tagName === "input" || tagName === "textarea" || isEditable;

    // Allow Escape in inputs (common pattern for closing modals/menus)
    if (isInput && event.key !== "Escape") {
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

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return {
    shortcuts: shortcutsRef.current,
    formatShortcut,
    getModifierKey,
  };
}

export default useKeyboardShortcuts;
