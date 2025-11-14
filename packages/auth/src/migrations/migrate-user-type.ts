/**
 * Firestore User Type Migration Script
 * Migrates users from legacy app permission fields to consolidated appsEligible field
 *
 * Usage:
 *   import { migrateAllUsers, migrateSingleUser } from '@ainexsuite/auth/migrations';
 *
 *   // Migrate all users
 *   await migrateAllUsers();
 *
 *   // Migrate single user
 *   await migrateSingleUser('user-id-here');
 */

import { db } from '@ainexsuite/firebase';
import { migrateUserData, calculateAccountType, calculateTrialEndDate } from '../user-utils';
import type { User } from '@ainexsuite/types';

interface MigrationResult {
  userId: string;
  success: boolean;
  error?: string;
  changes?: Partial<User>;
}

interface MigrationSummary {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  results: MigrationResult[];
  startTime: number;
  endTime: number;
  duration: number;
}

/**
 * Migrate a single user's data
 */
export async function migrateSingleUser(userId: string): Promise<MigrationResult> {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return {
        userId,
        success: false,
        error: 'User document not found',
      };
    }

    const userData = userDoc.data() as User;

    // Check if migration is needed
    if (userData.appsEligible && userData.appsEligible.length > 0) {
      // User already migrated, just update calculated fields
      const updates: Partial<User> = {
        accountType: calculateAccountType(userData),
        trialEndDate: userData.trialStartDate ? calculateTrialEndDate(userData.trialStartDate) : undefined,
      };

      await userRef.update(updates);

      return {
        userId,
        success: true,
        changes: updates,
      };
    }

    // Perform migration
    const migrationData = migrateUserData(userData);

    if (!migrationData.appsEligible || migrationData.appsEligible.length === 0) {
      return {
        userId,
        success: false,
        error: 'No apps found to migrate',
      };
    }

    // Update Firestore
    await userRef.update({
      ...migrationData,
      // Keep legacy fields for backward compatibility
      // They will be removed in a future cleanup migration
    });

    return {
      userId,
      success: true,
      changes: migrationData,
    };
  } catch (error) {
    return {
      userId,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Migrate all users in batches
 */
export async function migrateAllUsers(
  batchSize: number = 100,
  onProgress?: (summary: Partial<MigrationSummary>) => void
): Promise<MigrationSummary> {
  const startTime = Date.now();
  const results: MigrationResult[] = [];
  let successful = 0;
  let failed = 0;
  let skipped = 0;

  try {
    const usersRef = db.collection('users');
    let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;
    let hasMore = true;

    while (hasMore) {
      // Build query
      let query = usersRef.orderBy('createdAt').limit(batchSize);

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      // Fetch batch
      const snapshot = await query.get();

      if (snapshot.empty) {
        hasMore = false;
        break;
      }

      // Process batch
      const batchPromises = snapshot.docs.map(doc =>
        migrateSingleUser(doc.id)
      );

      const batchResults = await Promise.all(batchPromises);

      batchResults.forEach(result => {
        results.push(result);

        if (result.success) {
          if (result.changes && Object.keys(result.changes).length > 0) {
            successful++;
          } else {
            skipped++;
          }
        } else {
          failed++;
        }
      });

      // Report progress
      if (onProgress) {
        onProgress({
          total: results.length,
          successful,
          failed,
          skipped,
          results,
          startTime,
        });
      }

      // Prepare for next batch
      lastDoc = snapshot.docs[snapshot.docs.length - 1];

      if (snapshot.docs.length < batchSize) {
        hasMore = false;
      }

      // Rate limiting - wait 500ms between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const endTime = Date.now();

    return {
      total: results.length,
      successful,
      failed,
      skipped,
      results,
      startTime,
      endTime,
      duration: endTime - startTime,
    };
  } catch (error) {
    const endTime = Date.now();

    return {
      total: results.length,
      successful,
      failed,
      skipped,
      results,
      startTime,
      endTime,
      duration: endTime - startTime,
    };
  }
}

/**
 * Dry run migration - preview changes without updating Firestore
 */
export async function dryRunMigration(
  batchSize: number = 100
): Promise<{
  totalUsers: number;
  needsMigration: number;
  alreadyMigrated: number;
  noApps: number;
  preview: Array<{ userId: string; currentApps: string[]; newApps: string[] }>;
}> {
  const usersRef = db.collection('users');
  let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;
  let hasMore = true;

  const preview: Array<{ userId: string; currentApps: string[]; newApps: string[] }> = [];
  let totalUsers = 0;
  let needsMigration = 0;
  let alreadyMigrated = 0;
  let noApps = 0;

  while (hasMore) {
    let query = usersRef.orderBy('createdAt').limit(batchSize);

    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      hasMore = false;
      break;
    }

    snapshot.docs.forEach(doc => {
      totalUsers++;
      const userData = doc.data() as User;

      if (userData.appsEligible && userData.appsEligible.length > 0) {
        alreadyMigrated++;
      } else {
        const migrationData = migrateUserData(userData);

        if (!migrationData.appsEligible || migrationData.appsEligible.length === 0) {
          noApps++;
        } else {
          needsMigration++;
          preview.push({
            userId: doc.id,
            currentApps: [],
            newApps: migrationData.appsEligible,
          });
        }
      }
    });

    lastDoc = snapshot.docs[snapshot.docs.length - 1];

    if (snapshot.docs.length < batchSize) {
      hasMore = false;
    }
  }

  return {
    totalUsers,
    needsMigration,
    alreadyMigrated,
    noApps,
    preview: preview.slice(0, 10), // Return first 10 for preview
  };
}

/**
 * CLI-friendly migration runner
 */
export async function runMigration() {
  console.log('🔄 AinexSuite User Migration Tool');
  console.log('==================================\n');

  console.log('Step 1: Dry Run (Preview Changes)');
  console.log('----------------------------------');

  const dryRun = await dryRunMigration();

  console.log(`Total Users: ${dryRun.totalUsers}`);
  console.log(`Already Migrated: ${dryRun.alreadyMigrated}`);
  console.log(`Needs Migration: ${dryRun.needsMigration}`);
  console.log(`No Apps Found: ${dryRun.noApps}`);

  if (dryRun.preview.length > 0) {
    console.log('\nPreview of Changes (first 10):');
    dryRun.preview.forEach(item => {
      console.log(`  - ${item.userId}: ${item.newApps.join(', ')}`);
    });
  }

  if (dryRun.needsMigration === 0) {
    console.log('\n✅ No migration needed. All users are up to date!');
    return;
  }

  console.log('\nStep 2: Running Migration');
  console.log('-------------------------');

  const result = await migrateAllUsers(100, (progress) => {
    console.log(`Progress: ${progress.total} users processed (${progress.successful} migrated, ${progress.skipped} skipped, ${progress.failed} failed)`);
  });

  console.log('\n✅ Migration Complete!');
  console.log('======================');
  console.log(`Total: ${result.total}`);
  console.log(`Successful: ${result.successful}`);
  console.log(`Skipped: ${result.skipped}`);
  console.log(`Failed: ${result.failed}`);
  console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`);

  if (result.failed > 0) {
    console.log('\n❌ Failed Users:');
    result.results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`  - ${r.userId}: ${r.error}`);
      });
  }
}
