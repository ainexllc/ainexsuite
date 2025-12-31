import { db } from '@ainexsuite/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, Unsubscribe, doc } from 'firebase/firestore';

export type InsightType = 'actionable' | 'status' | 'memory' | 'streak' | 'update';
export type InsightPriority = 'high' | 'medium' | 'low';

// Schedule item for Today's Schedule widget
export interface ScheduleItem {
  id: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  type: 'event' | 'task';
  appSlug: string;
  color?: string;
  actionUrl?: string;
}

// Activity item for Recent Activity feed
export interface ActivityItem {
  id: string;
  appSlug: string;
  action: 'created' | 'updated' | 'completed' | 'logged';
  itemType: string;
  itemName: string;
  timestamp: Date;
  actionUrl?: string;
}

// Dashboard stats for WelcomeHeader
export interface DashboardStats {
  currentStreak: number;
  bestStreak: number;
  tasksCompletedToday: number;
  tasksDueToday: number;
  habitsAtRisk: number;
}

// Weekly progress for WeeklyProgress widget
export interface WeeklyProgress {
  tasksCompleted: number;
  tasksTarget: number;
  workoutsLogged: number;
  workoutsTarget: number;
  journalEntries: number;
  journalTarget: number;
  habitsCompleted: number;
  habitsTarget: number;
  overallPercentage: number;
}

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
      health: [],
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
          appSlug: 'journal',
          type: 'status' as InsightType,
          title: 'Daily Reflection',
          subtitle: 'How are you feeling today?',
          priority: 'low' as InsightPriority,
          timestamp: new Date(),
          actionUrl: '/journal'
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
    }, () => {
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
    }, () => {
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
    }, () => {
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
          appSlug: 'journal',
          type: 'status' as InsightType,
          title: 'Latest Check-in',
          subtitle: `Mood: ${data.mood || 'Recorded'}`,
          priority: 'low' as InsightPriority,
          timestamp: this.parseDate(data.createdAt),
          actionUrl: '/journal'
        };
      });
      callback(insights);
    }, () => {
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
            appSlug: 'habits',
            type: 'status' as InsightType,
            title: 'Current Goal',
            subtitle: `${data.title} (${data.progress}% done)`,
            priority: 'medium' as InsightPriority,
            timestamp: this.parseDate(data.updatedAt),
            actionUrl: '/habits'
          });
        }
      });
      callback(insights);
    }, () => {
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
          appSlug: 'display',
          type: 'status' as InsightType,
          title: 'Latest Vitals',
          subtitle: `${data.metricType}: ${data.value}`,
          priority: 'low' as InsightPriority,
          timestamp: this.parseDate(data.date),
          actionUrl: '/display'
        };
      });
      callback(insights);
    }, () => {
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
          appSlug: 'health',
          type: 'streak' as InsightType,
          title: 'Health Check-in',
          subtitle: `Logged on ${data.date}`,
          priority: 'medium' as InsightPriority,
          timestamp: this.parseDate(data.createdAt),
          actionUrl: '/health'
        };
      });
      callback(insights);
    }, () => {
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
          appSlug: 'album',
          type: 'memory' as InsightType,
          title: 'Recent Memory',
          subtitle: data.title || 'Untitled Moment',
          priority: 'low' as InsightPriority,
          timestamp: this.parseDate(data.date),
          actionUrl: '/album'
        };
      });
      callback(insights);
    }, () => {
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
    }, () => {
      callback([]);
    });
  }

  private async getPulseInsights(): Promise<InsightCardData[]> {
    return new Promise(resolve => {
      const unsub = this.subscribePulse(data => { resolve(data); unsub(); });
    });
  }

  /**
   * Subscribe to today's schedule (tasks due today + calendar events)
   */
  subscribeTodaysSchedule(callback: (items: ScheduleItem[]) => void): Unsubscribe {
    const unsubscribes: Unsubscribe[] = [];
    const scheduleMap: Record<string, ScheduleItem[]> = {
      tasks: [],
      events: [],
    };

    const update = () => {
      const allItems = [...scheduleMap.tasks, ...scheduleMap.events]
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      callback(allItems);
    };

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Subscribe to tasks due today
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('ownerId', '==', this.userId),
      where('completed', '==', false),
      orderBy('dueDate', 'asc'),
      limit(10)
    );

    unsubscribes.push(
      onSnapshot(tasksQuery, (snapshot) => {
        const tasks: ScheduleItem[] = [];
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const dueDate = this.parseDate(data.dueDate);
          // Only include tasks due today
          if (dueDate >= startOfDay && dueDate <= endOfDay) {
            tasks.push({
              id: doc.id,
              title: data.title,
              startTime: dueDate,
              type: 'task',
              appSlug: 'todo',
              color: '#8b5cf6',
              actionUrl: `/todo?id=${doc.id}`,
            });
          }
        });
        scheduleMap.tasks = tasks;
        update();
      }, () => {
        scheduleMap.tasks = [];
        update();
      })
    );

    // Subscribe to calendar events today
    const eventsQuery = query(
      collection(db, 'calendar_events'),
      where('ownerId', '==', this.userId),
      orderBy('startTime', 'asc'),
      limit(20)
    );

    unsubscribes.push(
      onSnapshot(eventsQuery, (snapshot) => {
        const events: ScheduleItem[] = [];
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const startTime = this.parseDate(data.startTime);
          const endTime = data.endTime ? this.parseDate(data.endTime) : undefined;
          // Only include events that overlap with today
          if (startTime <= endOfDay && (!endTime || endTime >= startOfDay)) {
            events.push({
              id: doc.id,
              title: data.title || 'Untitled Event',
              startTime,
              endTime,
              type: 'event',
              appSlug: 'calendar',
              color: data.color || '#06b6d4',
              actionUrl: `/calendar?id=${doc.id}`,
            });
          }
        });
        scheduleMap.events = events;
        update();
      }, () => {
        scheduleMap.events = [];
        update();
      })
    );

    return () => unsubscribes.forEach(unsub => unsub());
  }

  /**
   * Subscribe to recent activity across all apps
   */
  subscribeToRecentActivity(callback: (items: ActivityItem[]) => void, maxItems = 10): Unsubscribe {
    const unsubscribes: Unsubscribe[] = [];
    const activityMap: Record<string, ActivityItem[]> = {
      notes: [],
      tasks: [],
      workouts: [],
      journal: [],
    };

    const update = () => {
      const allItems = Object.values(activityMap)
        .flat()
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, maxItems);
      callback(allItems);
    };

    // Recent notes (created/updated)
    const notesQuery = query(
      collection(db, 'users', this.userId, 'notes'),
      orderBy('updatedAt', 'desc'),
      limit(5)
    );

    unsubscribes.push(
      onSnapshot(notesQuery, (snapshot) => {
        const activities: ActivityItem[] = snapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = this.parseDate(data.createdAt);
          const updatedAt = this.parseDate(data.updatedAt);
          const isNew = Math.abs(updatedAt.getTime() - createdAt.getTime()) < 60000; // Within 1 minute
          return {
            id: `note-${doc.id}`,
            appSlug: 'notes',
            action: isNew ? 'created' : 'updated',
            itemType: 'note',
            itemName: data.title || 'Untitled Note',
            timestamp: updatedAt,
            actionUrl: `/notes?id=${doc.id}`,
          };
        });
        activityMap.notes = activities;
        update();
      }, () => {
        activityMap.notes = [];
        update();
      })
    );

    // Recent completed tasks
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('ownerId', '==', this.userId),
      where('completed', '==', true),
      orderBy('completedAt', 'desc'),
      limit(5)
    );

    unsubscribes.push(
      onSnapshot(tasksQuery, (snapshot) => {
        const activities: ActivityItem[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: `task-${doc.id}`,
            appSlug: 'todo',
            action: 'completed',
            itemType: 'task',
            itemName: data.title,
            timestamp: this.parseDate(data.completedAt),
            actionUrl: `/todo?id=${doc.id}`,
          };
        });
        activityMap.tasks = activities;
        update();
      }, () => {
        activityMap.tasks = [];
        update();
      })
    );

    // Recent workouts
    const workoutsQuery = query(
      collection(db, 'workouts'),
      where('ownerId', '==', this.userId),
      orderBy('date', 'desc'),
      limit(3)
    );

    unsubscribes.push(
      onSnapshot(workoutsQuery, (snapshot) => {
        const activities: ActivityItem[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: `workout-${doc.id}`,
            appSlug: 'fit',
            action: 'logged',
            itemType: 'workout',
            itemName: data.name || 'Workout',
            timestamp: this.parseDate(data.date),
            actionUrl: '/fit',
          };
        });
        activityMap.workouts = activities;
        update();
      }, () => {
        activityMap.workouts = [];
        update();
      })
    );

    // Recent journal entries
    const journalQuery = query(
      collection(db, 'journal_entries'),
      where('ownerId', '==', this.userId),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    unsubscribes.push(
      onSnapshot(journalQuery, (snapshot) => {
        const activities: ActivityItem[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: `journal-${doc.id}`,
            appSlug: 'journal',
            action: 'created',
            itemType: 'journal entry',
            itemName: data.title || `Entry - ${data.mood || 'Reflection'}`,
            timestamp: this.parseDate(data.createdAt),
            actionUrl: '/journal',
          };
        });
        activityMap.journal = activities;
        update();
      }, () => {
        activityMap.journal = [];
        update();
      })
    );

    return () => unsubscribes.forEach(unsub => unsub());
  }

  /**
   * Subscribe to dashboard stats (streaks, tasks completed/due today)
   */
  subscribeToDashboardStats(callback: (stats: DashboardStats) => void): Unsubscribe {
    const unsubscribes: Unsubscribe[] = [];
    const statsData: {
      habits: Array<{ id: string; currentStreak: number; bestStreak: number }>;
      completions: Array<{ habitId: string; date: string }>;
      tasksCompletedToday: number;
      tasksDueToday: number;
    } = {
      habits: [],
      completions: [],
      tasksCompletedToday: 0,
      tasksDueToday: 0,
    };

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const update = () => {
      // Calculate max streak across all habits
      let maxCurrentStreak = 0;
      let maxBestStreak = 0;
      let habitsAtRisk = 0;

      for (const habit of statsData.habits) {
        if (habit.currentStreak > maxCurrentStreak) {
          maxCurrentStreak = habit.currentStreak;
        }
        if (habit.bestStreak > maxBestStreak) {
          maxBestStreak = habit.bestStreak;
        }
        // Habit is at risk if it has a streak but wasn't completed today
        const completedToday = statsData.completions.some(
          c => c.habitId === habit.id && c.date === todayStr
        );
        if (habit.currentStreak > 0 && !completedToday) {
          habitsAtRisk++;
        }
      }

      callback({
        currentStreak: maxCurrentStreak,
        bestStreak: maxBestStreak,
        tasksCompletedToday: statsData.tasksCompletedToday,
        tasksDueToday: statsData.tasksDueToday,
        habitsAtRisk,
      });
    };

    // Subscribe to habits for streak data
    const habitsQuery = query(
      collection(db, 'habits'),
      where('ownerId', '==', this.userId),
      where('archived', '==', false),
      limit(50)
    );

    unsubscribes.push(
      onSnapshot(habitsQuery, (snapshot) => {
        statsData.habits = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            currentStreak: data.currentStreak || 0,
            bestStreak: data.bestStreak || 0,
          };
        });
        update();
      }, () => {
        statsData.habits = [];
        update();
      })
    );

    // Subscribe to completions for today
    const completionsQuery = query(
      collection(db, 'completions'),
      where('userId', '==', this.userId),
      where('date', '==', todayStr),
      limit(100)
    );

    unsubscribes.push(
      onSnapshot(completionsQuery, (snapshot) => {
        statsData.completions = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            habitId: data.habitId,
            date: data.date,
          };
        });
        update();
      }, () => {
        statsData.completions = [];
        update();
      })
    );

    // Subscribe to tasks due today
    const tasksDueTodayQuery = query(
      collection(db, 'tasks'),
      where('ownerId', '==', this.userId),
      where('completed', '==', false),
      orderBy('dueDate', 'asc'),
      limit(50)
    );

    unsubscribes.push(
      onSnapshot(tasksDueTodayQuery, (snapshot) => {
        let dueCount = 0;
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const dueDate = this.parseDate(data.dueDate);
          if (dueDate >= startOfDay && dueDate <= endOfDay) {
            dueCount++;
          }
        });
        statsData.tasksDueToday = dueCount;
        update();
      }, () => {
        statsData.tasksDueToday = 0;
        update();
      })
    );

    // Subscribe to tasks completed today
    const tasksCompletedQuery = query(
      collection(db, 'tasks'),
      where('ownerId', '==', this.userId),
      where('completed', '==', true),
      orderBy('completedAt', 'desc'),
      limit(50)
    );

    unsubscribes.push(
      onSnapshot(tasksCompletedQuery, (snapshot) => {
        let completedCount = 0;
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const completedAt = this.parseDate(data.completedAt);
          if (completedAt >= startOfDay && completedAt <= endOfDay) {
            completedCount++;
          }
        });
        statsData.tasksCompletedToday = completedCount;
        update();
      }, () => {
        statsData.tasksCompletedToday = 0;
        update();
      })
    );

    return () => unsubscribes.forEach(unsub => unsub());
  }

  /**
   * Subscribe to weekly progress across all apps
   */
  subscribeToWeeklyProgress(callback: (progress: WeeklyProgress) => void): Unsubscribe {
    const unsubscribes: Unsubscribe[] = [];
    const progressData = {
      tasksCompleted: 0,
      workoutsLogged: 0,
      journalEntries: 0,
      habitsCompleted: 0,
    };

    // Default targets (can be made configurable)
    const targets = {
      tasks: 10,
      workouts: 3,
      journal: 5,
      habits: 21,
    };

    // Calculate start of week (Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const update = () => {
      const total =
        Math.min(progressData.tasksCompleted / targets.tasks, 1) * 25 +
        Math.min(progressData.workoutsLogged / targets.workouts, 1) * 25 +
        Math.min(progressData.journalEntries / targets.journal, 1) * 25 +
        Math.min(progressData.habitsCompleted / targets.habits, 1) * 25;

      callback({
        tasksCompleted: progressData.tasksCompleted,
        tasksTarget: targets.tasks,
        workoutsLogged: progressData.workoutsLogged,
        workoutsTarget: targets.workouts,
        journalEntries: progressData.journalEntries,
        journalTarget: targets.journal,
        habitsCompleted: progressData.habitsCompleted,
        habitsTarget: targets.habits,
        overallPercentage: Math.round(total),
      });
    };

    // Tasks completed this week
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('ownerId', '==', this.userId),
      where('completed', '==', true),
      orderBy('completedAt', 'desc'),
      limit(100)
    );

    unsubscribes.push(
      onSnapshot(tasksQuery, (snapshot) => {
        let count = 0;
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const completedAt = this.parseDate(data.completedAt);
          if (completedAt >= startOfWeek) {
            count++;
          }
        });
        progressData.tasksCompleted = count;
        update();
      }, () => {
        progressData.tasksCompleted = 0;
        update();
      })
    );

    // Workouts this week
    const workoutsQuery = query(
      collection(db, 'workouts'),
      where('ownerId', '==', this.userId),
      orderBy('date', 'desc'),
      limit(20)
    );

    unsubscribes.push(
      onSnapshot(workoutsQuery, (snapshot) => {
        let count = 0;
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const workoutDate = this.parseDate(data.date);
          if (workoutDate >= startOfWeek) {
            count++;
          }
        });
        progressData.workoutsLogged = count;
        update();
      }, () => {
        progressData.workoutsLogged = 0;
        update();
      })
    );

    // Journal entries this week
    const journalQuery = query(
      collection(db, 'journal_entries'),
      where('ownerId', '==', this.userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    unsubscribes.push(
      onSnapshot(journalQuery, (snapshot) => {
        let count = 0;
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const entryDate = this.parseDate(data.createdAt);
          if (entryDate >= startOfWeek) {
            count++;
          }
        });
        progressData.journalEntries = count;
        update();
      }, () => {
        progressData.journalEntries = 0;
        update();
      })
    );

    // Habit completions this week
    const completionsQuery = query(
      collection(db, 'completions'),
      where('userId', '==', this.userId),
      orderBy('completedAt', 'desc'),
      limit(100)
    );

    unsubscribes.push(
      onSnapshot(completionsQuery, (snapshot) => {
        let count = 0;
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const completedAt = this.parseDate(data.completedAt);
          if (completedAt >= startOfWeek) {
            count++;
          }
        });
        progressData.habitsCompleted = count;
        update();
      }, () => {
        progressData.habitsCompleted = 0;
        update();
      })
    );

    return () => unsubscribes.forEach(unsub => unsub());
  }
}
