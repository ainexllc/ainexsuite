import { NextRequest, NextResponse } from 'next/server';
import { db } from '@ainexsuite/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';
import {
  SearchResponse,
  SearchResult,
  SearchableApp,
  noteToSearchResult,
  journalToSearchResult,
  taskToSearchResult,
  momentToSearchResult,
  learningGoalToSearchResult,
  healthMetricToSearchResult,
  workoutToSearchResult,
  Note,
  JournalEntry,
  Todo,
  Moment,
  LearningGoal,
  HealthMetric,
  Workout,
} from '@ainexsuite/types';

/**
 * Get user ID from session cookie
 */
async function getUserIdFromSession(request: NextRequest): Promise<string | null> {
  const sessionCookie = request.cookies.get('__session')?.value;

  if (!sessionCookie) {
    return null;
  }

  // Development: base64-encoded JSON
  if (process.env.NODE_ENV === 'development') {
    try {
      const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString());
      return decoded.uid || null;
    } catch {
      return null;
    }
  }

  // Production: verify with Firebase Admin
  try {
    const { getAdminAuth } = await import('@ainexsuite/auth/server');
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims.uid;
  } catch {
    return null;
  }
}

/**
 * GET /api/search
 * Universal search across all 8 productivity apps
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q') || '';
    const appsFilter = searchParams.get('apps')?.split(',') as
      | SearchableApp[]
      | undefined;
    const limitParam = parseInt(searchParams.get('limit') || '10');
    const sortBy = (searchParams.get('sortBy') || 'date') as
      | 'relevance'
      | 'date';

    // Get userId from session
    const userId = await getUserIdFromSession(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    if (!searchQuery || searchQuery.length < 2) {
      return NextResponse.json<SearchResponse>({
        results: [],
        totalCount: 0,
        appCounts: {
          notes: 0,
          journal: 0,
          todo: 0,
          health: 0,
          album: 0,
          habits: 0,
          hub: 0,
          fit: 0,
        },
        query: searchQuery,
      });
    }

    const searchLower = searchQuery.toLowerCase();
    const appsToSearch: SearchableApp[] = appsFilter || [
      'notes',
      'journal',
      'todo',
      'health',
      'album',
      'habits',
      'hub',
      'fit',
    ];

    const allResults: SearchResult[] = [];
    const appCounts: Record<SearchableApp, number> = {
      notes: 0,
      journal: 0,
      todo: 0,
      health: 0,
      album: 0,
      habits: 0,
      hub: 0,
      fit: 0,
    };

    // Search Notes
    if (appsToSearch.includes('notes')) {
      const notesRef = collection(db, 'notes');
      const notesQuery = query(
        notesRef,
        where('ownerId', '==', userId),
        orderBy('updatedAt', 'desc'),
        firestoreLimit(limitParam)
      );
      const notesSnapshot = await getDocs(notesQuery);

      notesSnapshot.forEach((doc) => {
        const note = doc.data() as Note;
        const matchesTitle = note.title.toLowerCase().includes(searchLower);
        const matchesContent = note.body.toLowerCase().includes(searchLower);
        const matchesLabels = note.labels?.some((label) =>
          label.toLowerCase().includes(searchLower)
        );

        if (matchesTitle || matchesContent || matchesLabels) {
          allResults.push(noteToSearchResult(note, doc.id));
          appCounts.notes++;
        }
      });
    }

    // Search Journal
    if (appsToSearch.includes('journal')) {
      const journalRef = collection(db, 'journal_entries');
      const journalQuery = query(
        journalRef,
        where('ownerId', '==', userId),
        orderBy('updatedAt', 'desc'),
        firestoreLimit(limitParam)
      );
      const journalSnapshot = await getDocs(journalQuery);

      journalSnapshot.forEach((doc) => {
        const entry = doc.data() as JournalEntry;
        const matchesContent = entry.content.toLowerCase().includes(searchLower);

        if (matchesContent) {
          allResults.push(journalToSearchResult(entry, doc.id));
          appCounts.journal++;
        }
      });
    }

    // Search Tasks
    if (appsToSearch.includes('todo')) {
      const tasksRef = collection(db, 'tasks');
      const tasksQuery = query(
        tasksRef,
        where('ownerId', '==', userId),
        orderBy('updatedAt', 'desc'),
        firestoreLimit(limitParam)
      );
      const tasksSnapshot = await getDocs(tasksQuery);

      tasksSnapshot.forEach((doc) => {
        const task = doc.data() as Todo;
        const matchesTitle = task.title.toLowerCase().includes(searchLower);
        const matchesDescription =
          task.description?.toLowerCase().includes(searchLower);

        if (matchesTitle || matchesDescription) {
          allResults.push(taskToSearchResult(task, doc.id));
          appCounts.todo++;
        }
      });
    }

    // Search Health (Health Metrics)
    if (appsToSearch.includes('health')) {
      const healthRef = collection(db, 'health_metrics');
      const healthQuery = query(
        healthRef,
        where('ownerId', '==', userId),
        orderBy('updatedAt', 'desc'),
        firestoreLimit(limitParam)
      );
      const healthSnapshot = await getDocs(healthQuery);

      healthSnapshot.forEach((doc) => {
        const metric = doc.data() as HealthMetric;
        const matchesDate = metric.date?.toLowerCase().includes(searchLower);
        const matchesNotes = metric.notes?.toLowerCase().includes(searchLower);

        if (matchesDate || matchesNotes) {
          allResults.push(healthMetricToSearchResult(metric, doc.id));
          appCounts.health++;
        }
      });
    }

    // Search Album
    if (appsToSearch.includes('album')) {
      const momentsRef = collection(db, 'moments');
      const momentsQuery = query(
        momentsRef,
        where('ownerId', '==', userId),
        orderBy('updatedAt', 'desc'),
        firestoreLimit(limitParam)
      );
      const momentsSnapshot = await getDocs(momentsQuery);

      momentsSnapshot.forEach((doc) => {
        const moment = doc.data() as Moment;
        const matchesTitle = moment.title.toLowerCase().includes(searchLower);
        const matchesCaption = moment.caption
          ?.toLowerCase()
          .includes(searchLower);
        const matchesTags = moment.tags?.some((tag) =>
          tag.toLowerCase().includes(searchLower)
        );
        const matchesLocation = moment.location
          ?.toLowerCase()
          .includes(searchLower);

        if (matchesTitle || matchesCaption || matchesTags || matchesLocation) {
          allResults.push(momentToSearchResult(moment, doc.id));
          appCounts.album++;
        }
      });
    }

    // Search Habits (Learning Goals)
    if (appsToSearch.includes('habits')) {
      const goalsRef = collection(db, 'learning_goals');
      const goalsQuery = query(
        goalsRef,
        where('ownerId', '==', userId),
        orderBy('updatedAt', 'desc'),
        firestoreLimit(limitParam)
      );
      const goalsSnapshot = await getDocs(goalsQuery);

      goalsSnapshot.forEach((doc) => {
        const goal = doc.data() as LearningGoal;
        const matchesTitle = goal.title.toLowerCase().includes(searchLower);
        const matchesDescription = goal.description
          ?.toLowerCase()
          .includes(searchLower);

        if (matchesTitle || matchesDescription) {
          allResults.push(learningGoalToSearchResult(goal, doc.id));
          appCounts.habits++;
        }
      });
    }

    // Search Display (Health Metrics)
    if (appsToSearch.includes('hub')) {
      const metricsRef = collection(db, 'health_metrics');
      const metricsQuery = query(
        metricsRef,
        where('ownerId', '==', userId),
        orderBy('updatedAt', 'desc'),
        firestoreLimit(limitParam)
      );
      const metricsSnapshot = await getDocs(metricsQuery);

      metricsSnapshot.forEach((doc) => {
        const metric = doc.data() as HealthMetric;
        const matchesDate = metric.date.toLowerCase().includes(searchLower);
        const matchesNotes = metric.notes?.toLowerCase().includes(searchLower);

        if (matchesDate || matchesNotes) {
          allResults.push(healthMetricToSearchResult(metric, doc.id));
          appCounts.hub++;
        }
      });
    }

    // Search Fit (Workouts)
    if (appsToSearch.includes('fit')) {
      const workoutsRef = collection(db, 'workouts');
      const workoutsQuery = query(
        workoutsRef,
        where('ownerId', '==', userId),
        orderBy('updatedAt', 'desc'),
        firestoreLimit(limitParam)
      );
      const workoutsSnapshot = await getDocs(workoutsQuery);

      workoutsSnapshot.forEach((doc) => {
        const workout = doc.data() as Workout;
        const matchesName = workout.name.toLowerCase().includes(searchLower);
        const matchesNotes = workout.notes?.toLowerCase().includes(searchLower);
        const matchesExercises = workout.exercises.some((ex) =>
          ex.exerciseName.toLowerCase().includes(searchLower)
        );

        if (matchesName || matchesNotes || matchesExercises) {
          allResults.push(workoutToSearchResult(workout, doc.id));
          appCounts.fit++;
        }
      });
    }

    // Sort results
    if (sortBy === 'date') {
      allResults.sort((a, b) => b.updatedAt - a.updatedAt);
    }

    const response: SearchResponse = {
      results: allResults,
      totalCount: allResults.length,
      appCounts,
      query: searchQuery,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
