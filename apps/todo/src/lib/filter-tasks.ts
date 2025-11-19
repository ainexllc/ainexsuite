import type { TodoTask } from '@ainexsuite/types';
import type { TaskFilterOptions } from '@/components/task-filters';

export function filterTasks(tasks: TodoTask[], filters: TaskFilterOptions): TodoTask[] {
  let filtered = [...tasks];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();
  const todayEnd = todayStart + 86400000; // 24 hours

  // Get start of week (Sunday)
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekStartTime = weekStart.getTime();
  const weekEndTime = weekStartTime + 7 * 86400000;

  // Get start of month
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStartTime = monthStart.getTime();
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const monthEndTime = monthEnd.getTime() + 86400000;

  // Apply view filter first
  switch (filters.viewFilter) {
    case 'inbox':
      // Tasks without a due date and not completed
      filtered = filtered.filter((t) => !t.completed && !t.dueDate);
      break;
    case 'today':
      // Tasks due today
      filtered = filtered.filter(
        (t) => !t.completed && t.dueDate && t.dueDate >= todayStart && t.dueDate < todayEnd
      );
      break;
    case 'upcoming':
      // Tasks due after today
      filtered = filtered.filter((t) => !t.completed && t.dueDate && t.dueDate >= todayEnd);
      break;
    case 'completed':
      // Only completed tasks
      filtered = filtered.filter((t) => t.completed);
      break;
    case 'all':
    default:
      // All tasks (completed or not, based on showCompleted filter)
      if (!filters.showCompleted) {
        filtered = filtered.filter((t) => !t.completed);
      }
      break;
  }

  // Apply search query
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.subtasks?.some((st) => st.title.toLowerCase().includes(query))
    );
  }

  // Apply priority filter
  if (filters.priorityFilter !== 'all') {
    filtered = filtered.filter((task) => task.priority === filters.priorityFilter);
  }

  // Apply date range filter
  switch (filters.dateRange) {
    case 'overdue':
      filtered = filtered.filter((t) => t.dueDate && t.dueDate < todayStart && !t.completed);
      break;
    case 'today':
      filtered = filtered.filter(
        (t) => t.dueDate && t.dueDate >= todayStart && t.dueDate < todayEnd
      );
      break;
    case 'week':
      filtered = filtered.filter(
        (t) => t.dueDate && t.dueDate >= weekStartTime && t.dueDate < weekEndTime
      );
      break;
    case 'month':
      filtered = filtered.filter(
        (t) => t.dueDate && t.dueDate >= monthStartTime && t.dueDate < monthEndTime
      );
      break;
    case 'all':
    default:
      // No date filter
      break;
  }

  // Apply show completed filter (only if not in completed view)
  if (filters.viewFilter !== 'completed' && !filters.showCompleted) {
    filtered = filtered.filter((t) => !t.completed);
  }

  return filtered;
}

export function getTaskCounts(tasks: TodoTask[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();
  const todayEnd = todayStart + 86400000;

  return {
    all: tasks.filter((t) => !t.completed).length,
    inbox: tasks.filter((t) => !t.completed && !t.dueDate).length,
    today: tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate >= todayStart && t.dueDate < todayEnd
    ).length,
    upcoming: tasks.filter((t) => !t.completed && t.dueDate && t.dueDate >= todayEnd).length,
    completed: tasks.filter((t) => t.completed).length,
  };
}
