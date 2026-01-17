import type { Task } from '../types/models';

/**
 * Sort tasks with completed items at the bottom.
 *
 * For parent-child relationships:
 * - Parents are sorted first (uncompleted, then completed)
 * - Subtasks within each parent follow the same pattern
 * - Completed items are sorted by completedAt timestamp (most recently completed last)
 * - Uncompleted items preserve their original order (by updatedAt or order)
 */

type SortableDate = Date | { toDate: () => Date } | string | number | undefined;

/**
 * Get timestamp from various date formats
 */
function getTime(date: SortableDate): number {
  if (!date) return 0;
  if (typeof date === 'number') return date;
  if (typeof date === 'string') return new Date(date).getTime();
  if (date instanceof Date) return date.getTime();
  if (typeof (date as { toDate: () => Date }).toDate === 'function') {
    return (date as { toDate: () => Date }).toDate().getTime();
  }
  return 0;
}

/**
 * Check if a task is completed
 */
function isCompleted(task: Task): boolean {
  return task.status === 'done';
}

/**
 * Sort tasks with completed at bottom.
 * - Uncompleted tasks: sorted by updatedAt (most recent first)
 * - Completed tasks: sorted by completedAt (most recently completed last)
 */
function sortByCompletedAtBottom(tasks: Task[]): Task[] {
  const uncompleted = tasks.filter((t) => !isCompleted(t));
  const completed = tasks.filter((t) => isCompleted(t));

  // Uncompleted: most recently updated first
  uncompleted.sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt));

  // Completed: oldest completed first, most recently completed last
  completed.sort((a, b) => {
    const aTime = a.completedAt || getTime(a.updatedAt);
    const bTime = b.completedAt || getTime(b.updatedAt);
    return aTime - bTime;
  });

  return [...uncompleted, ...completed];
}

/**
 * Sort a list of tasks with parent-child hierarchy.
 * Parents and their subtasks are kept together.
 * Within each group, uncompleted items come first, completed at bottom.
 */
export function sortTasksWithCompletedAtBottom(tasks: Task[]): Task[] {
  // Separate parent tasks (no parentId) from subtasks
  const parentTasks = tasks.filter((t) => !t.parentId);
  const subtasksByParent = new Map<string, Task[]>();

  // Group subtasks by parent
  tasks.forEach((task) => {
    if (task.parentId) {
      const existing = subtasksByParent.get(task.parentId) || [];
      existing.push(task);
      subtasksByParent.set(task.parentId, existing);
    }
  });

  // Sort parent tasks (uncompleted first, completed at bottom)
  const sortedParents = sortByCompletedAtBottom(parentTasks);

  // Build final list with each parent followed by its sorted subtasks
  const result: Task[] = [];

  sortedParents.forEach((parent) => {
    result.push(parent);
    const subtasks = subtasksByParent.get(parent.id);
    if (subtasks && subtasks.length > 0) {
      // Sort subtasks: uncompleted first, completed at bottom
      const sortedSubtasks = sortByCompletedAtBottom(subtasks);
      result.push(...sortedSubtasks);
    }
  });

  return result;
}

/**
 * Sort only parent tasks (excluding subtasks) with completed at bottom.
 * Useful when rendering just the parent level.
 */
export function sortParentTasksWithCompletedAtBottom(tasks: Task[]): Task[] {
  const parentTasks = tasks.filter((t) => !t.parentId);
  return sortByCompletedAtBottom(parentTasks);
}

/**
 * Sort subtasks for a given parent with completed at bottom.
 */
export function sortSubtasksWithCompletedAtBottom(subtasks: Task[]): Task[] {
  return sortByCompletedAtBottom(subtasks);
}
