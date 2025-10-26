# Firebase Security Architect Skill

## Purpose
Design secure, scalable Firestore schemas and validate security rules to protect user data across all AINexSuite apps.

## When to Use
- When adding new Firestore collections
- When modifying security rules
- When designing data schemas
- Before deploying to production
- During security audits

## Firebase Project Details

**Project ID**: `alnexsuite`
**Auth Domain**: `alnexsuite.firebaseapp.com`
**Region**: us-central1 (recommended)

## Core Security Principles

### 1. User-Scoped Data
All user data MUST include an `ownerId` field:

```typescript
interface UserDocument {
  ownerId: string;  // REQUIRED: Firebase Auth UID
  // ... other fields
}
```

### 2. Top-Level Collections
Use top-level collections with `ownerId` pattern, NOT subcollections:

✅ **Correct:**
```
notes/
  {noteId}/
    ownerId: "user123"
    title: "..."
```

❌ **Wrong:**
```
users/
  {userId}/
    notes/
      {noteId}/
```

**Why?** Top-level collections enable:
- Cross-app queries
- Better scalability
- Simpler security rules
- Easier data export

### 3. Deny by Default
Start with deny-all rules, then explicitly allow:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Deny everything by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Collection Schemas

### Notes Collection
```typescript
// notes/{noteId}
interface Note {
  ownerId: string;          // Required
  title: string;
  body: string;
  color: NoteColor;
  pattern: NotePattern;
  labels: string[];
  pinned: boolean;
  archived: boolean;
  deleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Security Rules:**
```javascript
match /notes/{noteId} {
  allow read: if request.auth.uid == resource.data.ownerId;
  allow create: if request.auth.uid == request.resource.data.ownerId
    && request.resource.data.title is string
    && request.resource.data.title.size() <= 200
    && request.resource.data.body is string
    && request.resource.data.body.size() <= 10000;
  allow update: if request.auth.uid == resource.data.ownerId
    && request.resource.data.ownerId == resource.data.ownerId; // Can't change owner
  allow delete: if request.auth.uid == resource.data.ownerId;
}
```

### Journal Entries Collection
```typescript
// journal_entries/{entryId}
interface JournalEntry {
  ownerId: string;          // Required
  date: string;             // YYYY-MM-DD
  title: string;
  content: string;
  mood: MoodType;
  tags: string[];
  mediaUrls: string[];      // Firebase Storage URLs
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Security Rules:**
```javascript
match /journal_entries/{entryId} {
  allow read: if request.auth.uid == resource.data.ownerId;
  allow create: if request.auth.uid == request.resource.data.ownerId
    && request.resource.data.date is string
    && request.resource.data.date.matches('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
    && request.resource.data.content is string;
  allow update: if request.auth.uid == resource.data.ownerId;
  allow delete: if request.auth.uid == resource.data.ownerId;
}
```

### Todos Collection
```typescript
// todos/{todoId}
interface Todo {
  ownerId: string;          // Required
  title: string;
  description: string;
  completed: boolean;
  dueDate: Timestamp | null;
  priority: 'high' | 'medium' | 'low';
  projectId: string | null;
  subtasks: Subtask[];
  createdAt: Timestamp;
  completedAt: Timestamp | null;
}
```

**Security Rules:**
```javascript
match /todos/{todoId} {
  allow read: if request.auth.uid == resource.data.ownerId;
  allow create: if request.auth.uid == request.resource.data.ownerId
    && request.resource.data.title is string
    && request.resource.data.title.size() > 0;
  allow update: if request.auth.uid == resource.data.ownerId;
  allow delete: if request.auth.uid == resource.data.ownerId;
}
```

### Habits Collection
```typescript
// habits/{habitId}
interface Habit {
  ownerId: string;          // Required
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'custom';
  type: 'boolean' | 'numeric' | 'scale';
  goal: number | null;
  color: string;
  active: boolean;
  createdAt: Timestamp;
}

// habit_completions/{completionId}
interface HabitCompletion {
  ownerId: string;          // Required
  habitId: string;
  date: string;             // YYYY-MM-DD
  value: boolean | number;
  note: string;
  createdAt: Timestamp;
}
```

**Security Rules:**
```javascript
match /habits/{habitId} {
  allow read: if request.auth.uid == resource.data.ownerId;
  allow create: if request.auth.uid == request.resource.data.ownerId;
  allow update, delete: if request.auth.uid == resource.data.ownerId;
}

match /habit_completions/{completionId} {
  allow read: if request.auth.uid == resource.data.ownerId;
  allow create: if request.auth.uid == request.resource.data.ownerId
    && exists(/databases/$(database)/documents/habits/$(request.resource.data.habitId))
    && get(/databases/$(database)/documents/habits/$(request.resource.data.habitId)).data.ownerId == request.auth.uid;
  allow update, delete: if request.auth.uid == resource.data.ownerId;
}
```

## Users Collection
```typescript
// users/{userId}
interface User {
  uid: string;              // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL: string;
  preferences: UserPreferences;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}
```

**Security Rules:**
```javascript
match /users/{userId} {
  allow read: if request.auth.uid == userId;
  allow create: if request.auth.uid == userId
    && request.resource.data.uid == userId;
  allow update: if request.auth.uid == userId
    && request.resource.data.uid == userId; // Can't change UID
  allow delete: if request.auth.uid == userId;
}
```

## Complete Security Rules Template

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user owns the resource
    function isOwner(ownerId) {
      return request.auth != null && request.auth.uid == ownerId;
    }

    // Helper function to validate string field
    function isValidString(field, minLen, maxLen) {
      return field is string
        && field.size() >= minLen
        && field.size() <= maxLen;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId)
        && request.resource.data.uid == userId;
      allow update: if isOwner(userId)
        && request.resource.data.uid == userId;
      allow delete: if isOwner(userId);
    }

    // Notes collection
    match /notes/{noteId} {
      allow read: if isOwner(resource.data.ownerId);
      allow create: if isOwner(request.resource.data.ownerId)
        && isValidString(request.resource.data.title, 1, 200)
        && isValidString(request.resource.data.body, 0, 10000);
      allow update: if isOwner(resource.data.ownerId)
        && request.resource.data.ownerId == resource.data.ownerId;
      allow delete: if isOwner(resource.data.ownerId);
    }

    // Journal entries collection
    match /journal_entries/{entryId} {
      allow read: if isOwner(resource.data.ownerId);
      allow create: if isOwner(request.resource.data.ownerId)
        && request.resource.data.date is string
        && request.resource.data.date.matches('^[0-9]{4}-[0-9]{2}-[0-9]{2}$');
      allow update: if isOwner(resource.data.ownerId);
      allow delete: if isOwner(resource.data.ownerId);
    }

    // Todos collection
    match /todos/{todoId} {
      allow read: if isOwner(resource.data.ownerId);
      allow create: if isOwner(request.resource.data.ownerId)
        && isValidString(request.resource.data.title, 1, 200);
      allow update: if isOwner(resource.data.ownerId);
      allow delete: if isOwner(resource.data.ownerId);
    }

    // Habits collection
    match /habits/{habitId} {
      allow read: if isOwner(resource.data.ownerId);
      allow create: if isOwner(request.resource.data.ownerId);
      allow update, delete: if isOwner(resource.data.ownerId);
    }

    // Habit completions collection
    match /habit_completions/{completionId} {
      allow read: if isOwner(resource.data.ownerId);
      allow create: if isOwner(request.resource.data.ownerId)
        && exists(/databases/$(database)/documents/habits/$(request.resource.data.habitId))
        && get(/databases/$(database)/documents/habits/$(request.resource.data.habitId)).data.ownerId == request.auth.uid;
      allow update, delete: if isOwner(resource.data.ownerId);
    }

    // Add more collections as needed...

    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Firestore Indexes

### When to Create Indexes

Firestore automatically creates single-field indexes. Create composite indexes for queries with:
- Multiple `where()` clauses
- Combination of `where()` and `orderBy()`
- `orderBy()` on multiple fields

### Common Index Requirements

**Notes: Filter by owner and sort by date**
```json
{
  "collectionGroup": "notes",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "ownerId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

**Journal Entries: Filter by owner and date**
```json
{
  "collectionGroup": "journal_entries",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "ownerId", "order": "ASCENDING" },
    { "fieldPath": "date", "order": "DESCENDING" }
  ]
}
```

**Todos: Filter by owner, project, and completion**
```json
{
  "collectionGroup": "todos",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "ownerId", "order": "ASCENDING" },
    { "fieldPath": "projectId", "order": "ASCENDING" },
    { "fieldPath": "completed", "order": "ASCENDING" },
    { "fieldPath": "dueDate", "order": "ASCENDING" }
  ]
}
```

### firestore.indexes.json

```json
{
  "indexes": [
    {
      "collectionGroup": "notes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "ownerId", "order": "ASCENDING" },
        { "fieldPath": "pinned", "order": "DESCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "journal_entries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "ownerId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "todos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "ownerId", "order": "ASCENDING" },
        { "fieldPath": "completed", "order": "ASCENDING" },
        { "fieldPath": "dueDate", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## Security Checklist

### Schema Design
- [ ] All documents have `ownerId` field
- [ ] Using top-level collections (not subcollections)
- [ ] Timestamps use Firestore Timestamp type
- [ ] String fields have max length validation
- [ ] Required fields are enforced in rules

### Security Rules
- [ ] Deny-all default rule exists
- [ ] All collections have explicit rules
- [ ] `ownerId` checked on all operations
- [ ] Can't change `ownerId` after creation
- [ ] Input validation for all fields
- [ ] No rules allowing public read/write

### Authentication
- [ ] All rules check `request.auth != null`
- [ ] Using `request.auth.uid` for ownership
- [ ] No reliance on client-side validation
- [ ] Session cookies configured correctly

### Performance
- [ ] Composite indexes for complex queries
- [ ] No N+1 query patterns
- [ ] Batch operations where possible
- [ ] Pagination implemented

## Common Security Vulnerabilities

### 1. Missing Owner Check
❌ **Vulnerable:**
```javascript
allow read: if request.auth != null;
```

✅ **Secure:**
```javascript
allow read: if request.auth.uid == resource.data.ownerId;
```

### 2. Mutable Owner Field
❌ **Vulnerable:**
```javascript
allow update: if request.auth.uid == resource.data.ownerId;
```

✅ **Secure:**
```javascript
allow update: if request.auth.uid == resource.data.ownerId
  && request.resource.data.ownerId == resource.data.ownerId;
```

### 3. No Input Validation
❌ **Vulnerable:**
```javascript
allow create: if request.auth.uid == request.resource.data.ownerId;
```

✅ **Secure:**
```javascript
allow create: if request.auth.uid == request.resource.data.ownerId
  && request.resource.data.title is string
  && request.resource.data.title.size() <= 200;
```

### 4. Subcollection Leaks
❌ **Vulnerable:**
```javascript
match /users/{userId}/{document=**} {
  allow read, write: if request.auth.uid == userId;
}
```

✅ **Secure:** Use top-level collections with `ownerId`

## Testing Security Rules

### Local Testing with Emulator
```bash
# Start emulator
firebase emulators:start --only firestore

# Run rules tests
firebase emulators:exec --only firestore "npm test"
```

### Manual Testing
```typescript
// Try to read another user's data (should fail)
const noteRef = doc(db, 'notes', 'someNoteId');
await getDoc(noteRef); // Should throw permission-denied

// Try to create document with wrong ownerId (should fail)
await setDoc(doc(db, 'notes', 'newNote'), {
  ownerId: 'differentUserId',
  title: 'Test'
}); // Should throw permission-denied
```

## Deployment Commands

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes

# Deploy both
firebase deploy --only firestore

# Test rules before deploying
firebase emulators:start --only firestore
```

## Resources

- [Firestore Security Rules Docs](https://firebase.google.com/docs/firestore/security/get-started)
- [Security Rules Reference](https://firebase.google.com/docs/reference/rules)
- [Index Best Practices](https://firebase.google.com/docs/firestore/query-data/indexing)

---

**Remember**: Security is not optional. Always validate ownership and input on every operation.
