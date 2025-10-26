# Firestore Indexes Guide

## Overview

Firestore requires composite indexes for queries that:
1. Filter on multiple fields
2. Combine a `where` clause with `orderBy` on different fields
3. Use `array-contains` with `orderBy`

## How Indexes Work

### Automatic Creation
- Single-field indexes are created automatically
- Composite indexes must be created manually or via `firestore.indexes.json`

### Index Building Process
1. **Define** indexes in `firestore.indexes.json`
2. **Deploy** using `firebase deploy --only firestore:indexes`
3. **Build** happens on Firebase servers (can take seconds to hours depending on data size)
4. **Ready** - indexes are available for queries

### Why Indexes Take Time to Build

Firestore needs to:
- Read all documents in the collection
- Extract and sort the indexed fields
- Create the index structure
- Distribute across multiple servers

For large collections (millions of documents), this can take hours.

## Deploying Indexes

```bash
# Deploy indexes only
firebase deploy --only firestore:indexes

# Deploy indexes and rules together
firebase deploy --only firestore:indexes,firestore:rules

# Deploy everything
firebase deploy
```

## Index Configuration

The `firestore.indexes.json` file defines all composite indexes:

```json
{
  "indexes": [
    {
      "collectionGroup": "notes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "pinned", "order": "DESCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### Query Scope

- **COLLECTION**: Index applies to a specific collection path (e.g., `users/{userId}/notes`)
- **COLLECTION_GROUP**: Index applies to all collections with that name across all documents (for cross-collection queries)

## Current Indexes

### Notes Collection
1. `pinned, updatedAt` - For sorting owned notes
2. `sharedWithUserIds (array-contains), pinned, updatedAt` - For finding shared notes
3. `ownerId, pinned, createdAt` - Legacy index
4. `ownerId, archived, createdAt` - For archived notes

### Reminders Collection
1. `status, fireAt` - For filtering reminders by status and date

## Testing Indexes

After deploying:
1. Check Firebase Console for index status
2. Wait for "Building" status to change to "Enabled"
3. Test queries in your app

## Common Issues

### "The query requires an index"
- Add the index to `firestore.indexes.json`
- Deploy using `firebase deploy --only firestore:indexes`
- Wait for the index to finish building

### "Index is currently building"
- This is normal! Wait for Firebase to finish building
- You can check status in Firebase Console
- Large collections may take hours

### Indexes Don't Start Automatically
- They DO start automatically after deployment
- The delay is the BUILD TIME, not deployment
- Use Firebase Console to monitor progress

## Best Practices

1. **Define indexes early** - Add them before deploying to production
2. **Monitor building status** - Check Firebase Console regularly
3. **Use COLLECTION scope** when possible - Faster and more efficient
4. **Plan ahead** - Indexes can take time to build on large datasets
5. **Test locally** - Use Firestore Emulator to catch index issues early

## Firestore Emulator

For local development:

```bash
# Start emulator
firebase emulators:start --only firestore

# Emulator automatically creates indexes (no build time!)
```

## Links

- [Firebase Console - Indexes](https://console.firebase.google.com/project/alnexsuite/firestore/indexes)
- [Firestore Index Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)

