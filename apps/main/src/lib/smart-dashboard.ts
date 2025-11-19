import { db } from '@ainexsuite/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export type InsightType = 'actionable' | 'status' | 'memory' | 'streak' | 'update';
export type InsightPriority = 'high' | 'medium' | 'low';

export interface InsightCardData {
  id: string;
  appSlug: string;
  type: InsightType;
  title: string;
  subtitle?: string;
  value?: string | number;
  priority: InsightPriority;
  timestamp: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  actionUrl?: string;
  actions?: Array<{
    label: string;
    type: 'complete' | 'snooze' | 'dismiss' | 'create_prompt';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
  }>;
}

export class SmartDashboardService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseDate(timestamp: any): Date {
    if (!timestamp) return new Date();
    if (typeof timestamp.toDate === 'function') return timestamp.toDate();
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp === 'string' || typeof timestamp === 'number') return new Date(timestamp);
    return new Date(); // Fallback
  }

  /**
   * Aggregates insights from all registered apps
   */
  async getAggregatedInsights(): Promise<InsightCardData[]> {
    const [
      todos,
      recentNotes,
      workouts,
      moods,
      growGoals,
      pulseMetrics
    ] = await Promise.all([
      this.getTodoInsights(),
      this.getNoteInsights(),
      this.getFitInsights(),
      this.getJourneyInsights(),
      this.getGrowInsights(),
      this.getPulseInsights()
    ]);

    // Check for empty states and generate prompts
    const quickActions = [];
    
    if (todos.length === 0) {
      quickActions.push({
        id: 'create-task-prompt',
        appSlug: 'todo',
        type: 'actionable' as InsightType,
        title: 'Plan your day',
        subtitle: 'No pending tasks. Add one?',
        priority: 'low' as InsightPriority,
        timestamp: new Date(),
        actionUrl: '/todo',
        actions: [{
           label: 'Create Task',
           type: 'create_prompt',
           payload: { type: 'task' }
        }]
      });
    }

    if (workouts.length === 0) {
      quickActions.push({
        id: 'log-workout-prompt',
        appSlug: 'fit',
        type: 'streak' as InsightType,
        title: 'Start moving',
        subtitle: 'Log your first workout',
        priority: 'low' as InsightPriority,
        timestamp: new Date(),
        actionUrl: '/fit',
        actions: [{
           label: 'Log Workout',
           type: 'create_prompt',
           payload: { type: 'workout' }
        }]
      });
    }

    if (moods.length === 0) {
      quickActions.push({
        id: 'log-mood-prompt',
        appSlug: 'journey',
        type: 'status' as InsightType,
        title: 'Daily Reflection',
        subtitle: 'How are you feeling today?',
        priority: 'low' as InsightPriority,
        timestamp: new Date(),
        actionUrl: '/journey'
      });
    }

    // Combine and sort by priority/date
    const allInsights = [...todos, ...recentNotes, ...workouts, ...moods, ...growGoals, ...pulseMetrics, ...quickActions].sort((a, b) => {
      // High priority first
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      // Then by date (newest first)
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    return allInsights;
  }

  private async getTodoInsights(): Promise<InsightCardData[]> {
    try {
      // Fetch overdue or due today tasks
      const q = query(
        collection(db, 'tasks'),
        where('ownerId', '==', this.userId),
        where('completed', '==', false),
        orderBy('dueDate', 'asc'),
        limit(3)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return [];

      return snapshot.docs.map(doc => {
        const data = doc.data();
        const dueDate = this.parseDate(data.dueDate);
        const isOverdue = dueDate < new Date();
        
        return {
          id: doc.id,
          appSlug: 'todo',
          type: 'actionable',
          title: data.title,
          subtitle: isOverdue ? 'Overdue' : 'Due Today',
          priority: isOverdue ? 'high' : 'medium',
          timestamp: dueDate,
          actionUrl: `/todo?id=${doc.id}`,
          actions: [{
            label: 'Done',
            type: 'complete',
            payload: { taskId: doc.id }
          }]
        };
      });
    } catch (error) {
      console.error('Error fetching todo insights:', error);
      return [];
    }
  }

  private async getNoteInsights(): Promise<InsightCardData[]> {
    try {
      // Fetch recently pinned or updated notes
      const q = query(
        collection(db, 'users', this.userId, 'notes'),
        orderBy('updatedAt', 'desc'),
        limit(2)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return [];

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          appSlug: 'notes',
          type: 'memory',
          title: data.title || 'Untitled Note',
          subtitle: 'Recently updated',
          priority: 'low',
          timestamp: this.parseDate(data.updatedAt),
          actionUrl: `/notes?id=${doc.id}`
        };
      });
    } catch (error) {
      console.error('Error fetching note insights:', error);
      return [];
    }
  }

  private async getFitInsights(): Promise<InsightCardData[]> {
    try {
      // Fetch last workout
      const q = query(
        collection(db, 'workouts'),
        where('ownerId', '==', this.userId),
        orderBy('date', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return [];

      const data = snapshot.docs[0].data();
      return [{
        id: snapshot.docs[0].id,
        appSlug: 'fit',
        type: 'streak',
        title: 'Last Workout',
        subtitle: `${data.name || 'Workout'} completed`,
        priority: 'medium',
        timestamp: this.parseDate(data.date),
        actionUrl: '/fit'
      }];
    } catch (error) {
      console.error('Error fetching fit insights:', error);
      return [];
    }
  }

  private async getJourneyInsights(): Promise<InsightCardData[]> {
    try {
      // Fetch today's mood or check-in
      const q = query(
        collection(db, 'journal_entries'),
        where('ownerId', '==', this.userId),
        orderBy('date', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return [];

      const data = snapshot.docs[0].data();
      return [{
        id: snapshot.docs[0].id,
        appSlug: 'journey',
        type: 'status',
        title: 'Latest Check-in',
        subtitle: `Mood: ${data.mood || 'Recorded'}`,
        priority: 'low',
        timestamp: this.parseDate(data.createdAt),
        actionUrl: '/journey'
      }];
    } catch (error) {
      console.error('Error fetching journey insights:', error);
      return [];
    }
  }

  private async getGrowInsights(): Promise<InsightCardData[]> {
    try {
      // Fetch active learning goals
      const q = query(
        collection(db, 'learning_goals'),
        where('ownerId', '==', this.userId),
        orderBy('progress', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return [];

      const data = snapshot.docs[0].data();
      // Skip if completed (assuming 100 is done)
      if (data.progress >= 100) return [];

      return [{
        id: snapshot.docs[0].id,
        appSlug: 'grow',
        type: 'status',
        title: 'Current Goal',
        subtitle: `${data.title} (${data.progress}% done)`,
        priority: 'medium',
        timestamp: this.parseDate(data.updatedAt),
        actionUrl: '/grow'
      }];
    } catch (error) {
      console.error('Error fetching grow insights:', error);
      return [];
    }
  }

  private async getPulseInsights(): Promise<InsightCardData[]> {
    try {
      // Fetch latest health metric
      const q = query(
        collection(db, 'health_metrics'),
        where('ownerId', '==', this.userId),
        orderBy('date', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return [];

      const data = snapshot.docs[0].data();
      
      return [{
        id: snapshot.docs[0].id,
        appSlug: 'pulse',
        type: 'status',
        title: 'Latest Vitals',
        subtitle: `${data.metricType}: ${data.value}`,
        priority: 'low',
        timestamp: this.parseDate(data.date),
        actionUrl: '/pulse'
      }];
    } catch (error) {
      console.error('Error fetching pulse insights:', error);
      return [];
    }
  }
}
