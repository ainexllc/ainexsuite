import { db } from '@ainexsuite/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import type { Note, NoteColor, NotePriority, ChecklistItem } from './notes-service';
import { listSpaces, listLabels } from './notes-service';

// ============================================
// TYPES
// ============================================

export interface NoteStatistics {
  totalNotes: number;
  textNotes: number;
  checklistNotes: number;
  archivedNotes: number;
  trashedNotes: number;
  pinnedNotes: number;
  colorDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  topLabels: Array<{ id: string; name: string; count: number }>;
  createdThisPeriod: number;
  avgNotesPerDay: number;
  avgNoteLength: number;
}

export interface ProductivityInsights {
  mostProductiveDay: string;
  mostProductiveHour: number;
  checklistCompletionRate: number;
  totalTasksCompleted: number;
  totalTasksPending: number;
  notesPerDay: Array<{ date: string; count: number }>;
  peakActivityTimes: Array<{ hour: number; count: number }>;
  writingStreak: number;
  longestStreak: number;
}

export interface ActivityTrends {
  dailyActivity: Array<{ date: string; created: number; updated: number }>;
  weeklyTrend: 'increasing' | 'decreasing' | 'stable';
  monthlyGrowth: number;
  peakDays: string[];
  averageNotesPerWeek: number;
}

export interface ChecklistProgress {
  totalChecklists: number;
  totalItems: number;
  completedItems: number;
  overallCompletion: number;
  overdueItems: number;
  itemsByPriority: {
    high: { total: number; completed: number };
    medium: { total: number; completed: number };
    low: { total: number; completed: number };
  };
  upcomingDeadlines: Array<{
    noteTitle: string;
    noteId: string;
    itemText: string;
    dueDate: string;
    priority: string | null;
  }>;
}

export interface LabelAnalytics {
  topLabels: Array<{ id: string; name: string; count: number; color: string }>;
  underusedLabels: Array<{ id: string; name: string; count: number }>;
  notesWithoutLabels: number;
  labelCombinations: Array<{ labels: string[]; count: number }>;
  averageLabelsPerNote: number;
}

export interface SpaceComparison {
  spaces: Array<{
    id: string;
    name: string;
    type: string;
    noteCount: number;
    lastActivity: Date | null;
    activeThisWeek: boolean;
  }>;
  mostActive: string;
  leastActive: string;
  recommendations: string[];
}

export interface WeeklyDigest {
  notesCreated: number;
  notesUpdated: number;
  tasksCompleted: number;
  highlights: string[];
  topTopics: string[];
  nextWeekSuggestions: string[];
}

export interface HeatmapData {
  data: Array<{ day: number; hour: number; count: number }>;
  peakTime: { day: string; hour: number };
  quietTime: { day: string; hour: number };
  totalActivity: number;
  streakDays: number;
}

// ============================================
// HELPERS
// ============================================

function mapNoteDoc(docSnapshot: { id: string; data: () => Record<string, unknown> }): Note {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    ownerId: (data.ownerId as string) || '',
    spaceId: (data.spaceId as string) || 'personal',
    title: (data.title as string) || '',
    body: (data.body as string) || '',
    type: (data.type as 'text' | 'checklist') || 'text',
    checklist: (data.checklist as ChecklistItem[]) || [],
    color: (data.color as NoteColor) || 'default',
    pinned: (data.pinned as boolean) || false,
    archived: (data.archived as boolean) || false,
    priority: (data.priority as NotePriority) || null,
    labelIds: (data.labelIds as string[]) || [],
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
    deletedAt: (data.deletedAt as Timestamp)?.toDate() || null,
  };
}

async function getAllNotes(userId: string, includeArchived = false, includeDeleted = false): Promise<Note[]> {
  const notesRef = collection(db, 'users', userId, 'notes');
  const q = query(notesRef, orderBy('createdAt', 'desc'), limit(500));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => mapNoteDoc({ id: doc.id, data: () => doc.data() }))
    .filter((note) => {
      if (!includeDeleted && note.deletedAt) return false;
      if (!includeArchived && note.archived) return false;
      return true;
    });
}

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDayName(dayIndex: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
}

function getPeriodStartDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case 'day':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week': {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return weekStart;
    }
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'quarter': {
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      return new Date(now.getFullYear(), quarterMonth, 1);
    }
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
    default:
      return new Date(0); // Beginning of time for 'all'
  }
}

// ============================================
// ANALYTICS FUNCTIONS
// ============================================

/**
 * Get comprehensive statistics about notes
 */
export async function getNoteStatistics(
  userId: string,
  spaceId?: string,
  period: string = 'all'
): Promise<NoteStatistics> {
  const allNotes = await getAllNotes(userId, true, true);
  const periodStart = getPeriodStartDate(period);

  // Filter by space if specified
  const notes = spaceId ? allNotes.filter((n) => n.spaceId === spaceId) : allNotes;

  // Calculate base stats
  const activeNotes = notes.filter((n) => !n.deletedAt && !n.archived);
  const textNotes = activeNotes.filter((n) => n.type === 'text').length;
  const checklistNotes = activeNotes.filter((n) => n.type === 'checklist').length;
  const archivedNotes = notes.filter((n) => n.archived && !n.deletedAt).length;
  const trashedNotes = notes.filter((n) => n.deletedAt).length;
  const pinnedNotes = activeNotes.filter((n) => n.pinned).length;

  // Color distribution
  const colorDistribution: Record<string, number> = {};
  activeNotes.forEach((note) => {
    colorDistribution[note.color] = (colorDistribution[note.color] || 0) + 1;
  });

  // Priority distribution
  const priorityDistribution: Record<string, number> = { high: 0, medium: 0, low: 0, none: 0 };
  activeNotes.forEach((note) => {
    const key = note.priority || 'none';
    priorityDistribution[key] = (priorityDistribution[key] || 0) + 1;
  });

  // Label usage
  const labelCounts: Record<string, number> = {};
  activeNotes.forEach((note) => {
    note.labelIds.forEach((labelId) => {
      labelCounts[labelId] = (labelCounts[labelId] || 0) + 1;
    });
  });

  // Get label names
  const labels = await listLabels(userId);
  const labelMap = new Map(labels.map((l) => [l.id, l.name]));

  const topLabels = Object.entries(labelCounts)
    .map(([id, count]) => ({ id, name: labelMap.get(id) || id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Notes created in period
  const notesInPeriod = activeNotes.filter((n) => n.createdAt >= periodStart);

  // Calculate average notes per day
  const daysSincePeriodStart = Math.max(
    1,
    Math.ceil((Date.now() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
  );
  const avgNotesPerDay = notesInPeriod.length / daysSincePeriodStart;

  // Average note length
  const totalLength = activeNotes.reduce((sum, n) => sum + (n.body?.length || 0), 0);
  const avgNoteLength = activeNotes.length > 0 ? Math.round(totalLength / activeNotes.length) : 0;

  return {
    totalNotes: activeNotes.length,
    textNotes,
    checklistNotes,
    archivedNotes,
    trashedNotes,
    pinnedNotes,
    colorDistribution,
    priorityDistribution,
    topLabels,
    createdThisPeriod: notesInPeriod.length,
    avgNotesPerDay: Math.round(avgNotesPerDay * 100) / 100,
    avgNoteLength,
  };
}

/**
 * Get productivity insights and patterns
 */
export async function getProductivityInsights(
  userId: string,
  period: string = 'month'
): Promise<ProductivityInsights> {
  const notes = await getAllNotes(userId);
  const periodStart = getPeriodStartDate(period);
  const notesInPeriod = notes.filter((n) => n.createdAt >= periodStart);

  // Activity by day of week
  const dayActivity: Record<number, number> = {};
  const hourActivity: Record<number, number> = {};

  notesInPeriod.forEach((note) => {
    const day = note.createdAt.getDay();
    const hour = note.createdAt.getHours();
    dayActivity[day] = (dayActivity[day] || 0) + 1;
    hourActivity[hour] = (hourActivity[hour] || 0) + 1;
  });

  // Find most productive day
  let mostProductiveDay = 'Monday';
  let maxDayCount = 0;
  Object.entries(dayActivity).forEach(([day, count]) => {
    if (count > maxDayCount) {
      maxDayCount = count;
      mostProductiveDay = getDayName(parseInt(day));
    }
  });

  // Find most productive hour
  let mostProductiveHour = 9;
  let maxHourCount = 0;
  Object.entries(hourActivity).forEach(([hour, count]) => {
    if (count > maxHourCount) {
      maxHourCount = count;
      mostProductiveHour = parseInt(hour);
    }
  });

  // Checklist completion stats
  const checklists = notes.filter((n) => n.type === 'checklist');
  let totalTasks = 0;
  let completedTasks = 0;

  checklists.forEach((checklist) => {
    checklist.checklist.forEach((item) => {
      totalTasks++;
      if (item.completed) completedTasks++;
    });
  });

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Notes per day
  const notesByDate: Record<string, number> = {};
  notesInPeriod.forEach((note) => {
    const dateStr = getDateString(note.createdAt);
    notesByDate[dateStr] = (notesByDate[dateStr] || 0) + 1;
  });

  const notesPerDay = Object.entries(notesByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14); // Last 14 days

  // Peak activity times
  const peakActivityTimes = Object.entries(hourActivity)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate writing streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const checkDate = new Date(today);

  let hasActivity = true;
  while (hasActivity) {
    const dateStr = getDateString(checkDate);
    if (notesByDate[dateStr]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      hasActivity = false;
    }
  }

  // Calculate longest streak (simplified)
  let longestStreak = streak;
  let currentStreak = 0;
  const sortedDates = Object.keys(notesByDate).sort();

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      currentStreak = 1;
    } else {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    mostProductiveDay,
    mostProductiveHour,
    checklistCompletionRate: completionRate,
    totalTasksCompleted: completedTasks,
    totalTasksPending: totalTasks - completedTasks,
    notesPerDay,
    peakActivityTimes,
    writingStreak: streak,
    longestStreak,
  };
}

/**
 * Get activity trends over time
 */
export async function getActivityTrends(
  userId: string,
  period: string = 'month',
  spaceId?: string
): Promise<ActivityTrends> {
  let notes = await getAllNotes(userId);
  const periodStart = getPeriodStartDate(period);

  if (spaceId) {
    notes = notes.filter((n) => n.spaceId === spaceId);
  }

  const notesInPeriod = notes.filter((n) => n.createdAt >= periodStart);

  // Daily activity
  const dailyStats: Record<string, { created: number; updated: number }> = {};

  notesInPeriod.forEach((note) => {
    const createdDate = getDateString(note.createdAt);
    const updatedDate = getDateString(note.updatedAt);

    if (!dailyStats[createdDate]) {
      dailyStats[createdDate] = { created: 0, updated: 0 };
    }
    dailyStats[createdDate].created++;

    if (updatedDate !== createdDate) {
      if (!dailyStats[updatedDate]) {
        dailyStats[updatedDate] = { created: 0, updated: 0 };
      }
      dailyStats[updatedDate].updated++;
    }
  });

  const dailyActivity = Object.entries(dailyStats)
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  // Determine weekly trend
  const recentDays = dailyActivity.slice(-7);
  const previousDays = dailyActivity.slice(-14, -7);

  const recentSum = recentDays.reduce((sum, d) => sum + d.created, 0);
  const previousSum = previousDays.reduce((sum, d) => sum + d.created, 0);

  let weeklyTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (recentSum > previousSum * 1.1) weeklyTrend = 'increasing';
  else if (recentSum < previousSum * 0.9) weeklyTrend = 'decreasing';

  // Monthly growth
  const thisMonth = notesInPeriod.filter((n) => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return n.createdAt >= monthAgo;
  }).length;

  const lastMonth = notesInPeriod.filter((n) => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    return n.createdAt >= twoMonthsAgo && n.createdAt < monthAgo;
  }).length;

  const monthlyGrowth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;

  // Peak days
  const peakDays = dailyActivity
    .sort((a, b) => b.created - a.created)
    .slice(0, 3)
    .map((d) => d.date);

  // Average notes per week
  const weeks = Math.max(1, Math.ceil(dailyActivity.length / 7));
  const averageNotesPerWeek = Math.round(notesInPeriod.length / weeks);

  return {
    dailyActivity,
    weeklyTrend,
    monthlyGrowth,
    peakDays,
    averageNotesPerWeek,
  };
}

/**
 * Get checklist completion progress
 */
export async function getChecklistProgress(
  userId: string,
  noteId?: string,
  spaceId?: string
): Promise<ChecklistProgress> {
  let notes = await getAllNotes(userId);

  if (spaceId) {
    notes = notes.filter((n) => n.spaceId === spaceId);
  }

  if (noteId) {
    notes = notes.filter((n) => n.id === noteId);
  }

  const checklists = notes.filter((n) => n.type === 'checklist');

  let totalItems = 0;
  let completedItems = 0;
  let overdueItems = 0;
  const itemsByPriority = {
    high: { total: 0, completed: 0 },
    medium: { total: 0, completed: 0 },
    low: { total: 0, completed: 0 },
  };
  const upcomingDeadlines: ChecklistProgress['upcomingDeadlines'] = [];

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  checklists.forEach((checklist) => {
    checklist.checklist.forEach((item) => {
      totalItems++;
      if (item.completed) completedItems++;

      // Track by priority
      const priority = item.priority || 'low';
      if (priority in itemsByPriority) {
        itemsByPriority[priority as keyof typeof itemsByPriority].total++;
        if (item.completed) {
          itemsByPriority[priority as keyof typeof itemsByPriority].completed++;
        }
      }

      // Check for due dates
      if (item.dueDate && !item.completed) {
        const dueDate = new Date(item.dueDate);
        if (dueDate < now) {
          overdueItems++;
        } else if (dueDate <= nextWeek) {
          upcomingDeadlines.push({
            noteTitle: checklist.title,
            noteId: checklist.id,
            itemText: item.text,
            dueDate: item.dueDate,
            priority: item.priority || null,
          });
        }
      }
    });
  });

  // Sort upcoming deadlines by date
  upcomingDeadlines.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return {
    totalChecklists: checklists.length,
    totalItems,
    completedItems,
    overallCompletion: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
    overdueItems,
    itemsByPriority,
    upcomingDeadlines: upcomingDeadlines.slice(0, 10),
  };
}

/**
 * Get label usage analytics
 */
export async function getLabelAnalytics(
  userId: string,
  spaceId?: string
): Promise<LabelAnalytics> {
  let notes = await getAllNotes(userId);

  if (spaceId) {
    notes = notes.filter((n) => n.spaceId === spaceId);
  }

  const labels = await listLabels(userId);
  const labelMap = new Map(labels.map((l) => [l.id, l]));

  // Count label usage
  const labelCounts: Record<string, number> = {};
  let notesWithoutLabels = 0;
  const labelCombinations: Record<string, number> = {};
  let totalLabelsUsed = 0;

  notes.forEach((note) => {
    if (note.labelIds.length === 0) {
      notesWithoutLabels++;
    } else {
      totalLabelsUsed += note.labelIds.length;

      // Count individual labels
      note.labelIds.forEach((labelId) => {
        labelCounts[labelId] = (labelCounts[labelId] || 0) + 1;
      });

      // Track label combinations (for notes with 2+ labels)
      if (note.labelIds.length >= 2) {
        const sortedIds = [...note.labelIds].sort().join(',');
        labelCombinations[sortedIds] = (labelCombinations[sortedIds] || 0) + 1;
      }
    }
  });

  // Format label analytics
  const allLabelStats = labels.map((label) => ({
    id: label.id,
    name: label.name,
    count: labelCounts[label.id] || 0,
    color: label.color,
  }));

  const topLabels = allLabelStats
    .filter((l) => l.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const underusedLabels = allLabelStats
    .filter((l) => l.count <= 1)
    .sort((a, b) => a.count - b.count)
    .slice(0, 5);

  // Format label combinations
  const formattedCombinations = Object.entries(labelCombinations)
    .map(([ids, count]) => ({
      labels: ids.split(',').map((id) => labelMap.get(id)?.name || id),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    topLabels,
    underusedLabels,
    notesWithoutLabels,
    labelCombinations: formattedCombinations,
    averageLabelsPerNote: notes.length > 0 ? Math.round((totalLabelsUsed / notes.length) * 10) / 10 : 0,
  };
}

/**
 * Compare activity across spaces
 */
export async function getSpaceComparison(userId: string): Promise<SpaceComparison> {
  const spaces = await listSpaces(userId);
  const notes = await getAllNotes(userId);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const spaceStats = spaces.map((space) => {
    const spaceNotes = notes.filter((n) => n.spaceId === space.id);
    const recentNotes = spaceNotes.filter((n) => n.updatedAt >= oneWeekAgo);

    const lastActivity = spaceNotes.length > 0
      ? spaceNotes.reduce((latest, n) => (n.updatedAt > latest ? n.updatedAt : latest), new Date(0))
      : null;

    return {
      id: space.id,
      name: space.name,
      type: space.type,
      noteCount: spaceNotes.length,
      lastActivity,
      activeThisWeek: recentNotes.length > 0,
    };
  });

  // Sort by activity
  const sortedByActivity = [...spaceStats].sort((a, b) => b.noteCount - a.noteCount);
  const mostActive = sortedByActivity[0]?.name || 'None';
  const leastActive = sortedByActivity[sortedByActivity.length - 1]?.name || 'None';

  // Generate recommendations
  const recommendations: string[] = [];

  const inactiveSpaces = spaceStats.filter((s) => !s.activeThisWeek && s.noteCount > 0);
  if (inactiveSpaces.length > 0) {
    recommendations.push(`Consider revisiting "${inactiveSpaces[0].name}" - no activity this week`);
  }

  const emptySpaces = spaceStats.filter((s) => s.noteCount === 0);
  if (emptySpaces.length > 0) {
    recommendations.push(`"${emptySpaces[0].name}" has no notes yet - start adding some!`);
  }

  if (spaceStats.length === 1) {
    recommendations.push('Consider creating additional spaces to organize notes by context');
  }

  return {
    spaces: spaceStats,
    mostActive,
    leastActive,
    recommendations,
  };
}

/**
 * Generate a weekly digest summary
 */
export async function getWeeklyDigest(
  userId: string,
  spaceId?: string
): Promise<WeeklyDigest> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  let notes = await getAllNotes(userId);

  if (spaceId) {
    notes = notes.filter((n) => n.spaceId === spaceId);
  }

  const notesCreated = notes.filter((n) => n.createdAt >= oneWeekAgo).length;
  const notesUpdated = notes.filter(
    (n) => n.updatedAt >= oneWeekAgo && n.createdAt < oneWeekAgo
  ).length;

  // Count completed tasks this week
  let tasksCompleted = 0;
  const checklists = notes.filter((n) => n.type === 'checklist');
  checklists.forEach((checklist) => {
    checklist.checklist.forEach((item) => {
      if (item.completed && item.completedAt) {
        const completedDate = new Date(item.completedAt);
        if (completedDate >= oneWeekAgo) {
          tasksCompleted++;
        }
      }
    });
  });

  // Generate highlights
  const highlights: string[] = [];
  if (notesCreated > 5) highlights.push(`Productive week with ${notesCreated} new notes!`);
  if (tasksCompleted > 0) highlights.push(`Completed ${tasksCompleted} tasks`);

  const pinnedThisWeek = notes.filter((n) => n.pinned && n.updatedAt >= oneWeekAgo).length;
  if (pinnedThisWeek > 0) highlights.push(`${pinnedThisWeek} notes added to favorites`);

  // Extract top topics from titles (simple keyword extraction)
  const recentNotes = notes.filter((n) => n.createdAt >= oneWeekAgo);
  const words: Record<string, number> = {};
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);

  recentNotes.forEach((note) => {
    const titleWords = note.title.toLowerCase().split(/\s+/);
    titleWords.forEach((word) => {
      if (word.length > 3 && !stopWords.has(word)) {
        words[word] = (words[word] || 0) + 1;
      }
    });
  });

  const topTopics = Object.entries(words)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  // Generate suggestions
  const nextWeekSuggestions: string[] = [];

  const checklistProgress = await getChecklistProgress(userId, undefined, spaceId);
  if (checklistProgress.overdueItems > 0) {
    nextWeekSuggestions.push(`Review ${checklistProgress.overdueItems} overdue tasks`);
  }

  if (checklistProgress.upcomingDeadlines.length > 0) {
    nextWeekSuggestions.push(`${checklistProgress.upcomingDeadlines.length} deadlines coming up`);
  }

  const labelAnalytics = await getLabelAnalytics(userId, spaceId);
  if (labelAnalytics.notesWithoutLabels > 5) {
    nextWeekSuggestions.push(`Consider labeling ${labelAnalytics.notesWithoutLabels} untagged notes`);
  }

  return {
    notesCreated,
    notesUpdated,
    tasksCompleted,
    highlights,
    topTopics,
    nextWeekSuggestions,
  };
}

/**
 * Get activity heatmap data
 */
export async function getActivityHeatmap(
  userId: string,
  period: string = 'month'
): Promise<HeatmapData> {
  const notes = await getAllNotes(userId);
  const periodStart = getPeriodStartDate(period);
  const notesInPeriod = notes.filter((n) => n.createdAt >= periodStart);

  // Build heatmap data (day x hour)
  const heatmap: Record<string, number> = {};

  notesInPeriod.forEach((note) => {
    const day = note.createdAt.getDay();
    const hour = note.createdAt.getHours();
    const key = `${day}-${hour}`;
    heatmap[key] = (heatmap[key] || 0) + 1;
  });

  // Convert to array format
  const data: HeatmapData['data'] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`;
      data.push({ day, hour, count: heatmap[key] || 0 });
    }
  }

  // Find peak and quiet times
  const sortedByCount = [...data].sort((a, b) => b.count - a.count);
  const peak = sortedByCount[0];
  const quiet = sortedByCount.filter((d) => d.count === 0)[0] || sortedByCount[sortedByCount.length - 1];

  // Calculate streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streakDays = 0;
  const checkDate = new Date(today);

  const notesByDate = new Set(notesInPeriod.map((n) => getDateString(n.createdAt)));

  while (streakDays < 365) {
    const dateStr = getDateString(checkDate);
    if (notesByDate.has(dateStr)) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    data,
    peakTime: { day: getDayName(peak.day), hour: peak.hour },
    quietTime: { day: getDayName(quiet.day), hour: quiet.hour },
    totalActivity: notesInPeriod.length,
    streakDays,
  };
}
