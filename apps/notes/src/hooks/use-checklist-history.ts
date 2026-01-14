'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChecklistItem } from '@/lib/types/note';

// Action types for history tracking
export type ChecklistActionType =
  | 'toggle'
  | 'add'
  | 'delete'
  | 'reorder'
  | 'indent'
  | 'edit'
  | 'bulk';

// History entry with action metadata
interface HistoryEntry {
  checklist: ChecklistItem[];
  action: ChecklistActionType;
  timestamp: number;
}

// Hook return interface
export interface UseChecklistHistoryReturn {
  undo: () => ChecklistItem[] | null;
  redo: () => ChecklistItem[] | null;
  canUndo: boolean;
  canRedo: boolean;
  pushHistory: (checklist: ChecklistItem[], action: ChecklistActionType) => void;
  clearHistory: () => void;
}

// Hook options
interface UseChecklistHistoryOptions {
  maxHistorySize?: number;
  onUndo?: (checklist: ChecklistItem[]) => void;
  onRedo?: (checklist: ChecklistItem[]) => void;
  enableKeyboardShortcuts?: boolean;
}

// Deep clone checklist to prevent reference issues
function cloneChecklist(checklist: ChecklistItem[]): ChecklistItem[] {
  return checklist.map((item) => ({ ...item }));
}

export function useChecklistHistory({
  maxHistorySize = 50,
  onUndo,
  onRedo,
  enableKeyboardShortcuts = true,
}: UseChecklistHistoryOptions = {}): UseChecklistHistoryReturn {
  // History stacks
  const [past, setPast] = useState<HistoryEntry[]>([]);
  const [future, setFuture] = useState<HistoryEntry[]>([]);
  const [present, setPresent] = useState<HistoryEntry | null>(null);

  // Refs for stable callbacks
  const onUndoRef = useRef(onUndo);
  const onRedoRef = useRef(onRedo);

  // Keep refs updated
  useEffect(() => {
    onUndoRef.current = onUndo;
    onRedoRef.current = onRedo;
  }, [onUndo, onRedo]);

  // Computed values
  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  // Push new state to history
  const pushHistory = useCallback(
    (checklist: ChecklistItem[], action: ChecklistActionType) => {
      const newEntry: HistoryEntry = {
        checklist: cloneChecklist(checklist),
        action,
        timestamp: Date.now(),
      };

      setPast((prevPast) => {
        // If we have a present state, add it to past
        const currentPresent = present;
        if (currentPresent) {
          const newPast = [...prevPast, currentPresent];
          // Trim to max size
          if (newPast.length > maxHistorySize) {
            return newPast.slice(-maxHistorySize);
          }
          return newPast;
        }
        return prevPast;
      });

      setPresent(newEntry);
      // Clear future when new action is taken
      setFuture([]);
    },
    [present, maxHistorySize]
  );

  // Undo action
  const undo = useCallback((): ChecklistItem[] | null => {
    if (past.length === 0) {
      return null;
    }

    const previousEntry = past[past.length - 1];
    const newPast = past.slice(0, -1);

    setPast(newPast);

    // Move current present to future
    if (present) {
      setFuture((prevFuture) => [present, ...prevFuture]);
    }

    setPresent(previousEntry);

    // Call callback with the restored state
    const restoredChecklist = cloneChecklist(previousEntry.checklist);
    onUndoRef.current?.(restoredChecklist);

    return restoredChecklist;
  }, [past, present]);

  // Redo action
  const redo = useCallback((): ChecklistItem[] | null => {
    if (future.length === 0) {
      return null;
    }

    const nextEntry = future[0];
    const newFuture = future.slice(1);

    setFuture(newFuture);

    // Move current present to past
    if (present) {
      setPast((prevPast) => [...prevPast, present]);
    }

    setPresent(nextEntry);

    // Call callback with the restored state
    const restoredChecklist = cloneChecklist(nextEntry.checklist);
    onRedoRef.current?.(restoredChecklist);

    return restoredChecklist;
  }, [future, present]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
    setPresent(null);
  }, []);

  // Keyboard shortcuts handler
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for undo: Cmd+Z / Ctrl+Z
      const isUndo =
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        event.key.toLowerCase() === 'z';

      // Check for redo: Cmd+Shift+Z / Ctrl+Y
      const isRedo =
        ((event.metaKey || event.ctrlKey) &&
          event.shiftKey &&
          event.key.toLowerCase() === 'z') ||
        ((event.metaKey || event.ctrlKey) &&
          !event.shiftKey &&
          event.key.toLowerCase() === 'y');

      // Don't intercept if inside an input/textarea (unless contentEditable)
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isTextInput = tagName === 'input' || tagName === 'textarea';

      // Allow undo/redo in contentEditable but not in regular inputs
      if (isTextInput) {
        return;
      }

      if (isUndo && canUndo) {
        event.preventDefault();
        event.stopPropagation();
        undo();
      } else if (isRedo && canRedo) {
        event.preventDefault();
        event.stopPropagation();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enableKeyboardShortcuts, canUndo, canRedo, undo, redo]);

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    pushHistory,
    clearHistory,
  };
}
