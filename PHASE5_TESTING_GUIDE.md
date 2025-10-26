# Phase 5: Cross-App Integration Testing Guide

**Status**: Infrastructure Complete ✅
**Last Updated**: January 2025
**Development Servers**: Main (3010), Notes (3001)

---

## 🎯 Overview

This guide explains how to manually test the Phase 5 cross-app integration features:
1. **Activity Logging** - Tracks user actions across all 8 apps
2. **Activity Feed** - Real-time display of activities on the dashboard
3. **Universal Search** - Search across all apps from the main dashboard

---

## 🚀 Quick Start

### Start Development Servers

```bash
# From the root directory
cd /Users/dino/ainex/ainexsuite

# Option 1: Start all apps (recommended)
pnpm dev

# Option 2: Start specific apps
pnpm dev:main    # Main dashboard (port 3010)
pnpm dev:notes   # Notes app (port 3001)
pnpm dev:journal # Journal app (port 3002)
pnpm dev:todo    # Todo app (port 3003)
# ... etc for other apps
```

**Currently Running**:
- ✅ Main Dashboard: http://localhost:3010
- ✅ Notes App: http://localhost:3001

---

## 🧪 Test 1: Activity Logging System

### What Gets Logged

Every CRUD operation in all 8 apps creates an activity record in Firestore:

| App | Actions Logged | Collection |
|-----|---------------|------------|
| Notes | create, update, delete | `notes` |
| Journal | create, update, delete | `journal_entries` |
| Todo | create, update, delete, completed | `tasks` |
| Track | create, update, delete | `habits` |
| Moments | create, update, delete | `moments` |
| Grow | create, update, delete | `learning_goals` |
| Pulse | create, update, delete | `health_metrics` |
| Fit | create, update, delete | `workouts` |

### Test Steps

#### 1. Create a Note (Notes App)
1. Navigate to http://localhost:3001
2. Click the "+" or "New Note" button
3. Add a title and content
4. Save the note
5. **Expected Result**: Activity logged to Firestore `activities` collection
   ```javascript
   {
     app: 'notes',
     action: 'created',
     itemType: 'note',
     itemId: '<note-id>',
     itemTitle: 'Your note title',
     ownerId: '<user-id>',
     timestamp: 1234567890,
     metadata: { color: 'default', labels: [] }
   }
   ```

#### 2. Update a Note
1. Open an existing note
2. Modify the title or content
3. Save changes
4. **Expected Result**: Activity logged with `action: 'updated'`

#### 3. Delete a Note
1. Open a note
2. Click the delete button
3. Confirm deletion
4. **Expected Result**: Activity logged with `action: 'deleted'`

#### 4. Complete a Task (Todo App)
1. Navigate to http://localhost:3003
2. Create a new task
3. Check the task as completed
4. **Expected Result**: Activity logged with `action: 'completed'` (special case for todos)

### Verify in Firestore

To check that activities are being logged:

1. **Using Firebase Console**:
   - Go to https://console.firebase.google.com/project/alnexsuite/firestore
   - Navigate to the `activities` collection
   - Look for recent documents with your user ID

2. **Using Firebase CLI**:
   ```bash
   # View recent activities (requires Firestore emulator or direct query)
   firebase firestore:get activities --limit 10
   ```

3. **Check Browser DevTools**:
   - Open browser console (F12)
   - Look for any errors in activity logging (wrapped in try-catch so won't break the app)
   - Network tab should show Firestore writes

---

## 📊 Test 2: Real-Time Activity Feed

### Component Location
`apps/main/src/components/activity-feed.tsx`

### Features to Test

#### Basic Display
1. Navigate to http://localhost:3010 (main dashboard)
2. Look for the Activity Feed component (if integrated on the page)
3. **Expected**: See a list of recent activities from all apps

#### Real-Time Updates
1. Keep the main dashboard open
2. In another tab, create a note at http://localhost:3001
3. Return to the dashboard
4. **Expected**: New activity appears in the feed without refreshing

#### Filtering by App
1. Find the app filter dropdown in the Activity Feed
2. Select "notes" from the filter
3. **Expected**: Only activities from the Notes app are displayed

#### Filtering by Action
1. Find the action filter dropdown
2. Select "created" from the filter
3. **Expected**: Only creation activities are displayed

#### Pagination
1. If you have more than 50 activities
2. Scroll to the bottom of the feed
3. **Expected**: "Load More" button appears and loads next page

### API Endpoint

The Activity Feed uses the `getActivityFeed()` function from `@ainexsuite/firebase`:

```typescript
import { getActivityFeed } from '@ainexsuite/firebase';

// Basic usage
const response = await getActivityFeed({ limit: 20 });

// With filters
const response = await getActivityFeed({
  limit: 20,
  apps: ['notes', 'journal'],
  actions: ['created', 'updated']
});
```

### Firestore Queries

The feed uses these composite indexes (deployed):
1. `ownerId` + `timestamp` (DESC) - Default feed
2. `ownerId` + `app` + `timestamp` (DESC) - Filter by app
3. `ownerId` + `action` + `timestamp` (DESC) - Filter by action

---

## 🔍 Test 3: Universal Search

### Component Location
`apps/main/src/components/universal-search.tsx`

### Features to Test

#### Open Search Modal
1. Navigate to http://localhost:3010
2. Press `⌘K` (Mac) or `Ctrl+K` (Windows/Linux)
3. **Expected**: Search modal opens

#### Basic Search
1. Type a search query (e.g., "meeting")
2. **Expected**: Results appear from all apps that match
3. Results should show:
   - App name and icon
   - Item title
   - Snippet of content
   - Created/updated date

#### Search Across Apps
1. Create content in multiple apps:
   - Note titled "Project Meeting"
   - Journal entry mentioning "meeting"
   - Todo task "Prepare meeting agenda"
2. Search for "meeting"
3. **Expected**: Results from all 3 apps appear

#### Keyboard Navigation
1. Open search (⌘K)
2. Type a query
3. Press `ArrowDown` to move to next result
4. Press `ArrowUp` to move to previous result
5. Press `Enter` to open selected result
6. Press `Escape` to close modal
7. **Expected**: All keyboard shortcuts work correctly

#### Deep Linking
1. Search for an item
2. Click or press Enter on a result
3. **Expected**: Navigates to the specific item in its app
   - Note: Opens http://localhost:3001?note={id}
   - Journal: Opens http://localhost:3002?entry={id}
   - Task: Opens http://localhost:3003?task={id}
   - etc.

#### Filter by App
1. Open search
2. Select an app from the filter dropdown (if available)
3. **Expected**: Only results from that app appear

### API Endpoint

The search uses the `/api/search` endpoint:

```bash
# Test the search API directly
curl "http://localhost:3010/api/search?q=test&limit=10"

# Filter by specific apps
curl "http://localhost:3010/api/search?q=test&apps=notes,journal"

# Sort by date (default) or relevance
curl "http://localhost:3010/api/search?q=test&sortBy=date"
```

### Search Fields by App

| App | Searchable Fields |
|-----|------------------|
| Notes | title, body, labels |
| Journal | content |
| Todo | title, description |
| Track | name, description |
| Moments | title, caption, tags, location |
| Grow | title, description |
| Pulse | date, notes |
| Fit | name, notes, exercise names |

---

## 🔐 Test 4: Firestore Security Rules

### What's Protected

The activities collection has strict security rules:

```javascript
// Read: Only your own activities
allow read: if isOwner(resource.data.ownerId);

// Create: Validated data
allow create: if isOwner(request.resource.data.ownerId)
  && request.resource.data.app in ['notes', 'journal', 'todo', ...]
  && request.resource.data.action in ['created', 'updated', 'deleted', ...]
  && isValidString(request.resource.data.itemType, 1, 50)
  && isValidString(request.resource.data.itemTitle, 1, 200);

// Update: Disabled (activities are immutable)
allow update: if false;

// Delete: Only your own activities
allow delete: if isOwner(resource.data.ownerId);
```

### Test Security

#### Test 1: Can't Read Other Users' Activities
1. Try to query activities with a different ownerId
2. **Expected**: Permission denied error

#### Test 2: Can't Create Invalid Activities
1. Try to create an activity with invalid `app` name
2. **Expected**: Validation error

#### Test 3: Can't Update Activities
1. Try to update an existing activity
2. **Expected**: Permission denied (activities are immutable)

#### Test 4: Can Delete Your Own Activities
1. Delete one of your own activities
2. **Expected**: Success

---

## 🐛 Troubleshooting

### Issue: Activities Not Appearing in Feed

**Check**:
1. User is authenticated (check `auth.currentUser`)
2. Activities are being created in Firestore
3. Firestore indexes are deployed and built
4. No errors in browser console
5. Real-time listener is attached

**Solution**:
```bash
# Verify indexes are deployed
firebase firestore:indexes

# Re-deploy if needed
firebase deploy --only firestore:indexes

# Check browser console for errors
```

### Issue: Search Not Finding Results

**Check**:
1. Data exists in Firestore collections
2. Search query matches content (case-insensitive)
3. User owns the data being searched
4. No TypeScript errors in search converters

**Solution**:
```bash
# Test the API endpoint directly
curl "http://localhost:3010/api/search?q=test"

# Check the response for errors
```

### Issue: Missing Composite Indexes

**Symptoms**: "The query requires an index" error in console

**Solution**:
```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# Wait for indexes to build (can take a few minutes)
# Check status in Firebase Console
```

### Issue: TypeScript Errors

**Symptoms**: Type errors when calling activity or search functions

**Solution**:
```bash
# Rebuild types package
cd packages/types
pnpm build

# Rebuild the app
cd ../../apps/main  # or whichever app
pnpm build
```

---

## ✅ Test Checklist

Use this checklist to verify all Phase 5 features:

### Activity Logging
- [ ] Create note → Activity logged
- [ ] Update note → Activity logged
- [ ] Delete note → Activity logged
- [ ] Create journal entry → Activity logged
- [ ] Create task → Activity logged
- [ ] Complete task → Activity logged with "completed" action
- [ ] Create habit → Activity logged
- [ ] All 8 apps logging correctly
- [ ] Activities visible in Firestore console
- [ ] No errors in browser console

### Activity Feed
- [ ] Feed displays on main dashboard
- [ ] Recent activities appear
- [ ] Real-time updates work (no refresh needed)
- [ ] Filter by app works
- [ ] Filter by action works
- [ ] Pagination works (if >50 activities)
- [ ] Activity metadata displays correctly
- [ ] Timestamps are accurate

### Universal Search
- [ ] ⌘K opens search modal
- [ ] Search finds items across all apps
- [ ] Results display app name and icon
- [ ] Results show relevant content snippets
- [ ] Keyboard navigation works (arrows, enter, escape)
- [ ] Deep links navigate to correct items
- [ ] Filter by app works
- [ ] Search is case-insensitive
- [ ] Empty query shows no results

### Security & Performance
- [ ] Firestore rules enforced
- [ ] Composite indexes deployed
- [ ] No permission errors in console
- [ ] Search is fast (<500ms)
- [ ] Activity feed loads quickly
- [ ] No memory leaks (check DevTools)
- [ ] Real-time listeners clean up on unmount

---

## 📈 Performance Benchmarks

### Expected Performance

| Operation | Expected Time |
|-----------|--------------|
| Create activity | <100ms |
| Load activity feed | <500ms |
| Real-time activity update | <100ms |
| Universal search | <300ms |
| Open search modal | <50ms |
| Navigate to result | <100ms |

### Monitoring

Check performance in browser DevTools:
1. Network tab → Firestore requests
2. Performance tab → Component render times
3. Console → Any warnings or errors

---

## 🎉 Success Criteria

Phase 5 is considered fully functional when:

1. ✅ All 8 apps log activities correctly
2. ✅ Activity feed displays real-time updates
3. ✅ Universal search finds content across all apps
4. ✅ Firestore security rules are enforced
5. ✅ Composite indexes are active and fast
6. ✅ No errors in development mode
7. ✅ All TypeScript types are correct
8. ✅ Deep links navigate correctly

---

## 📚 Additional Resources

### Code References

**Activity Logging Implementation**:
- `packages/firebase/src/activities.ts` - Core functions
- `apps/notes/src/lib/notes.ts:47-62` - Notes integration
- `apps/journal/src/lib/journal.ts` - Journal integration
- `apps/todo/src/lib/todo.ts` - Todo integration

**Search Implementation**:
- `apps/main/src/app/api/search/route.ts` - Search API
- `packages/types/src/search.ts` - Type definitions
- `apps/main/src/components/universal-search.tsx` - UI component

**Activity Feed**:
- `apps/main/src/components/activity-feed.tsx` - Feed component
- `packages/firebase/src/activities.ts:68-116` - Feed query function

### Firestore Console

View data directly:
- **Activities**: https://console.firebase.google.com/project/alnexsuite/firestore/data/activities
- **Indexes**: https://console.firebase.google.com/project/alnexsuite/firestore/indexes
- **Rules**: https://console.firebase.google.com/project/alnexsuite/firestore/rules

---

**Happy Testing! 🚀**

If you encounter any issues, check the troubleshooting section or review the PROGRESS.md file for implementation details.
