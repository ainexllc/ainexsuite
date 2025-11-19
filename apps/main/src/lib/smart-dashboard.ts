import { db } from '@ainexsuite/firebase/lib/client';
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
}

export class SmartDashboardService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
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

    // Combine and sort by priority/date
    const allInsights = [...todos, ...recentNotes, ...workouts, ...moods, ...growGoals, ...pulseMetrics].sort((a, b) => {
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
        collection(db, 'todos'),
        where('ownerId', '==', this.userId),
        where('completed', '==', false),
        orderBy('dueDate', 'asc'),
        limit(3)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return [];

      return snapshot.docs.map(doc => {
        const data = doc.data();
        const dueDate = data.dueDate?.toDate ? data.dueDate.toDate() : new Date(data.dueDate);
        const isOverdue = dueDate < new Date();
        
        return {
          id: doc.id,
          appSlug: 'todo',
          type: 'actionable',
          title: data.title,
          subtitle: isOverdue ? 'Overdue' : 'Due Today',
          priority: isOverdue ? 'high' : 'medium',
          timestamp: dueDate,
          actionUrl: `/todo?id=${doc.id}`
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
          timestamp: data.updatedAt?.toDate() || new Date(),
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
        timestamp: data.date?.toDate() || new Date(),
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
        timestamp: data.createdAt?.toDate() || new Date(),
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
        timestamp: data.updatedAt?.toDate() || new Date(),
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
        timestamp: new Date(data.date), // Assuming date is timestamp number or string
        actionUrl: '/pulse'
      }];
    } catch (error) {
      console.error('Error fetching pulse insights:', error);
      return [];
    }
  }
}
