# Plan: Standardize InlineSpacePicker Across All Apps

## User Decisions
- ✅ Fix spaceId saving bugs in Calendar and Health apps
- ✅ Update all 6 apps (Todo, Calendar, Journal, Health, Album, Projects)

## Overview

Replace custom inline space picker implementations with the shared `InlineSpacePicker` component from `@ainexsuite/ui`, add hints system, add MemberManager, and fix spaceId saving bugs in all applicable apps.

---

## Completed (Reference)

### Notes App ✅
- Created shared `InlineSpacePicker` in `packages/ui/src/components/spaces/`
- Updated `NoteComposer` to use shared component
- Created hints system (`apps/notes/src/components/hints/`)
- Added `MemberManager` component
- Fixed "Manage People" visibility logic

### Habits App ✅
- Updated `HabitComposer` to use shared `InlineSpacePicker`

---

## Apps Requiring Updates

| App | Composer File | Current State | Space Saving | Priority |
|-----|--------------|---------------|--------------|----------|
| **Todo** | `TaskComposer.tsx` | Custom picker (lines 267-329) | ✅ Works | High |
| **Calendar** | `event-composer.tsx` | Custom picker (lines 256-299) | ❌ Missing | High |
| **Journal** | `journal-composer.tsx` | Custom picker (lines 243-298) | ✅ Works | High |
| **Health** | `health-checkin-composer.tsx` | Custom picker (lines 163-217) | ❌ Missing | High |
| **Album** | `moment-composer.tsx` | No inline picker (uses prop) | ✅ Works | Medium |
| **Projects** | `project-modal.tsx` | No space UI | ❌ Missing | Medium |

### Apps Not Applicable
- **Workflow**: Canvas-based editing, no structured entry creation
- **Display**: Dashboard visualization only, no entry creation
- **Admin**: Admin interface, different pattern

---

## Implementation Steps Per App

### Step 1: Todo App

**Files to modify:**
- `apps/todo/src/components/tasks/TaskComposer.tsx`
- `apps/todo/src/components/hints/` (CREATE - 4 files)
- `apps/todo/src/components/spaces/MemberManager.tsx` (CREATE)
- `apps/todo/src/app/workspace/layout.tsx` (add HintsProvider)
- `apps/todo/src/app/workspace/page.tsx` (add modals & handlers)

**Changes:**
1. Replace custom space dropdown (lines 267-329) with `InlineSpacePicker`
2. Import from `@ainexsuite/ui`
3. Add `onManagePeople` and `onManageSpaces` props
4. Create hints system (copy from notes, update config)
5. Create MemberManager (copy from notes, adapt types)
6. Add modals to workspace page

**Note:** Todo uses Zustand store directly, not useSpaces(). May need adapter.

---

### Step 2: Calendar App

**Files to modify:**
- `apps/calendar/src/components/calendar/event-composer.tsx`
- `apps/calendar/src/components/hints/` (CREATE - 4 files)
- `apps/calendar/src/components/spaces/MemberManager.tsx` (CREATE)
- `apps/calendar/src/app/workspace/layout.tsx` (add HintsProvider)
- `apps/calendar/src/app/workspace/page.tsx` (add modals & handlers)
- `apps/calendar/src/types/event.ts` (add spaceId field)
- `apps/calendar/src/lib/events.ts` (save spaceId)

**Changes:**
1. Replace custom space dropdown (lines 256-299) with `InlineSpacePicker`
2. Add `spaceId: string` to `CreateEventInput` and `CalendarEvent` interfaces
3. Update events service to save spaceId with events
4. Create hints system
5. Create MemberManager
6. Add modals to workspace page

**Critical Fix:** Events currently don't save spaceId - this is a bug!

---

### Step 3: Journal App

**Files to modify:**
- `apps/journal/src/components/journal/journal-composer.tsx`
- `apps/journal/src/components/hints/` (CREATE - 4 files)
- `apps/journal/src/components/spaces/MemberManager.tsx` (CREATE)
- `apps/journal/src/app/workspace/layout.tsx` (add HintsProvider)
- `apps/journal/src/app/workspace/page.tsx` (add modals & handlers)

**Changes:**
1. Replace custom space dropdown (lines 243-298) with `InlineSpacePicker`
2. Create hints system (amber theme for journal)
3. Create MemberManager
4. Add modals to workspace page

**Note:** Journal already saves spaceId correctly.

---

### Step 4: Health App

**Files to modify:**
- `apps/health/src/components/health-checkin-composer.tsx`
- `apps/health/src/components/hints/` (CREATE - 4 files)
- `apps/health/src/components/spaces/MemberManager.tsx` (CREATE)
- `apps/health/src/app/workspace/layout.tsx` (add HintsProvider)
- `apps/health/src/app/workspace/page.tsx` (add modals, fix spaceId)
- `apps/health/src/lib/wellness-hub.ts` (add spaceId to save)

**Changes:**
1. Replace custom space dropdown (lines 163-217) with `InlineSpacePicker`
2. Update `onSave` callback to include spaceId
3. Update wellness service to save spaceId with metrics
4. Create hints system (emerald theme for health)
5. Create MemberManager
6. Add modals to workspace page

**Critical Fix:** Health metrics don't save spaceId - this is a bug!

---

### Step 5: Album App

**Files to modify:**
- `apps/album/src/components/moment-composer.tsx`
- `apps/album/src/components/hints/` (CREATE - 4 files)
- `apps/album/src/components/spaces/MemberManager.tsx` (CREATE)
- `apps/album/src/app/workspace/layout.tsx` (add HintsProvider)
- `apps/album/src/app/workspace/page.tsx` (add modals & handlers)

**Changes:**
1. Add `InlineSpacePicker` to collapsed state (currently no inline picker)
2. Create hints system (pink theme for album)
3. Create MemberManager
4. Add modals to workspace page

**Note:** Album already saves spaceId correctly via prop.

---

### Step 6: Projects App

**Files to modify:**
- `apps/projects/src/components/project-modal.tsx`
- `apps/projects/src/components/hints/` (CREATE - 4 files)
- `apps/projects/src/components/spaces/MemberManager.tsx` (CREATE)
- `apps/projects/src/app/workspace/layout.tsx` (add HintsProvider)
- `apps/projects/src/app/workspace/page.tsx` (add modals, fix spaceId)
- `apps/projects/src/lib/store.ts` (update project creation)

**Changes:**
1. Add space selection to project modal
2. Update `onCreateProject` to include spaceId
3. Update store to save projects with spaceId
4. Create hints system (indigo theme for projects)
5. Create MemberManager
6. Add modals to workspace page

**Critical Fix:** Projects don't have space handling at all!

---

## Shared Components to Leverage

Already created in `packages/ui`:
- `InlineSpacePicker` - Compact space picker for composers
- `SpaceSwitcher` - Full space switcher (sidebar/navbar)
- `SpaceSettings` - Space configuration modal
- `SpaceManagementModal` - Create/manage spaces
- `AddChildModal` - Add child members to family spaces

---

## Hints Configuration Per App

| App | Theme Color | Hint ID | Hint Message |
|-----|-------------|---------|--------------|
| Todo | Purple (#8b5cf6) | `SHARED_TASKS` | "Share tasks with your family or team" |
| Calendar | Cyan (#06b6d4) | `SHARED_EVENTS` | "Share events with your family or team" |
| Journal | Orange (#f97316) | `SHARED_JOURNAL` | "Share journal entries with loved ones" |
| Health | Emerald (#10b981) | `SHARED_HEALTH` | "Track health together with family" |
| Album | Pink (#ec4899) | `SHARED_MEMORIES` | "Share memories with your family" |
| Projects | Indigo (#6366f1) | `SHARED_PROJECTS` | "Collaborate on projects together" |

---

## Execution Order

**Phase 1 - High Priority (Bug Fixes + Standardization):**
1. Calendar App (fix spaceId saving + add InlineSpacePicker)
2. Health App (fix spaceId saving + add InlineSpacePicker)
3. Todo App (already works, just standardize component)
4. Journal App (already works, just standardize component)

**Phase 2 - Medium Priority (Add Missing Features):**
5. Album App (add inline picker to composer)
6. Projects App (add full space handling)

---

## File Creation Template

For each app, create these files in `apps/{app}/src/components/hints/`:

```
hints/
├── index.ts           # Exports
├── Hint.tsx           # Hint component (copy from notes, update theme color)
├── HintsProvider.tsx  # Context provider (copy from notes)
└── hints-config.ts    # App-specific hint configurations
```

For each app, create `apps/{app}/src/components/spaces/MemberManager.tsx`:
- Copy from notes app
- Update types import path
- Update theme colors if needed

---

## Testing Checklist

For each app:
- [ ] InlineSpacePicker appears in collapsed composer state
- [ ] Dropdown shows all available spaces
- [ ] "Manage People" appears when shared spaces exist
- [ ] "Manage Spaces" opens SpaceManagementModal
- [ ] MemberManager opens when clicking "Manage People"
- [ ] MemberManager shows helpful message when on personal space
- [ ] Entries save with correct spaceId
- [ ] Entries are filtered by selected space
- [ ] Hint appears on first use
- [ ] Hint can be dismissed
- [ ] Hint doesn't reappear after dismissal
