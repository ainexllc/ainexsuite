/**
 * Space Migration Utilities
 *
 * Tools for migrating existing content to have explicit spaceId fields.
 * Run these migrations to ensure all content has proper space association.
 */

import {
  collection,
  query,
  getDocs,
  writeBatch,
  doc,
  limit,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './client';
import { PERSONAL_SPACE_ID } from './space-query-helpers';

export interface MigrationResult {
  collection: string;
  totalProcessed: number;
  totalUpdated: number;
  errors: string[];
  durationMs: number;
}

export interface MigrationOptions {
  /** Firestore collection path */
  collectionPath: string;
  /** User ID for user-scoped collections (e.g., users/{uid}/notes) */
  userId?: string;
  /** Batch size for updates (max 500) */
  batchSize?: number;
  /** Dry run - don't actually update, just count */
  dryRun?: boolean;
  /** Callback for progress updates */
  onProgress?: (processed: number, updated: number) => void;
}

/**
 * Migrate documents without spaceId to have spaceId: 'personal'
 *
 * This handles two collection patterns:
 * 1. Root collections (e.g., 'tasks', 'habits')
 * 2. User-scoped collections (e.g., 'users/{uid}/notes')
 */
export async function migrateCollectionToSpaceId(
  options: MigrationOptions
): Promise<MigrationResult> {
  const {
    collectionPath,
    userId,
    batchSize = 400, // Leave room for safety margin under 500 limit
    dryRun = false,
    onProgress,
  } = options;

  const startTime = Date.now();
  const result: MigrationResult = {
    collection: collectionPath,
    totalProcessed: 0,
    totalUpdated: 0,
    errors: [],
    durationMs: 0,
  };

  try {
    // Build collection reference
    const collectionRef = userId
      ? collection(db, 'users', userId, collectionPath)
      : collection(db, collectionPath);

    // Query documents without spaceId
    // Note: Firestore doesn't have a "field doesn't exist" query,
    // so we query all and filter in memory
    let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;
    let hasMore = true;

    while (hasMore) {
      // Build paginated query
      let q = query(collectionRef, limit(batchSize));
      if (lastDoc) {
        q = query(collectionRef, limit(batchSize), startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        hasMore = false;
        break;
      }

      // Filter documents that need migration (no spaceId or spaceId is null/undefined)
      const docsToMigrate = snapshot.docs.filter(doc => {
        const data = doc.data();
        return !data.spaceId || data.spaceId === null || data.spaceId === undefined;
      });

      result.totalProcessed += snapshot.size;

      if (docsToMigrate.length > 0 && !dryRun) {
        // Create batch update
        const batch = writeBatch(db);

        for (const docSnapshot of docsToMigrate) {
          const docRef = userId
            ? doc(db, 'users', userId, collectionPath, docSnapshot.id)
            : doc(db, collectionPath, docSnapshot.id);

          batch.update(docRef, { spaceId: PERSONAL_SPACE_ID });
        }

        try {
          await batch.commit();
          result.totalUpdated += docsToMigrate.length;
        } catch (error) {
          result.errors.push(`Batch update failed: ${error}`);
        }
      } else if (dryRun) {
        result.totalUpdated += docsToMigrate.length;
      }

      // Progress callback
      onProgress?.(result.totalProcessed, result.totalUpdated);

      // Pagination
      lastDoc = snapshot.docs[snapshot.docs.length - 1];
      hasMore = snapshot.size === batchSize;
    }
  } catch (error) {
    result.errors.push(`Migration failed: ${error}`);
  }

  result.durationMs = Date.now() - startTime;
  return result;
}

/**
 * Migrate all user-scoped collections for a specific user
 */
export async function migrateUserCollections(
  userId: string,
  collections: string[],
  options?: { dryRun?: boolean; onProgress?: (collection: string, result: MigrationResult) => void }
): Promise<MigrationResult[]> {
  const results: MigrationResult[] = [];

  for (const collectionPath of collections) {
    const result = await migrateCollectionToSpaceId({
      collectionPath,
      userId,
      dryRun: options?.dryRun,
    });
    results.push(result);
    options?.onProgress?.(collectionPath, result);
  }

  return results;
}

/**
 * Get migration status for a collection (count documents needing migration)
 */
export async function getMigrationStatus(
  collectionPath: string,
  userId?: string
): Promise<{ total: number; needsMigration: number; migrated: number }> {
  const collectionRef = userId
    ? collection(db, 'users', userId, collectionPath)
    : collection(db, collectionPath);

  const snapshot = await getDocs(collectionRef);

  let needsMigration = 0;
  let migrated = 0;

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (!data.spaceId || data.spaceId === null || data.spaceId === undefined) {
      needsMigration++;
    } else {
      migrated++;
    }
  });

  return {
    total: snapshot.size,
    needsMigration,
    migrated,
  };
}

/**
 * Collection configurations for each app
 */
export const APP_COLLECTIONS = {
  // Root collections
  tasks: { path: 'tasks', userScoped: false },
  habits: { path: 'habits', userScoped: false },
  habitCompletions: { path: 'habitCompletions', userScoped: false },
  journalEntries: { path: 'journal_entries', userScoped: false },
  moments: { path: 'moments', userScoped: false },
  healthMetrics: { path: 'health_metrics', userScoped: false },
  workouts: { path: 'workouts', userScoped: false },
  calendarEvents: { path: 'calendar_events', userScoped: false },
  projects: { path: 'projects', userScoped: false },

  // User-scoped collections
  notes: { path: 'notes', userScoped: true },
  docs: { path: 'docs', userScoped: true },
  tables: { path: 'tables', userScoped: true },
  workflows: { path: 'workflows', userScoped: true },
  subscriptions: { path: 'subscriptions', userScoped: true },
} as const;

export type AppCollectionKey = keyof typeof APP_COLLECTIONS;
