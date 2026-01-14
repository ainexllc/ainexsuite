"use client";

import { useCallback, useRef } from "react";
import type { ChecklistItem } from "@/lib/types/note";
import { generateUUID } from "@ainexsuite/ui";
import {
  cascadeCompletionStatus,
  getSubtreeIndices,
  groupIntoSubtrees,
  sortSubtreesByPriority,
} from "@/lib/utils/checklist-utils";
import type { ChecklistActionType } from "./use-checklist-history";

/**
 * Creates a new checklist item template
 */
export const checklistTemplate = (): ChecklistItem => ({
  id: generateUUID(),
  text: "",
  completed: false,
});

/**
 * Contextual placeholder examples for checklist items
 */
export const getChecklistPlaceholder = (index: number): string => {
  const examples = [
    "Add item...",
    "e.g., Milk",
    "e.g., Pick up dry cleaning",
    "e.g., Call mom",
    "e.g., Bread",
    "e.g., Eggs",
  ];
  return examples[index % examples.length];
};

export interface UseChecklistHandlersOptions {
  /**
   * Push to history before making changes (for undo/redo support)
   */
  onHistoryPush?: (items: ChecklistItem[], action: ChecklistActionType) => void;

  /**
   * Whether to auto-sort completed items to the bottom
   */
  autoSortCompleted?: boolean;

  /**
   * Whether to track completedAt timestamps
   */
  trackCompletedAt?: boolean;

  /**
   * Callback when all checklist items are completed (for celebration animation)
   */
  onAllComplete?: () => void;
}

export interface ChecklistHandlers {
  /**
   * Update a checklist item with partial changes
   */
  handleChecklistChange: (itemId: string, updates: Partial<ChecklistItem>) => void;

  /**
   * Add a new checklist item, optionally after a specific index with inherited indent
   */
  handleAddChecklistItem: (afterIndex?: number, inheritIndent?: number) => void;

  /**
   * Remove a checklist item by ID
   */
  handleRemoveChecklistItem: (itemId: string) => void;

  /**
   * Change the indent level of an item
   */
  handleIndentChange: (itemId: string, delta: number) => void;

  /**
   * Toggle completion for an item and all its children (Shift+click)
   */
  handleBulkToggle: (itemId: string, idx: number) => void;

  /**
   * Toggle collapsed state for a parent item
   */
  handleToggleCollapsed: (itemId: string) => void;

  /**
   * Ref for tracking which item to focus after add
   */
  pendingFocusId: React.RefObject<string | null>;
}

/**
 * Shared checklist handlers for NoteComposer and NoteEditor
 *
 * This hook extracts all checklist manipulation logic into a single reusable place.
 * Both components can use the same handlers while the hook handles differences
 * like history tracking and auto-sorting through options.
 */
export function useChecklistHandlers(
  checklist: ChecklistItem[],
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>,
  options: UseChecklistHandlersOptions = {}
): ChecklistHandlers {
  const {
    onHistoryPush,
    autoSortCompleted = false,
    trackCompletedAt = false,
    onAllComplete,
  } = options;

  const pendingFocusId = useRef<string | null>(null);

  /**
   * Update a checklist item with partial changes
   * Handles: cascading completion, completedAt timestamps, auto-sorting
   */
  const handleChecklistChange = useCallback(
    (itemId: string, updates: Partial<ChecklistItem>) => {
      setChecklist((prev) => {
        // Push to history before making changes (for undo/redo)
        if (onHistoryPush) {
          const actionType = updates.completed !== undefined ? "toggle" : "edit";
          onHistoryPush(prev, actionType);
        }

        const now = Date.now();

        // Update the item
        const updated = prev.map((item) => {
          if (item.id === itemId) {
            const newItem = { ...item, ...updates };

            // Track completedAt timestamps if enabled
            if (trackCompletedAt && updates.completed !== undefined) {
              if (updates.completed === true) {
                newItem.completedAt = now;
              } else {
                newItem.completedAt = null;
              }
            }

            return newItem;
          }
          return item;
        });

        // Cascade completion status to parent checkboxes
        if (updates.completed !== undefined) {
          const itemIndex = updated.findIndex((item) => item.id === itemId);
          if (itemIndex !== -1) {
            cascadeCompletionStatus(updated, itemIndex, updates.completed);

            // Also set completedAt for cascaded items if tracking
            if (trackCompletedAt) {
              updated.forEach((item, idx) => {
                if (item.completed && !item.completedAt) {
                  updated[idx] = { ...item, completedAt: now };
                } else if (!item.completed && item.completedAt) {
                  updated[idx] = { ...item, completedAt: null };
                }
              });
            }
          }
        }

        // Auto-sort if enabled (triggered by completed, priority, or due date changes)
        const shouldSort = autoSortCompleted && (
          updates.completed !== undefined || updates.priority !== undefined || updates.dueDate !== undefined
        );

        let result: ChecklistItem[];

        if (shouldSort) {
          const subtrees = groupIntoSubtrees(updated);
          const uncompleted = subtrees.filter((tree) => !tree[0].completed);
          const completed = subtrees.filter((tree) => tree[0].completed);

          // Sort uncompleted subtrees by priority (high > medium > low > none)
          const sortedUncompleted = sortSubtreesByPriority(uncompleted);

          // Sort completed subtrees by completedAt (most recent first)
          if (trackCompletedAt) {
            completed.sort((a, b) => {
              const aTime = a[0].completedAt ?? 0;
              const bTime = b[0].completedAt ?? 0;
              return bTime - aTime;
            });
          }

          result = [...sortedUncompleted.flat(), ...completed.flat()];
        } else {
          result = updated;
        }

        // Fire celebration if all items are now complete (and user just completed something)
        if (updates.completed === true && onAllComplete) {
          const allComplete = result.length > 0 && result.every((item) => item.completed);
          if (allComplete) {
            // Delay slightly so UI updates first
            setTimeout(() => onAllComplete(), 100);
          }
        }

        return result;
      });
    },
    [setChecklist, onHistoryPush, autoSortCompleted, trackCompletedAt, onAllComplete]
  );

  /**
   * Add a new checklist item
   * - If afterIndex is provided: inserts after that index
   * - Otherwise: appends to end (or before completed items if auto-sort enabled)
   */
  const handleAddChecklistItem = useCallback(
    (afterIndex?: number, inheritIndent?: number) => {
      const newItem = {
        ...checklistTemplate(),
        indent: inheritIndent ?? 0,
      };

      pendingFocusId.current = newItem.id;

      if (afterIndex !== undefined) {
        // Insert after specific index
        setChecklist((prev) => [
          ...prev.slice(0, afterIndex + 1),
          newItem,
          ...prev.slice(afterIndex + 1),
        ]);
      } else if (autoSortCompleted) {
        // Smart insert: before first completed top-level item
        setChecklist((prev) => {
          const firstCompletedTopLevelIndex = prev.findIndex(
            (item) => item.completed && (item.indent ?? 0) === 0
          );

          if (firstCompletedTopLevelIndex !== -1) {
            return [
              ...prev.slice(0, firstCompletedTopLevelIndex),
              newItem,
              ...prev.slice(firstCompletedTopLevelIndex),
            ];
          }

          return [...prev, newItem];
        });
      } else {
        // Simple append
        setChecklist((prev) => [...prev, newItem]);
      }
    },
    [setChecklist, autoSortCompleted]
  );

  /**
   * Remove a checklist item by ID
   */
  const handleRemoveChecklistItem = useCallback(
    (itemId: string) => {
      setChecklist((prev) => prev.filter((item) => item.id !== itemId));
    },
    [setChecklist]
  );

  /**
   * Change the indent level of an item (Tab/Shift+Tab)
   */
  const handleIndentChange = useCallback(
    (itemId: string, delta: number) => {
      setChecklist((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            const currentIndent = item.indent ?? 0;
            const newIndent = Math.max(0, Math.min(3, currentIndent + delta));
            return { ...item, indent: newIndent };
          }
          return item;
        })
      );
    },
    [setChecklist]
  );

  /**
   * Toggle completion for an item and all its children (Shift+click)
   */
  const handleBulkToggle = useCallback(
    (itemId: string, idx: number) => {
      setChecklist((prev) => {
        const item = prev[idx];
        const newCompleted = !item.completed;
        const subtreeIndices = [idx, ...getSubtreeIndices(prev, idx)];
        const now = Date.now();

        const updated = prev.map((it, i) => {
          if (subtreeIndices.includes(i)) {
            const newItem = { ...it, completed: newCompleted };
            if (trackCompletedAt) {
              newItem.completedAt = newCompleted ? now : null;
            }
            return newItem;
          }
          return it;
        });

        // Auto-sort if enabled (priority + completed)
        let result: ChecklistItem[];
        if (autoSortCompleted) {
          const subtrees = groupIntoSubtrees(updated);
          const uncompleted = subtrees.filter((tree) => !tree[0].completed);
          const completed = subtrees.filter((tree) => tree[0].completed);

          // Sort uncompleted by priority
          const sortedUncompleted = sortSubtreesByPriority(uncompleted);

          result = [...sortedUncompleted.flat(), ...completed.flat()];
        } else {
          result = updated;
        }

        // Fire celebration if all items are now complete
        if (newCompleted && onAllComplete) {
          const allComplete = result.length > 0 && result.every((it) => it.completed);
          if (allComplete) {
            setTimeout(() => onAllComplete(), 100);
          }
        }

        return result;
      });
    },
    [setChecklist, autoSortCompleted, trackCompletedAt, onAllComplete]
  );

  /**
   * Toggle collapsed state for a parent item
   */
  const handleToggleCollapsed = useCallback(
    (itemId: string) => {
      setChecklist((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, collapsed: !item.collapsed } : item
        )
      );
    },
    [setChecklist]
  );

  return {
    handleChecklistChange,
    handleAddChecklistItem,
    handleRemoveChecklistItem,
    handleIndentChange,
    handleBulkToggle,
    handleToggleCollapsed,
    pendingFocusId,
  };
}
