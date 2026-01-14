# type-gen

Generate TypeScript types from Firestore collection schemas for AinexSuite.

## Purpose

Analyze Firestore collections and generate/update TypeScript interfaces in `packages/types/src/`. Ensures types stay in sync with actual database schema.

## Usage

```
/type-gen <command> [collection] [options]
```

## Commands

### 1. Generate from Collection

```
/type-gen <collection-name>
```

Query Firestore for sample documents and generate a TypeScript interface.

**Steps:**

1. Use Firebase MCP to query the collection for sample documents (limit 10-20)
2. Analyze field types across all samples
3. Detect optional fields (not present in all docs)
4. Generate TypeScript interface
5. Display the generated type

**Firebase MCP Query:**

```
Use mcp__plugin_firebase_firebase__firestore_query_collection with:
- collection_path: "<collection-name>"
- limit: 20
- filters: [] (no filters, get varied samples)
```

**Type Mapping Rules:**

| Firestore Type                              | TypeScript Type                            |
| ------------------------------------------- | ------------------------------------------ |
| Timestamp (object with seconds/nanoseconds) | `Timestamp` (from common.ts)               |
| Timestamp (number)                          | `Timestamp` (from common.ts)               |
| DocumentReference                           | `string` (store just the ID)               |
| string                                      | `string`                                   |
| number                                      | `number`                                   |
| boolean                                     | `boolean`                                  |
| null                                        | `null`                                     |
| array                                       | `Type[]`                                   |
| map/object                                  | nested interface or `Record<string, Type>` |
| Date (ISO string YYYY-MM-DD)                | `string` with JSDoc comment                |

**Optionality Rules:**

- Field present in ALL documents: required
- Field present in SOME documents: optional (`?`)
- Field sometimes null: `Type | null`

**Output Format:**

```typescript
/**
 * Generated from Firestore collection: <collection-name>
 * Analyzed X documents
 * Generated at: <timestamp>
 */
export interface <InterfaceName> {
  /** Document ID */
  id: string;
  /** Owner user ID */
  ownerId: string;
  // ... other fields with JSDoc comments
}
```

---

### 2. Diff Against Existing

```
/type-gen <collection-name> --diff
```

Compare generated type with existing type definition.

**Steps:**

1. Generate type from Firestore (same as above)
2. Find existing type file in `packages/types/src/`
3. Parse existing interface
4. Compare fields and report differences

**Collection to Type File Mapping:**

| Collection        | Type File       | Interface Name  |
| ----------------- | --------------- | --------------- |
| notes             | note.ts         | Note            |
| journal_entries   | journal.ts      | JournalEntry    |
| tasks / todos     | todo.ts         | Todo            |
| habits            | habit.ts        | Habit           |
| habit_completions | habit.ts        | HabitCompletion |
| health_metrics    | health.ts       | HealthMetric    |
| spaces            | space.ts        | Space           |
| fit_spaces        | fitness.ts      | FitSpace        |
| todo_spaces       | space.ts        | (check context) |
| journal_spaces    | space.ts        | (check context) |
| users             | user.ts         | User            |
| subscriptions     | subscription.ts | Subscription    |
| activities        | activity.ts     | Activity        |

**Diff Output Format:**

```
Type Diff for <collection-name>:

Added fields (in Firestore, not in type):
  + newField: string
  + anotherField?: number

Removed fields (in type, not in Firestore):
  - deprecatedField: boolean

Changed fields (type mismatch):
  ~ someField: string -> number
  ~ optionalField: required -> optional

Matching fields: 15
```

---

### 3. Update Types

```
/type-gen <collection-name> --update
```

Update the type file with new fields from Firestore.

**Steps:**

1. Generate type from Firestore
2. Load existing type file
3. Merge: add new fields, preserve existing (don't remove)
4. Preserve JSDoc comments
5. Update the file using Edit tool
6. Run type-check to verify

**Update Rules:**

- ADD new fields as optional (safer)
- PRESERVE existing fields and comments
- PRESERVE existing types (don't change string to number)
- ADD JSDoc comment `/** @generated from Firestore */` to new fields
- Keep BaseDocument extension if present

**Example:**

```typescript
// Before
export interface Note extends BaseDocument {
  title: string;
  body: string;
}

// After (with new fields from Firestore)
export interface Note extends BaseDocument {
  title: string;
  body: string;
  /** @generated from Firestore */
  color?: string;
  /** @generated from Firestore */
  labels?: string[];
}
```

---

### 4. Audit All Types

```
/type-gen audit
```

Check all collections against their type definitions.

**Steps:**

1. Loop through all supported collections
2. For each: generate from Firestore and compare to type
3. Compile report of all mismatches

**Supported Collections:**

| Collection        | Expected Type   | Status |
| ----------------- | --------------- | ------ |
| notes             | Note            | check  |
| journal_entries   | JournalEntry    | check  |
| tasks             | Todo            | check  |
| habits            | Habit           | check  |
| habit_completions | HabitCompletion | check  |
| health_metrics    | HealthMetric    | check  |
| spaces            | Space           | check  |
| users             | User            | check  |
| subscriptions     | Subscription    | check  |
| activities        | Activity        | check  |

**Audit Output Format:**

```
Type Audit Report
=================

Collection: notes
  Status: MATCH (all fields aligned)

Collection: journal_entries
  Status: DRIFT
  + 2 fields in Firestore not in type
  - 1 field in type not in Firestore

Collection: tasks
  Status: MATCH

...

Summary:
  Matched: 7/10 collections
  Drifted: 3/10 collections

Recommendations:
  Run "/type-gen journal_entries --update" to sync
  Run "/type-gen habits --update" to sync
```

---

## Type File Structure

All types are in `/Users/dinohorn/ainex/ainexsuite/packages/types/src/`

**Standard Structure:**

```typescript
import type { BaseDocument, Timestamp } from './common';

/**
 * <Description>
 * Collection: <collection-name>
 */
export interface <Name> extends BaseDocument {
  // Fields...
}

export type Create<Name>Input = Omit<Name, 'id' | 'createdAt' | 'updatedAt'>;
export type Update<Name>Input = Partial<Omit<Name, 'id' | 'ownerId' | 'createdAt'>>;
```

**BaseDocument provides:**

```typescript
interface BaseDocument {
  id: string;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Field Type Detection

**Detect Timestamp:**

```typescript
// Firestore Timestamp object
if (
  typeof value === "object" &&
  value !== null &&
  "seconds" in value &&
  "nanoseconds" in value
) {
  return "Timestamp";
}
// Numeric timestamp (milliseconds)
if (typeof value === "number" && value > 1000000000000) {
  return "Timestamp";
}
```

**Detect Date String:**

```typescript
// YYYY-MM-DD format
if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
  return "string"; // with JSDoc: @format date
}
```

**Detect Reference:**

```typescript
// Document reference (path string or object with path)
if (typeof value === "object" && value !== null && "path" in value) {
  return "string"; // Just store the ID
}
```

**Detect Union Types:**

```typescript
// If a field has different primitive types across docs, use union
// e.g., value: string | number
```

---

## Examples

### Generate note type

```
/type-gen notes
```

Output:

```typescript
/**
 * Generated from Firestore collection: notes
 * Analyzed 15 documents
 */
export interface Note extends BaseDocument {
  /** Note title */
  title: string;
  /** Note body/content */
  body: string;
  /** Color theme */
  color: NoteColor;
  /** Background pattern */
  pattern: NotePattern;
  /** User-defined labels */
  labels: string[];
  /** Pinned to top */
  pinned: boolean;
  /** Archived status */
  archived: boolean;
  /** Soft delete flag */
  deleted: boolean;
  /** Space ID (personal or shared) */
  spaceId: string;
}
```

### Diff journal entries

```
/type-gen journal_entries --diff
```

Output:

```
Type Diff for journal_entries:

Added fields (in Firestore, not in type):
  + aiSummary?: string

Removed fields (in type, not in Firestore):
  (none)

Changed fields:
  (none)

Matching fields: 18
Status: DRIFT (1 field to add)
```

### Update habit type

```
/type-gen habits --update
```

Output:

```
Updated packages/types/src/habit.ts

Added fields:
  + reminderTime?: string
  + streak?: number

Type check: PASSED
```

### Full audit

```
/type-gen audit
```

---

## Error Handling

### Collection not found

```
Error: Collection "<name>" not found or empty.
Available collections: notes, journal_entries, tasks, habits, health_metrics, spaces, users, subscriptions, activities
```

### Firebase MCP not available

```
Error: Firebase MCP not available.
Make sure the Firebase MCP server is configured in .claude/settings.json
```

### Type file not found

```
Warning: No type file found for collection "<name>".
Expected location: packages/types/src/<name>.ts

Generate new type file? (This will create a new file)
```

### Parse error

```
Error: Could not parse existing type file at packages/types/src/<name>.ts
The file may have non-standard formatting. Manual review recommended.
```

---

## Firebase MCP Usage

Query collection samples:

```
mcp__plugin_firebase_firebase__firestore_query_collection
  collection_path: "notes"
  filters: []
  limit: 20
```

Get specific documents for deeper analysis:

```
mcp__plugin_firebase_firebase__firestore_get_documents
  paths: ["notes/doc1", "notes/doc2"]
```

List collections (for audit):

```
mcp__plugin_firebase_firebase__firestore_list_collections
```

---

## Type Index Update

After creating new type files, update `packages/types/src/index.ts`:

```typescript
export * from "./<new-type>";
```

---

## Best Practices

1. **Run audit regularly** - Keep types in sync with schema
2. **Review before --update** - Always diff first
3. **Preserve custom types** - Don't overwrite hand-crafted union types
4. **Use BaseDocument** - All user data should extend BaseDocument
5. **Add JSDoc** - Document non-obvious fields
6. **Keep optionality safe** - New fields should be optional
7. **Test after update** - Run `pnpm type-check` after changes

---

## Collection Reference

| Collection        | Description            | Type File       |
| ----------------- | ---------------------- | --------------- |
| notes             | User notes             | note.ts         |
| journal_entries   | Journal/diary entries  | journal.ts      |
| tasks             | Todo items             | todo.ts         |
| habits            | Habit definitions      | habit.ts        |
| habit_completions | Daily habit records    | habit.ts        |
| health_metrics    | Daily health data      | health.ts       |
| spaces            | Shared spaces          | space.ts        |
| users             | User profiles          | user.ts         |
| subscriptions     | Stripe subscriptions   | subscription.ts |
| activities        | Activity log           | activity.ts     |
| note_labels       | Note label definitions | note.ts         |
| projects          | Todo projects          | todo.ts         |
| fit_workouts      | Workout sessions       | fitness.ts      |
| fit_exercises     | Exercise definitions   | fitness.ts      |
