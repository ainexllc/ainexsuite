import type { ChecklistItem } from "@/lib/types/note";

/**
 * Find parent index (first item above with lower indent level)
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
 * Move subtree (parent + all descendants) to new position
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
 * IMPORTANT: This function clones items instead of mutating in place
 * to avoid React state mutation issues. When called from handleChecklistChange,
 * the `items` array is a new array but contains references to the previous
 * state's objects. Mutating those objects would corrupt the previous state.
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
 */
export function isHiddenByCollapsedAncestor(
  items: ChecklistItem[],
  index: number
): boolean {
  let currentIndex = index;

  // Walk up the tree checking for collapsed ancestors
  // Limit iterations to prevent infinite loops (max indent depth is typically small)
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
 * Returns null if no items have due dates
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
 * Returns the lowest priority order number (1=high, 2=medium, 3=low, 4=none)
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
 * Order: Priority (high>med>low>none) → Due date (earlier first) → Original order
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
