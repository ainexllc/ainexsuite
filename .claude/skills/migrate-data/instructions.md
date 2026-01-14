# migrate-data

Run Firestore data migrations with safety checks for AinexSuite.

## Instructions

Parse the command and arguments from the user's input after `/migrate-data`.

```
/migrate-data <command> [migration-name] [options]
```

## Commands

### 1. Dry Run

```
/migrate-data <migration-name> --dry-run
```

Preview what would be changed without modifying data.

**Steps:**

1. Identify the migration type from the name
2. Use Firebase MCP tools to query affected documents
3. Count documents that would be changed
4. Show sample transformations (first 5 documents)

**Example Output:**

```
Dry Run: add-space-id-to-notes
================================================================================

Target: users/{userId}/notes collection
Affected documents: 1,247 of 1,500 total (documents without spaceId)

Sample transformations:
--------------------------------------------------------------------------------
Document: users/abc123/notes/note1
  Before: { title: "My Note", content: "...", createdAt: ... }
  After:  { title: "My Note", content: "...", createdAt: ..., spaceId: "personal" }

Document: users/abc123/notes/note2
  Before: { title: "Work Ideas", content: "..." }
  After:  { title: "Work Ideas", content: "...", spaceId: "personal" }

[3 more samples...]

Estimated batches: 3 (500 docs per batch)
Estimated duration: ~5 seconds

Run `/migrate-data add-space-id-to-notes` to execute.
```

---

### 2. Execute Migration

```
/migrate-data <migration-name>
```

Run the migration with batch processing.

**Steps:**

1. **Confirm environment** - Ask user to confirm if running against production
2. **Create backup** - Export affected documents before migration
3. **Execute in batches** - Process 500 documents per batch
4. **Show progress** - Report progress after each batch
5. **Log results** - Save migration log to `migrations/<name>-<timestamp>.json`

**Safety Checks:**

```
MIGRATION: add-space-id-to-notes
================================================================================

Environment: ainexsuite (PRODUCTION)
Affected documents: 1,247

WARNING: This will modify production data.
A backup will be created at: migrations/backups/add-space-id-to-notes-2024-01-15T10-30-00.json

Type 'yes' to proceed, or 'dry-run' to preview first:
```

**Progress Output:**

```
Executing migration: add-space-id-to-notes
================================================================================

[Batch 1/3] Processing documents 1-500...
  Updated: 498 | Skipped: 2 | Errors: 0

[Batch 2/3] Processing documents 501-1000...
  Updated: 500 | Skipped: 0 | Errors: 0

[Batch 3/3] Processing documents 1001-1247...
  Updated: 249 | Skipped: 0 | Errors: 0

COMPLETE
================================================================================
Total processed: 1,247
Total updated: 1,247
Total skipped: 2
Total errors: 0
Duration: 4.2 seconds

Backup saved: migrations/backups/add-space-id-to-notes-2024-01-15T10-30-00.json
Log saved: migrations/logs/add-space-id-to-notes-2024-01-15T10-30-00.json
```

---

### 3. Rollback

```
/migrate-data rollback <migration-name>
```

Reverse a migration using backup data.

**Steps:**

1. Find the backup file for the migration
2. Show what will be restored
3. Confirm with user
4. Restore documents from backup

**Example:**

```
/migrate-data rollback add-space-id-to-notes
```

**Output:**

```
ROLLBACK: add-space-id-to-notes
================================================================================

Backup file: migrations/backups/add-space-id-to-notes-2024-01-15T10-30-00.json
Documents to restore: 1,247
Original migration date: 2024-01-15 10:30:00

WARNING: This will restore documents to their pre-migration state.

Type 'yes' to proceed:
```

---

### 4. List Migrations

```
/migrate-data list
```

Show available migrations and execution history.

**Steps:**

1. List predefined migrations from `APP_COLLECTIONS` in space-migration.ts
2. Scan `migrations/logs/` for execution history
3. Show status of each

**Output:**

```
AVAILABLE MIGRATIONS
================================================================================

Predefined Migrations:
--------------------------------------------------------------------------------
| Name                    | Target Collection        | Description                    |
|-------------------------|-------------------------|--------------------------------|
| add-space-id-tasks      | tasks                   | Add spaceId to root tasks      |
| add-space-id-habits     | habits                  | Add spaceId to root habits     |
| add-space-id-journal    | journal_entries         | Add spaceId to journal entries |
| add-space-id-notes      | users/{uid}/notes       | Add spaceId to user notes      |
| add-space-id-docs       | users/{uid}/docs        | Add spaceId to user docs       |
| add-space-id-tables     | users/{uid}/tables      | Add spaceId to user tables     |
| add-space-id-workflows  | users/{uid}/workflows   | Add spaceId to user workflows  |
| add-space-id-subs       | users/{uid}/subscriptions | Add spaceId to subscriptions |
| rename-ownerid-userid   | (custom)                | Rename ownerId field to userId |
| backfill-createdat      | (custom)                | Add createdAt to documents     |

Execution History:
--------------------------------------------------------------------------------
| Migration               | Date                | Status    | Documents |
|-------------------------|---------------------|-----------|-----------|
| add-space-id-tasks      | 2024-01-15 10:30    | Completed | 523       |
| add-space-id-notes      | 2024-01-14 15:45    | Completed | 1,247     |
| add-space-id-notes      | 2024-01-14 14:00    | Rolled Back | 1,247   |

Custom migrations can be created with `/migrate-data create <name>`
```

---

### 5. Create Migration

```
/migrate-data create <name>
```

Generate a new migration template file.

**Steps:**

1. Create `migrations/<name>.ts` with template
2. Create corresponding test file
3. Show next steps

**Template:**

```typescript
// migrations/<name>.ts
import {
  collection,
  getDocs,
  writeBatch,
  doc,
  query,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "@ainexsuite/firebase";

interface MigrationConfig {
  dryRun: boolean;
  batchSize: number;
  onProgress?: (processed: number, updated: number) => void;
}

interface MigrationResult {
  totalProcessed: number;
  totalUpdated: number;
  totalSkipped: number;
  errors: string[];
  durationMs: number;
}

/**
 * Migration: <name>
 * Description: <describe what this migration does>
 *
 * Created: <date>
 * Author: <author>
 */
export async function migrate(
  config: MigrationConfig,
): Promise<MigrationResult> {
  const { dryRun, batchSize = 500, onProgress } = config;
  const startTime = Date.now();

  const result: MigrationResult = {
    totalProcessed: 0,
    totalUpdated: 0,
    totalSkipped: 0,
    errors: [],
    durationMs: 0,
  };

  try {
    // TODO: Implement migration logic
    // 1. Query documents that need migration
    // 2. Transform each document
    // 3. Write in batches

    const collectionRef = collection(db, "your-collection");
    let lastDoc = null;
    let hasMore = true;

    while (hasMore) {
      let q = query(collectionRef, limit(batchSize));
      if (lastDoc) {
        q = query(collectionRef, limit(batchSize), startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        hasMore = false;
        break;
      }

      const docsToUpdate = snapshot.docs.filter((doc) => {
        const data = doc.data();
        // TODO: Filter condition for documents needing migration
        return !data.yourField;
      });

      result.totalProcessed += snapshot.size;

      if (docsToUpdate.length > 0 && !dryRun) {
        const batch = writeBatch(db);

        for (const docSnapshot of docsToUpdate) {
          // TODO: Define the transformation
          batch.update(doc(db, "your-collection", docSnapshot.id), {
            yourField: "newValue",
          });
        }

        try {
          await batch.commit();
          result.totalUpdated += docsToUpdate.length;
        } catch (error) {
          result.errors.push(`Batch failed: ${error}`);
        }
      } else if (dryRun) {
        result.totalUpdated += docsToUpdate.length;
      }

      result.totalSkipped += snapshot.size - docsToUpdate.length;
      onProgress?.(result.totalProcessed, result.totalUpdated);

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
 * Rollback function (optional)
 * Restores documents from backup
 */
export async function rollback(
  backupData: Record<string, unknown>[],
): Promise<void> {
  // TODO: Implement rollback logic
  const batch = writeBatch(db);

  for (const item of backupData) {
    const docRef = doc(db, "your-collection", item.id as string);
    batch.set(docRef, item.data as Record<string, unknown>);
  }

  await batch.commit();
}
```

**Output:**

```
Created migration template:
  - migrations/<name>.ts
  - migrations/<name>.test.ts

Next steps:
1. Edit migrations/<name>.ts to implement your migration logic
2. Test with: /migrate-data <name> --dry-run
3. Execute with: /migrate-data <name>
```

---

### 6. Status Check

```
/migrate-data status <collection>
```

Check migration status for a specific collection.

**Steps:**

1. Use Firebase MCP to query the collection
2. Count documents with/without spaceId
3. Report status

**Output:**

```
MIGRATION STATUS: tasks
================================================================================

Total documents: 523
With spaceId: 520 (99.4%)
Without spaceId: 3 (0.6%)

Documents needing migration:
- tasks/abc123 (created: 2023-12-01)
- tasks/def456 (created: 2023-11-15)
- tasks/ghi789 (created: 2023-10-20)

Status: MOSTLY COMPLETE (3 documents remaining)
```

---

## Predefined Migrations

These migrations use the `APP_COLLECTIONS` from `packages/firebase/src/space-migration.ts`:

### Root Collections (no userId required)

| Migration Name           | Collection       | Transformation            |
| ------------------------ | ---------------- | ------------------------- |
| add-space-id-tasks       | tasks            | Add `spaceId: 'personal'` |
| add-space-id-habits      | habits           | Add `spaceId: 'personal'` |
| add-space-id-completions | habitCompletions | Add `spaceId: 'personal'` |
| add-space-id-journal     | journal_entries  | Add `spaceId: 'personal'` |
| add-space-id-moments     | moments          | Add `spaceId: 'personal'` |
| add-space-id-health      | health_metrics   | Add `spaceId: 'personal'` |
| add-space-id-workouts    | workouts         | Add `spaceId: 'personal'` |
| add-space-id-calendar    | calendar_events  | Add `spaceId: 'personal'` |
| add-space-id-projects    | projects         | Add `spaceId: 'personal'` |

### User-Scoped Collections (requires userId)

| Migration Name         | Collection                   | Transformation            |
| ---------------------- | ---------------------------- | ------------------------- |
| add-space-id-notes     | users/{userId}/notes         | Add `spaceId: 'personal'` |
| add-space-id-docs      | users/{userId}/docs          | Add `spaceId: 'personal'` |
| add-space-id-tables    | users/{userId}/tables        | Add `spaceId: 'personal'` |
| add-space-id-workflows | users/{userId}/workflows     | Add `spaceId: 'personal'` |
| add-space-id-subs      | users/{userId}/subscriptions | Add `spaceId: 'personal'` |

---

## Using Firebase MCP Tools

The skill uses Firebase MCP tools for Firestore operations:

### Query Collection

```
Use: firestore_query_collection
- collection_path: "tasks" or "users/{userId}/notes"
- filters: [{ field: "spaceId", op: "EQUAL", compare_value: { string_value: null } }]
- limit: 500
```

### Get Documents

```
Use: firestore_get_documents
- paths: ["tasks/doc1", "tasks/doc2"]
```

### List Collections

```
Use: firestore_list_collections
```

### For User-Scoped Migrations

When migrating user-scoped collections:

1. First list all users with `auth_get_users`
2. Then iterate through each user's subcollection
3. Process in batches per user

---

## Migration Directory Structure

```
/Users/dinohorn/ainex/ainexsuite/
  migrations/
    backups/
      add-space-id-tasks-2024-01-15T10-30-00.json
      add-space-id-notes-2024-01-15T10-30-00.json
    logs/
      add-space-id-tasks-2024-01-15T10-30-00.json
      add-space-id-notes-2024-01-15T10-30-00.json
    add-space-id-custom.ts
    rename-field-example.ts
```

---

## Safety Guidelines

1. **Always dry-run first** - Never execute without previewing
2. **Production confirmation** - Require explicit 'yes' for production changes
3. **Backup before migration** - Export documents before modifying
4. **Batch processing** - Max 500 documents per batch (Firestore limit)
5. **Idempotent operations** - Migrations should be safe to run multiple times
6. **Error tracking** - Continue on single doc errors, log all failures
7. **Progress reporting** - Show progress for long-running migrations

---

## Error Handling

### No matching migration

```
Error: Unknown migration "<name>"

Available migrations:
  - add-space-id-tasks
  - add-space-id-habits
  - add-space-id-journal
  ...

Or create a custom migration with: /migrate-data create <name>
```

### No backup found for rollback

```
Error: No backup found for migration "<name>"

Available backups:
  - add-space-id-tasks (2024-01-15 10:30)
  - add-space-id-notes (2024-01-14 15:45)

Specify the exact backup with: /migrate-data rollback <name> --backup <timestamp>
```

### Firebase MCP not available

```
Error: Firebase MCP server not connected.

Please ensure:
1. Firebase MCP is configured in .claude/settings.json
2. You're authenticated with `firebase login`
3. Active project is set with `firebase use <project>`

Check status with: /firebase status
```

### Missing userId for user-scoped migration

```
Error: Migration "add-space-id-notes" requires a userId.

For user-scoped collections, specify the user:
  /migrate-data add-space-id-notes --user <userId>

Or migrate all users:
  /migrate-data add-space-id-notes --all-users

List users with: /migrate-data list-users
```

---

## Examples

```bash
# Preview a migration
/migrate-data add-space-id-tasks --dry-run

# Execute a root collection migration
/migrate-data add-space-id-tasks

# Migrate user-scoped collection for specific user
/migrate-data add-space-id-notes --user abc123

# Migrate user-scoped collection for all users
/migrate-data add-space-id-notes --all-users

# Check status of a collection
/migrate-data status tasks

# List all migrations and history
/migrate-data list

# Create a custom migration
/migrate-data create rename-coverimage-to-imageid

# Rollback a migration
/migrate-data rollback add-space-id-tasks

# Rollback to specific backup
/migrate-data rollback add-space-id-tasks --backup 2024-01-15T10-30-00
```

---

## Integration with Existing Code

This skill leverages:

1. **`packages/firebase/src/space-migration.ts`** - Core migration utilities
   - `migrateCollectionToSpaceId()` - Main migration function
   - `migrateUserCollections()` - Batch user migration
   - `getMigrationStatus()` - Status checking
   - `APP_COLLECTIONS` - Collection configurations

2. **Firebase MCP** - Direct Firestore operations
   - Query collections with filters
   - Batch document updates
   - User management

3. **Constants**
   - `PERSONAL_SPACE_ID = 'personal'` - Default space for legacy content

---

## Quick Reference

| Command                             | Description               |
| ----------------------------------- | ------------------------- |
| `/migrate-data <name> --dry-run`    | Preview migration         |
| `/migrate-data <name>`              | Execute migration         |
| `/migrate-data rollback <name>`     | Reverse migration         |
| `/migrate-data list`                | Show available migrations |
| `/migrate-data create <name>`       | Generate template         |
| `/migrate-data status <collection>` | Check collection status   |
