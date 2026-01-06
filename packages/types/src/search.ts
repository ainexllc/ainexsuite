/**
 * Universal Search Types
 * For cross-app search functionality
 */

// Helper to get base URL for each app
const getAppUrl = (subdomain: string, port: number): string => {
  // In production (or when explicitly set), use production domains
  const isProduction = process.env.NODE_ENV === 'production' ||
                       process.env.NEXT_PUBLIC_USE_PRODUCTION_URLS === 'true';

  if (isProduction) {
    return `https://${subdomain}.ainexspace.com`;
  }

  // Development: use .localhost with port
  return `http://${subdomain}.localhost:${port}`;
};

import { Note } from './note';
import { JournalEntry } from './journal';
import { Todo } from './todo';
import { Habit } from './habit';
import { Moment } from './moment';
import { LearningGoal } from './learning';
import { HealthMetric } from './health';
import { Workout } from './fitness';

/**
 * App types for search results
 */
export type SearchableApp =
  | 'notes'
  | 'journal'
  | 'todo'
  | 'health'
  | 'album'
  | 'habits'
  | 'display'
  | 'fit';

/**
 * Unified search result that can represent any app item
 */
export interface SearchResult {
  id: string;
  app: SearchableApp;
  type: string; // 'note', 'entry', 'task', 'habit', etc.
  title: string;
  content: string;
  metadata?: MetadataRecord;
  createdAt: number;
  updatedAt: number;
  url: string; // Deep link to the item
}

/**
 * Search query parameters
 */
export interface SearchQuery {
  query: string;
  apps?: SearchableApp[]; // Filter by specific apps
  limit?: number; // Max results per app
  sortBy?: 'relevance' | 'date';
}

/**
 * Search response with results grouped by app
 */
export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  appCounts: Record<SearchableApp, number>;
  query: string;
}

type MetadataPrimitive = string | number | boolean | null | undefined;
export type MetadataRecord = Record<string, MetadataPrimitive | MetadataPrimitive[]>;

/**
 * Type guards for app-specific items
 */
export function isNote(item: unknown): item is Note {
  return typeof item === 'object' && item !== null && 'colors' in item;
}

export function isJournalEntry(item: unknown): item is JournalEntry {
  return typeof item === 'object' && item !== null && 'mood' in item;
}

export function isTask(item: unknown): item is Todo {
  return typeof item === 'object' && item !== null && 'projectId' in item;
}

export function isHabit(item: unknown): item is Habit {
  return typeof item === 'object' && item !== null && 'frequency' in item;
}

export function isMoment(item: unknown): item is Moment {
  return typeof item === 'object' && item !== null && 'photoUrl' in item;
}

export function isLearningGoal(item: unknown): item is LearningGoal {
  return (
    typeof item === 'object' &&
    item !== null &&
    'currentLevel' in item &&
    'targetLevel' in item
  );
}

export function isHealthMetric(item: unknown): item is HealthMetric {
  return (
    typeof item === 'object' &&
    item !== null &&
    'date' in item &&
    'sleep' in item &&
    'water' in item
  );
}

export function isWorkout(item: unknown): item is Workout {
  return (
    typeof item === 'object' &&
    item !== null &&
    'exercises' in item &&
    'duration' in item
  );
}

/**
 * Convert app-specific items to unified search results
 */
export function noteToSearchResult(note: Note, id: string): SearchResult {
  return {
    id,
    app: 'notes',
    type: 'note',
    title: note.title,
    content: note.body,
    metadata: {
      color: note.color,
      labels: note.labels,
      isPinned: note.pinned,
    },
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    url: `${getAppUrl('notes', 3001)}?note=${id}`,
  };
}

export function journalToSearchResult(
  entry: JournalEntry,
  id: string
): SearchResult {
  return {
    id,
    app: 'journal',
    type: 'entry',
    title: new Date(entry.date).toLocaleDateString(),
    content: entry.content,
    metadata: {
      mood: entry.mood,
    },
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    url: `${getAppUrl('journal', 3002)}?entry=${id}`,
  };
}

export function taskToSearchResult(task: Todo, id: string): SearchResult {
  return {
    id,
    app: 'todo',
    type: 'task',
    title: task.title,
    content: task.description || '',
    metadata: {
      priority: task.priority,
      dueDate: task.dueDate,
      isCompleted: task.completed,
    },
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    url: `${getAppUrl('todo', 3003)}?task=${id}`,
  };
}

export function habitToSearchResult(habit: Habit, id: string): SearchResult {
  return {
    id,
    app: 'habits',
    type: 'habit',
    title: habit.name,
    content: habit.description || '',
    metadata: {
      frequency: habit.frequency,
      color: habit.color,
    },
    createdAt: habit.createdAt,
    updatedAt: habit.updatedAt,
    url: `${getAppUrl('habits', 3006)}?habit=${id}`,
  };
}

export function healthToSearchResult(
  metric: HealthMetric,
  id: string
): SearchResult {
  return {
    id,
    app: 'health',
    type: 'health_metric',
    title: `Health Check-in - ${metric.date}`,
    content: metric.notes || '',
    metadata: {
      weight: metric.weight,
      sleep: metric.sleep,
      water: metric.water,
      mood: metric.mood,
      energy: metric.energy,
    },
    createdAt: metric.createdAt,
    updatedAt: metric.updatedAt,
    url: `${getAppUrl('health', 3004)}`,
  };
}

export function momentToSearchResult(moment: Moment, id: string): SearchResult {
  return {
    id,
    app: 'album',
    type: 'moment',
    title: moment.title,
    content: moment.caption || '',
    metadata: {
      location: moment.location,
      tags: moment.tags,
      photoUrl: moment.photoUrl,
    },
    createdAt: moment.createdAt,
    updatedAt: moment.updatedAt,
    url: `${getAppUrl('album', 3005)}?moment=${id}`,
  };
}

export function learningGoalToSearchResult(
  goal: LearningGoal,
  id: string
): SearchResult {
  return {
    id,
    app: 'habits',
    type: 'goal',
    title: goal.title,
    content: goal.description || '',
    metadata: {
      currentLevel: goal.currentLevel,
      targetLevel: goal.targetLevel,
      targetDate: goal.targetDate,
    },
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
    url: `${getAppUrl('habits', 3006)}?goal=${id}`,
  };
}

export function healthMetricToSearchResult(
  metric: HealthMetric,
  id: string
): SearchResult {
  return {
    id,
    app: 'display',
    type: 'metric',
    title: `Health Metric - ${metric.date}`,
    content: metric.notes || '',
    metadata: {
      sleep: metric.sleep,
      water: metric.water,
      exercise: metric.exercise,
      mood: metric.mood,
    },
    createdAt: metric.createdAt,
    updatedAt: metric.updatedAt,
    url: `${getAppUrl('display', 3007)}`,
  };
}

export function workoutToSearchResult(
  workout: Workout,
  id: string
): SearchResult {
  return {
    id,
    app: 'fit',
    type: 'workout',
    title: workout.name,
    content: workout.notes || '',
    metadata: {
      duration: workout.duration,
      exerciseCount: workout.exercises.length,
    },
    createdAt: workout.createdAt,
    updatedAt: workout.createdAt, // Workout doesn't have updatedAt, use createdAt
    url: `${getAppUrl('fit', 3008)}?workout=${id}`,
  };
}
