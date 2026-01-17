/**
 * Checklist Utilities
 *
 * Helper functions for managing nested checklist items with
 * indentation, parent/child relationships, and completion cascading.
 *
 * @module @ainexsuite/ui/components/checklist/checklist-utils
 */

import type { ChecklistItem } from "@ainexsuite/types";

// Constants
export const INDENT_WIDTH = 18; // Pixels per indent level
export const MAX_INDENT_LEVEL = 3; // Maximum nesting depth

/**
 * Find parent index (first item above with lower indent level)
 * @param items The list of checklist items
 * @param index The index of the current item
 * @returns The index of the parent item, or null if no parent
 */
export function findParentIndex(
  items: ChecklistItem[],
  index: number
): number | null {
  const currentIndent = items[index].indent ?? 0;
  if (currentIndent === 0) return null;

  for (let i = index - 1; i >= 0; i--) {
    const itemIndent = items[i].indent ?? 0;
    if (itemIndent < currentIndent) return i;
  }
  return null;
}

/**
 * Find direct children indices (items below with indent = parent + 1)
 * @param items The list of checklist items
 * @param parentIndex The index of the parent item
 * @returns Array of indices of direct children
 */
export function findChildrenIndices(
  items: ChecklistItem[],
  parentIndex: number
): number[] {
  const parentIndent = items[parentIndex].indent ?? 0;
  const childIndent = parentIndent + 1;
  const children: number[] = [];

  for (let i = parentIndex + 1; i < items.length; i++) {
    const itemIndent = items[i].indent ?? 0;
    if (itemIndent <= parentIndent) break;
    if (itemIndent === childIndent) children.push(i);
  }
  return children;
}

/**
 * Get all descendant indices (children, grandchildren, etc.)
 * @param items The list of checklist items
 * @param parentIndex The index of the parent item
 * @returns Array of indices of all descendants
 */
export function getSubtreeIndices(
  items: ChecklistItem[],
  parentIndex: number
): number[] {
  const parentIndent = items[parentIndex].indent ?? 0;
  const descendants: number[] = [];

  for (let i = parentIndex + 1; i < items.length; i++) {
    const itemIndent = items[i].indent ?? 0;
    if (itemIndent <= parentIndent) break;
    descendants.push(i);
  }
  return descendants;
}

/**
 * Get the full subtree as items (parent + all descendants)
 * @param items The list of checklist items
 * @param parentIndex The index of the parent item
 * @returns Array of items including parent and all descendants
 */
export function getSubtree(
  items: ChecklistItem[],
  parentIndex: number
): ChecklistItem[] {
  const descendantIndices = getSubtreeIndices(items, parentIndex);
  return [items[parentIndex], ...descendantIndices.map(i => items[i])];
}

/**
 * Check if item has any children
 * @param items The list of checklist items
 * @param index The index of the item to check
 * @returns True if the item has children
 */
export function hasChildren(
  items: ChecklistItem[],
  index: number
): boolean {
  if (index >= items.length - 1) return false;
  const currentIndent = items[index].indent ?? 0;
  const nextIndent = items[index + 1]?.indent ?? 0;
  return nextIndent > currentIndent;
}

/**
 * Get completion stats for all descendants
 * @param items The list of checklist items
 * @param parentIndex The index of the parent item
 * @returns Object with completed and total counts
 */
export function getChildrenCompletionStats(
  items: ChecklistItem[],
  parentIndex: number
): { completed: number; total: number } {
  const descendantIndices = getSubtreeIndices(items, parentIndex);
  const total = descendantIndices.length;
  const completed = descendantIndices.filter(i => items[i].completed).length;
  return { completed, total };
}

/**
 * Check if an item can be indented (moved right)
 * @param items The list of checklist items
 * @param index The index of the item
 * @returns True if the item can be indented
 */
export function canIndent(
  items: ChecklistItem[],
  index: number
): boolean {
  if (index === 0) return false; // First item can't be indented
  const currentIndent = items[index].indent ?? 0;
  const prevIndent = items[index - 1].indent ?? 0;
  // Can indent if not at max and previous item is at same or higher level
  return currentIndent < MAX_INDENT_LEVEL && currentIndent <= prevIndent;
}

/**
 * Check if an item can be unindented (moved left)
 * @param items The list of checklist items
 * @param index The index of the item
 * @returns True if the item can be unindented
 */
export function canUnindent(
  items: ChecklistItem[],
  index: number
): boolean {
  const currentIndent = items[index].indent ?? 0;
  return currentIndent > 0;
}

/**
 * Move subtree (parent + all descendants) to new position
 * @param items The list of checklist items
 * @param fromIndex The current index of the parent
 * @param toIndex The target index
 * @returns New array with the subtree moved
 */
export function moveSubtree(
  items: ChecklistItem[],
  fromIndex: number,
  toIndex: number
): ChecklistItem[] {
  const subtree = getSubtree(items, fromIndex);
  const subtreeSize = subtree.length;

  // Remove subtree from original position
  const withoutSubtree = [
    ...items.slice(0, fromIndex),
    ...items.slice(fromIndex + subtreeSize)
  ];

  // Calculate adjusted target index
  let adjustedToIndex = toIndex;
  if (toIndex > fromIndex) {
    adjustedToIndex = toIndex - subtreeSize;
  }

  // If dropping after an item, we need to insert after that item's subtree
  if (adjustedToIndex < withoutSubtree.length) {
    const targetIndent = withoutSubtree[adjustedToIndex]?.indent ?? 0;

    // Find the end of the target's subtree
    let insertIndex = adjustedToIndex + 1;
    while (insertIndex < withoutSubtree.length) {
      const nextIndent = withoutSubtree[insertIndex].indent ?? 0;
      if (nextIndent <= targetIndent) break;
      insertIndex++;
    }
    adjustedToIndex = insertIndex;
  }

  // Insert subtree at new position
  return [
    ...withoutSubtree.slice(0, adjustedToIndex),
    ...subtree,
    ...withoutSubtree.slice(adjustedToIndex)
  ];
}

/**
 * Remove subtree (parent + all descendants)
 * @param items The list of checklist items
 * @param parentIndex The index of the parent to remove
 * @returns New array without the subtree
 */
export function removeSubtree(
  items: ChecklistItem[],
  parentIndex: number
): ChecklistItem[] {
  const subtreeSize = getSubtree(items, parentIndex).length;
  return [
    ...items.slice(0, parentIndex),
    ...items.slice(parentIndex + subtreeSize)
  ];
}

/**
 * Group items into subtrees (top-level parents with their children)
 * @param items The list of checklist items
 * @returns Array of subtrees
 */
export function groupIntoSubtrees(items: ChecklistItem[]): ChecklistItem[][] {
  const subtrees: ChecklistItem[][] = [];
  let i = 0;

  while (i < items.length) {
    const item = items[i];
    if ((item.indent ?? 0) === 0) {
      // Top-level item - collect it and all descendants
      const subtree = getSubtree(items, i);
      subtrees.push(subtree);
      i += subtree.length;
    } else {
      // Orphaned child (shouldn't happen, but handle gracefully)
      subtrees.push([item]);
      i++;
    }
  }

  return subtrees;
}

/**
 * Cascade completion status to parent checkboxes
 * Uses all-children logic: parent completes when ALL children complete
 *
 * IMPORTANT: This function modifies items in place. Ensure the items
 * array is already a clone of state to avoid React state mutation issues.
 * @param items The list of checklist items (should be a cloned array)
 * @param index The index of the item that changed
 * @param completed The new completion status
 */
export function cascadeCompletionStatus(
  items: ChecklistItem[],
  index: number,
  completed: boolean
): void {
  const parentIdx = findParentIndex(items, index);
  if (parentIdx === null) return;

  if (completed) {
    // Check if ALL children are now complete
    const childIndices = findChildrenIndices(items, parentIdx);
    const allChildrenComplete = childIndices.every(i => items[i].completed);

    if (allChildrenComplete) {
      // Clone the item instead of mutating to preserve React state immutability
      items[parentIdx] = { ...items[parentIdx], completed: true };
      cascadeCompletionStatus(items, parentIdx, true);
    }
  } else {
    // Unchecking any child unchecks parent
    if (items[parentIdx].completed) {
      // Clone the item instead of mutating to preserve React state immutability
      items[parentIdx] = { ...items[parentIdx], completed: false };
      cascadeCompletionStatus(items, parentIdx, false);
    }
  }
}

/**
 * Check if any ancestor is collapsed (for visibility filtering)
 * @param items The list of checklist items
 * @param index The index of the item to check
 * @returns True if any ancestor is collapsed
 */
export function isHiddenByCollapsedAncestor(
  items: ChecklistItem[],
  index: number
): boolean {
  let currentIndex = index;

  // Walk up the tree checking for collapsed ancestors
  for (let i = 0; i < items.length; i++) {
    const parentIdx = findParentIndex(items, currentIndex);
    if (parentIdx === null) return false;
    if (items[parentIdx].collapsed) return true;
    currentIndex = parentIdx;
  }
  return false;
}

/**
 * Check if dropping at target would create invalid hierarchy
 * (e.g., dropping parent inside its own subtree)
 * @param items The list of checklist items
 * @param dragIndex The index of the dragged item
 * @param dropIndex The target drop index
 * @returns True if the drop target is invalid
 */
export function isInvalidDropTarget(
  items: ChecklistItem[],
  dragIndex: number,
  dropIndex: number
): boolean {
  const subtreeIndices = getSubtreeIndices(items, dragIndex);
  return subtreeIndices.includes(dropIndex);
}

/**
 * Get priority order for sorting (lower = higher priority)
 * high=1, medium=2, low=3, none=4
 * @param priority The priority value
 * @returns Numeric priority order
 */
export function getPriorityOrder(priority: ChecklistItem["priority"]): number {
  switch (priority) {
    case "high":
      return 1;
    case "medium":
      return 2;
    case "low":
      return 3;
    default:
      return 4;
  }
}

/**
 * Get the earliest due date in a subtree (parent + all children)
 * @param subtree Array of items in the subtree
 * @returns The earliest due date or null
 */
export function getSubtreeEarliestDueDate(
  subtree: ChecklistItem[]
): string | null {
  let earliest: string | null = null;
  for (const item of subtree) {
    if (item.dueDate) {
      if (!earliest || item.dueDate < earliest) {
        earliest = item.dueDate;
      }
    }
  }
  return earliest;
}

/**
 * Get the highest priority in a subtree (parent + all children)
 * @param subtree Array of items in the subtree
 * @returns Priority order (1=high, 2=medium, 3=low, 4=none)
 */
export function getSubtreeHighestPriority(subtree: ChecklistItem[]): number {
  let highestPriority = 4; // none
  for (const item of subtree) {
    const itemPriority = getPriorityOrder(item.priority);
    if (itemPriority < highestPriority) {
      highestPriority = itemPriority;
    }
  }
  return highestPriority;
}

/**
 * Sort subtrees by priority, then due date
 * Parents inherit highest priority and earliest due date from children
 * Order: Priority (high>med>low>none) -> Due date (earlier first) -> Original order
 * @param subtrees Array of subtrees to sort
 * @returns Sorted array of subtrees
 */
export function sortSubtreesByPriority(
  subtrees: ChecklistItem[][]
): ChecklistItem[][] {
  return [...subtrees].sort((a, b) => {
    // Get effective values for each subtree (considering all children)
    const aPriority = getSubtreeHighestPriority(a);
    const bPriority = getSubtreeHighestPriority(b);

    // 1. Sort by priority first (lower number = higher priority)
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // 2. Sort by due date (earlier first, with-date before no-date)
    const aDueDate = getSubtreeEarliestDueDate(a);
    const bDueDate = getSubtreeEarliestDueDate(b);

    if (aDueDate && !bDueDate) return -1;
    if (!aDueDate && bDueDate) return 1;
    if (aDueDate && bDueDate) {
      if (aDueDate < bDueDate) return -1;
      if (aDueDate > bDueDate) return 1;
    }

    // 3. Maintain original order
    return 0;
  });
}
