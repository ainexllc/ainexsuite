/**
 * Cross-App Context Aggregator
 * Gathers data from all apps to provide AI with comprehensive user context
 */

import { db } from './client';
import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
} from 'firebase/firestore';

/**
 * Get current user ID (temporary placeholder)
 * TODO: Replace with actual auth context
 */
function getCurrentUserId(): string {
  return 'test-user-id';
}

/**
 * Aggregate context from all apps
 */
export interface AppContext {
  notes: {
    total: number;
    pinned: number;
    recent: Array<{ title: string; content: string }>;
  };
  journal: {
    total: number;
    recentMood: string | null;
    weeklyEntries: number;
  };
  todo: {
    total: number;
    completed: number;
    overdue: number;
    todayTasks: Array<{ title: string; priority: string }>;
  };
  health: {
    total: number;
    recentMetrics: Array<{ type: string; value: number | string | null; date: number }>;
  };
  album: {
    total: number;
    recentTags: string[];
  };
  habits: {
    total: number;
    inProgress: Array<{ title: string; progress: number }>;
  };
  display: {
    latestMetrics: Array<{
      type: string;
      value: number | string | boolean | null;
      date: number;
    }>;
  };
  fit: {
    weeklyWorkouts: number;
    recentWorkouts: Array<{ name: string; duration: number }>;
  };
}

/**
 * Fetch aggregated context from all apps
 */
export async function getAggregatedContext(): Promise<AppContext> {
  const userId = getCurrentUserId();
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const today = new Date().setHours(0, 0, 0, 0);

  // Notes context
  const notesRef = collection(db, 'notes');
  const notesQuery = query(
    notesRef,
    where('ownerId', '==', userId),
    orderBy('updatedAt', 'desc'),
    firestoreLimit(5)
  );
  const notesSnapshot = await getDocs(notesQuery);
  const notes = {
    total: notesSnapshot.size,
    pinned: 0,
    recent: [] as Array<{ title: string; content: string }>,
  };
  notesSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.isPinned) notes.pinned++;
    if (notes.recent.length < 3) {
      notes.recent.push({
        title: data.title || 'Untitled',
        content: (data.content || '').substring(0, 100),
      });
    }
  });

  // Journal context
  const journalRef = collection(db, 'journal_entries');
  const journalQuery = query(
    journalRef,
    where('ownerId', '==', userId),
    orderBy('date', 'desc'),
    firestoreLimit(7)
  );
  const journalSnapshot = await getDocs(journalQuery);
  const journal = {
    total: journalSnapshot.size,
    recentMood: null as string | null,
    weeklyEntries: 0,
  };
  journalSnapshot.docs.forEach((doc, index) => {
    const data = doc.data();
    if (index === 0) journal.recentMood = data.mood;
    if (data.date >= weekAgo) journal.weeklyEntries++;
  });

  // Todo context
  const tasksRef = collection(db, 'tasks');
  const tasksQuery = query(
    tasksRef,
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc'),
    firestoreLimit(20)
  );
  const tasksSnapshot = await getDocs(tasksQuery);
  const todo = {
    total: 0,
    completed: 0,
    overdue: 0,
    todayTasks: [] as Array<{ title: string; priority: string }>,
  };
  tasksSnapshot.forEach((doc) => {
    const data = doc.data();
    todo.total++;
    if (data.isCompleted) todo.completed++;
    if (data.dueDate && data.dueDate < now && !data.isCompleted) todo.overdue++;
    if (data.dueDate && data.dueDate >= today && data.dueDate < today + 86400000) {
      todo.todayTasks.push({
        title: data.title,
        priority: data.priority,
      });
    }
  });

  // Health context
  const healthRef = collection(db, 'health_metrics');
  const healthQuery = query(
    healthRef,
    where('ownerId', '==', userId),
    orderBy('date', 'desc'),
    firestoreLimit(10)
  );
  const healthSnapshot = await getDocs(healthQuery);
  const health = {
    total: healthSnapshot.size,
    recentMetrics: [] as Array<{ type: string; value: number | string | null; date: number }>,
  };
  healthSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.weight) {
      health.recentMetrics.push({ type: 'weight', value: data.weight, date: data.date });
    }
    if (data.sleep) {
      health.recentMetrics.push({ type: 'sleep', value: data.sleep, date: data.date });
    }
  });

  // Album context (reads from 'moments' collection)
  const albumRef = collection(db, 'moments');
  const albumQuery = query(
    albumRef,
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc'),
    firestoreLimit(10)
  );
  const albumSnapshot = await getDocs(albumQuery);
  const album = {
    total: albumSnapshot.size,
    recentTags: [] as string[],
  };
  const tagSet = new Set<string>();
  albumSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.tags) {
      data.tags.forEach((tag: string) => tagSet.add(tag));
    }
  });
  album.recentTags = Array.from(tagSet).slice(0, 5);

  // Habits context (reads from 'learning_goals' collection)
  const goalsRef = collection(db, 'learning_goals');
  const goalsQuery = query(
    goalsRef,
    where('ownerId', '==', userId),
    orderBy('updatedAt', 'desc'),
    firestoreLimit(5)
  );
  const goalsSnapshot = await getDocs(goalsQuery);
  const habits = {
    total: goalsSnapshot.size,
    inProgress: [] as Array<{ title: string; progress: number }>,
  };
  goalsSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.progress < 100) {
      habits.inProgress.push({
        title: data.title,
        progress: data.progress,
      });
    }
  });

  // Display context (reads from 'health_metrics' collection)
  const metricsRef = collection(db, 'health_metrics');
  const metricsQuery = query(
    metricsRef,
    where('ownerId', '==', userId),
    orderBy('date', 'desc'),
    firestoreLimit(5)
  );
  const metricsSnapshot = await getDocs(metricsQuery);
  const display = {
    latestMetrics: [] as Array<{
      type: string;
      value: number | string | boolean | null;
      date: number;
    }>,
  };
  metricsSnapshot.forEach((doc) => {
    const data = doc.data();
    const metricValue = (data.value ?? null) as number | string | boolean | null;
    display.latestMetrics.push({
      type: data.metricType,
      value: metricValue,
      date: data.date,
    });
  });

  // Fit context
  const workoutsRef = collection(db, 'workouts');
  const workoutsQuery = query(
    workoutsRef,
    where('ownerId', '==', userId),
    orderBy('date', 'desc'),
    firestoreLimit(10)
  );
  const workoutsSnapshot = await getDocs(workoutsQuery);
  const fit = {
    weeklyWorkouts: 0,
    recentWorkouts: [] as Array<{ name: string; duration: number }>,
  };
  workoutsSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.date >= weekAgo) fit.weeklyWorkouts++;
    if (fit.recentWorkouts.length < 3) {
      fit.recentWorkouts.push({
        name: data.name,
        duration: data.duration || 0,
      });
    }
  });

  return {
    notes,
    journal,
    todo,
    health,
    album,
    habits,
    display,
    fit,
  };
}

/**
 * Format context for AI prompt
 */
export function formatContextForAI(context: AppContext): string {
  const parts: string[] = [];

  parts.push('## User Activity Summary\n');

  // Notes
  if (context.notes.total > 0) {
    parts.push(`**Notes**: ${context.notes.total} total notes, ${context.notes.pinned} pinned.`);
    if (context.notes.recent.length > 0) {
      parts.push(`Recent notes: ${context.notes.recent.map(n => n.title).join(', ')}`);
    }
  }

  // Journal
  if (context.journal.total > 0) {
    parts.push(
      `**Journal**: ${context.journal.weeklyEntries} entries this week.` +
      (context.journal.recentMood ? ` Latest mood: ${context.journal.recentMood}` : '')
    );
  }

  // Todo
  if (context.todo.total > 0) {
    parts.push(
      `**Tasks**: ${context.todo.total} total, ${context.todo.completed} completed, ${context.todo.overdue} overdue.` +
      (context.todo.todayTasks.length > 0
        ? ` ${context.todo.todayTasks.length} due today.`
        : '')
    );
  }

  // Health
  if (context.health.total > 0) {
    parts.push(`**Health**: ${context.health.total} health check-ins recorded.`);
    if (context.health.recentMetrics.length > 0) {
      const metrics = context.health.recentMetrics.slice(0, 3).map(m => `${m.type}: ${m.value}`).join(', ');
      parts.push(`Recent metrics: ${metrics}`);
    }
  }

  // Album
  if (context.album.total > 0) {
    parts.push(
      `**Album**: ${context.album.total} memories captured.` +
      (context.album.recentTags.length > 0
        ? ` Recent tags: ${context.album.recentTags.join(', ')}`
        : '')
    );
  }

  // Habits
  if (context.habits.inProgress.length > 0) {
    parts.push(
      `**Habits**: ${context.habits.inProgress.length} goals in progress (${context.habits.inProgress
        .map(g => `${g.title}: ${g.progress}%`)
        .join(', ')})`
    );
  }

  // Display
  if (context.display.latestMetrics.length > 0) {
    parts.push(`**Display**: Tracking ${context.display.latestMetrics.length} recent metrics.`);
  }

  // Fit
  if (context.fit.weeklyWorkouts > 0) {
    parts.push(`**Fitness**: ${context.fit.weeklyWorkouts} workouts this week.`);
  }

  return parts.join('\n');
}
