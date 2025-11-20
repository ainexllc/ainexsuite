import { db } from '@ainexsuite/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, Unsubscribe, doc } from 'firebase/firestore';

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
   * Subscribes to aggregated insights from all registered apps
   */
  subscribeToInsights(callback: (insights: InsightCardData[]) => void): Unsubscribe {
    const unsubscribes: Unsubscribe[] = [];
    const insightsMap: Record<string, InsightCardData[]> = {
      todo: [],
      notes: [],
      fit: [],
      journey: [],
      grow: [],
      pulse: [],
      track: [],
      moments: [],
      projects: []
    };

    const update = () => {
      const allInsights = Object.values(insightsMap).flat();
      
      // Check for empty states and generate prompts
      const quickActions: InsightCardData[] = [];
      
      if (insightsMap.todo.length === 0) {
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

      if (insightsMap.fit.length === 0) {
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

      if (insightsMap.journey.length === 0) {
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

      const finalInsights = [...allInsights, ...quickActions].sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (a.priority !== 'high' && b.priority === 'high') return 1;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });

      callback(finalInsights);
    };

    unsubscribes.push(this.subscribeTodo((data) => { insightsMap.todo = data; update(); }));
    unsubscribes.push(this.subscribeNotes((data) => { insightsMap.notes = data; update(); }));
    unsubscribes.push(this.subscribeFit((data) => { insightsMap.fit = data; update(); }));
    unsubscribes.push(this.subscribeJourney((data) => { insightsMap.journey = data; update(); }));
    unsubscribes.push(this.subscribeGrow((data) => { insightsMap.grow = data; update(); }));
    unsubscribes.push(this.subscribePulse((data) => { insightsMap.pulse = data; update(); }));
    unsubscribes.push(this.subscribeHabits((data) => { insightsMap.track = data; update(); }));
    unsubscribes.push(this.subscribeMoments((data) => { insightsMap.moments = data; update(); }));
    unsubscribes.push(this.subscribeProjects((data) => { insightsMap.projects = data; update(); }));

    return () => unsubscribes.forEach(unsub => unsub());
  }

  // Keep the old method for backward compatibility if needed, but it's better to migrate
  async getAggregatedInsights(): Promise<InsightCardData[]> {
    return new Promise((resolve) => {
      const unsub = this.subscribeToInsights((data) => {
        resolve(data);
        unsub();
      });
    });
  }

  private subscribeTodo(callback: (data: InsightCardData[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'tasks'),
      where('ownerId', '==', this.userId),
      where('completed', '==', false),
      orderBy('dueDate', 'asc'),
      limit(3)
    );

    return onSnapshot(q, (snapshot) => {
      const insights = snapshot.docs.map(doc => {
        const data = doc.data();
        const dueDate = this.parseDate(data.dueDate);
        const isOverdue = dueDate < new Date();
        
        return {
          id: doc.id,
          appSlug: 'todo',
          type: 'actionable' as InsightType,
          title: data.title,
          subtitle: isOverdue ? 'Overdue' : 'Due Today',
          priority: (isOverdue ? 'high' : 'medium') as InsightPriority,
          timestamp: dueDate,
          actionUrl: `/todo?id=${doc.id}`,
          actions: [{
            label: 'Done',
            type: 'complete' as const,
            payload: { taskId: doc.id }
          }]
        };
      });
      callback(insights);
    }, (error) => {
      console.error('Error fetching todo insights:', error);
      callback([]);
    });
  }

  private async getTodoInsights(): Promise<InsightCardData[]> {
    // Legacy wrapper
    return new Promise(resolve => {
      const unsub = this.subscribeTodo(data => { resolve(data); unsub(); });
    });
  }

  private subscribeNotes(callback: (data: InsightCardData[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'users', this.userId, 'notes'),
      orderBy('updatedAt', 'desc'),
      limit(2)
    );

    return onSnapshot(q, (snapshot) => {
      const insights = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          appSlug: 'notes',
          type: 'memory' as InsightType,
          title: data.title || 'Untitled Note',
          subtitle: 'Recently updated',
          priority: 'low' as InsightPriority,
          timestamp: this.parseDate(data.updatedAt),
          actionUrl: `/notes?id=${doc.id}`
        };
      });
      callback(insights);
    }, (error) => {
      console.error('Error fetching note insights:', error);
      callback([]);
    });
  }

  private async getNoteInsights(): Promise<InsightCardData[]> {
    return new Promise(resolve => {
      const unsub = this.subscribeNotes(data => { resolve(data); unsub(); });
    });
  }

  private subscribeFit(callback: (data: InsightCardData[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'workouts'),
      where('ownerId', '==', this.userId),
      orderBy('date', 'desc'),
      limit(1)
    );

    return onSnapshot(q, (snapshot) => {
      const insights = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          appSlug: 'fit',
          type: 'streak' as InsightType,
          title: 'Last Workout',
          subtitle: `${data.name || 'Workout'} completed`,
          priority: 'medium' as InsightPriority,
          timestamp: this.parseDate(data.date),
          actionUrl: '/fit'
        };
      });
      callback(insights);
    }, (error) => {
      console.error('Error fetching fit insights:', error);
      callback([]);
    });
  }

  private async getFitInsights(): Promise<InsightCardData[]> {
    return new Promise(resolve => {
      const unsub = this.subscribeFit(data => { resolve(data); unsub(); });
    });
  }

  private subscribeJourney(callback: (data: InsightCardData[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'journal_entries'),
      where('ownerId', '==', this.userId),
      orderBy('date', 'desc'),
      limit(1)
    );

    return onSnapshot(q, (snapshot) => {
      const insights = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          appSlug: 'journey',
          type: 'status' as InsightType,
          title: 'Latest Check-in',
          subtitle: `Mood: ${data.mood || 'Recorded'}`,
          priority: 'low' as InsightPriority,
          timestamp: this.parseDate(data.createdAt),
          actionUrl: '/journey'
        };
      });
      callback(insights);
    }, (error) => {
      console.error('Error fetching journey insights:', error);
      callback([]);
    });
  }

  private async getJourneyInsights(): Promise<InsightCardData[]> {
    return new Promise(resolve => {
      const unsub = this.subscribeJourney(data => { resolve(data); unsub(); });
    });
  }

  private subscribeGrow(callback: (data: InsightCardData[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'learning_goals'),
      where('ownerId', '==', this.userId),
      orderBy('progress', 'desc'),
      limit(1)
    );

    return onSnapshot(q, (snapshot) => {
      const insights: InsightCardData[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.progress < 100) {
          insights.push({
            id: doc.id,
            appSlug: 'grow',
            type: 'status' as InsightType,
            title: 'Current Goal',
            subtitle: `${data.title} (${data.progress}% done)`,
            priority: 'medium' as InsightPriority,
            timestamp: this.parseDate(data.updatedAt),
            actionUrl: '/grow'
          });
        }
      });
      callback(insights);
    }, (error) => {
      console.error('Error fetching grow insights:', error);
      callback([]);
    });
  }

  private async getGrowInsights(): Promise<InsightCardData[]> {
    return new Promise(resolve => {
      const unsub = this.subscribeGrow(data => { resolve(data); unsub(); });
    });
  }

  private subscribePulse(callback: (data: InsightCardData[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'health_metrics'),
      where('ownerId', '==', this.userId),
      orderBy('date', 'desc'),
      limit(1)
    );

    return onSnapshot(q, (snapshot) => {
      const insights = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          appSlug: 'pulse',
          type: 'status' as InsightType,
          title: 'Latest Vitals',
          subtitle: `${data.metricType}: ${data.value}`,
          priority: 'low' as InsightPriority,
          timestamp: this.parseDate(data.date),
          actionUrl: '/pulse'
        };
      });
      callback(insights);
    }, (error) => {
      console.error('Error fetching pulse insights:', error);
      callback([]);
    });
  }

  private subscribeHabits(callback: (data: InsightCardData[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'habits'),
      where('ownerId', '==', this.userId),
      where('archived', '==', false),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    return onSnapshot(q, (snapshot) => {
      const insights = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          appSlug: 'track',
          type: 'streak' as InsightType,
          title: 'Active Habit',
          subtitle: data.name,
          priority: 'medium' as InsightPriority,
          timestamp: this.parseDate(data.createdAt),
          actionUrl: '/track'
        };
      });
      callback(insights);
    }, (error) => {
      console.error('Error fetching habit insights:', error);
      callback([]);
    });
  }

  private subscribeMoments(callback: (data: InsightCardData[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'moments'),
      where('ownerId', '==', this.userId),
      orderBy('date', 'desc'),
      limit(1)
    );

    return onSnapshot(q, (snapshot) => {
      const insights = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          appSlug: 'moments',
          type: 'memory' as InsightType,
          title: 'Recent Memory',
          subtitle: data.title || 'Untitled Moment',
          priority: 'low' as InsightPriority,
          timestamp: this.parseDate(data.date),
          actionUrl: '/moments'
        };
      });
      callback(insights);
    }, (error) => {
      console.error('Error fetching moment insights:', error);
      callback([]);
    });
  }

  private subscribeProjects(callback: (data: InsightCardData[]) => void): Unsubscribe {
    const whiteboardRef = doc(db, 'whiteboards', this.userId);

    return onSnapshot(whiteboardRef, (doc) => {
      const insights: InsightCardData[] = [];
      if (doc.exists()) {
        const data = doc.data();
        const nodeCount = data.nodes?.length || 0;
        if (nodeCount > 0) {
            insights.push({
                id: doc.id,
                appSlug: 'projects',
                type: 'status' as InsightType,
                title: 'Project Board',
                subtitle: `${nodeCount} active items`,
                priority: 'low' as InsightPriority,
                timestamp: this.parseDate(data.updatedAt || new Date()),
                actionUrl: '/projects'
            });
        }
      }
      callback(insights);
    }, (error) => {
      console.error('Error fetching project insights:', error);
      callback([]);
    });
  }

  private async getPulseInsights(): Promise<InsightCardData[]> {
    return new Promise(resolve => {
      const unsub = this.subscribePulse(data => { resolve(data); unsub(); });
    });
  }
}
