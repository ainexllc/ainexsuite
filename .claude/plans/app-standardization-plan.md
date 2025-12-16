# AinexSuite App Standardization Plan

## Vision

Create a consistent user experience across all AinexSuite apps where users can:
- Immediately understand navigation and controls (familiar patterns)
- Use the same gestures/actions across apps (pin, archive, color, delete)
- View content in familiar layouts (list, grid/masonry, calendar)
- Filter and sort content consistently
- Organize content with spaces (where applicable)

While maintaining app-specific features and content types.

---

## Current State Analysis

### Apps Using Standard Patterns (Templates)
| App | WorkspaceToolbar | View Modes | Filters | Entry Actions | Calendar |
|-----|------------------|------------|---------|---------------|----------|
| Notes | Yes | list, masonry, calendar | colors, tags, dates | pin, archive, color, delete | Yes |
| Journey | Yes | list, masonry, calendar | moods, colors, tags, dates | pin, archive, color, delete | Yes |

### Apps Needing Standardization
| App | Current State | Complexity |
|-----|---------------|------------|
| Todo | Has WorkspaceToolbar, 5 view modes | Medium - needs entry actions |
| Track | Custom view toggle, no toolbar | Medium |
| Moments | Custom buttons, 4 creative modes | High - unique modes |
| Grow | Card grouping, no toolbar | Medium |
| Fit | List view, leaderboards | Medium |
| Health | Dashboard only, no toolbar | Low |
| Pulse | Clock only, minimal | Low |
| Projects | Dashboard/Whiteboard toggle | Low - specialized |
| Workflow | Canvas only | N/A - visual editor |

---

## Phase 1: Shared Infrastructure Enhancements

### 1.1 Enhance Entry Types (packages/types)

Add consistent base fields to all entry types:

```typescript
// packages/types/src/base.ts
export interface StandardEntryFields {
  pinned?: boolean;
  archived?: boolean;
  color?: EntryColor;
}

// Then extend in each type:
export interface Task extends BaseDocument, StandardEntryFields { ... }
export interface Subscription extends BaseDocument, StandardEntryFields { ... }
export interface Habit extends BaseDocument, StandardEntryFields { ... }
export interface Moment extends BaseDocument, StandardEntryFields { ... }
export interface Workout extends BaseDocument, StandardEntryFields { ... }
export interface HealthMetric extends BaseDocument, StandardEntryFields { ... }
```

### 1.2 Create Shared Entry Actions Hook (packages/ui)

```typescript
// packages/ui/src/hooks/use-entry-actions.ts
export interface UseEntryActionsConfig<T> {
  onPin: (id: string, pinned: boolean) => Promise<void>;
  onArchive: (id: string, archived: boolean) => Promise<void>;
  onColorChange: (id: string, color: EntryColor) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate?: () => void;
}

export function useEntryActions<T extends StandardEntryFields>(
  config: UseEntryActionsConfig<T>
) {
  // Returns handlers and UI components for entry actions
  return {
    handlePin,
    handleArchive,
    handleColorChange,
    handleDelete,
    EntryContextMenu,  // Ready-to-use context menu component
    ColorPicker,       // Ready-to-use color picker
  };
}
```

### 1.3 Create Shared Filter Infrastructure (packages/ui)

```typescript
// packages/ui/src/components/filters/filter-content-factory.tsx
export interface BaseFilterValue {
  colors?: EntryColor[];
  tags?: string[];
  dateRange?: { start: Date | null; end: Date | null };
  datePreset?: QuickDatePreset;
  dateField?: 'createdAt' | 'updatedAt';
}

// App-specific extensions:
export interface TaskFilterValue extends BaseFilterValue {
  status?: TaskStatus[];
  priority?: Priority[];
  assignee?: string[];
}

export interface JournalFilterValue extends BaseFilterValue {
  moods?: MoodType[];
}

export interface HabitFilterValue extends BaseFilterValue {
  frequency?: HabitFrequency[];
  category?: string[];
}
```

### 1.4 Create Entry Board Factory (packages/ui)

```typescript
// packages/ui/src/components/boards/entry-board.tsx
export interface EntryBoardProps<T> {
  entries: T[];
  viewMode: 'list' | 'masonry' | 'calendar';
  loading?: boolean;
  onEntryUpdated: () => void;
  renderCard: (entry: T, onUpdate: () => void) => ReactNode;
  emptyState?: {
    title: string;
    description: string;
    action?: { label: string; href?: string; onClick?: () => void };
  };
  showPinnedSection?: boolean;
  getPinned?: (entry: T) => boolean;
}

export function EntryBoard<T>({ ... }: EntryBoardProps<T>) {
  // Handles pinned/unpinned separation
  // Handles view mode switching
  // Handles empty states
  // Renders entries using provided renderCard
}
```

---

## Phase 2: App-by-App Standardization

### 2.1 Todo App (Priority: High)

**Current:** Has WorkspaceToolbar, 5 view modes (list, board, my-day, matrix, calendar)
**Keep:** Board, my-day, matrix views (unique to Todo)
**Add:** Entry actions (pin, archive, color, delete)

#### Checklist
- [ ] Add `pinned`, `archived`, `color` fields to Task type
- [ ] Add toggle functions to firestore (toggleTaskPin, toggleTaskArchive, updateTaskColor)
- [ ] Update TaskCard with entry actions (pin badge, color picker, archive, delete confirmation)
- [ ] Add ActivityCalendar integration (already has calendar view mode)
- [ ] Add color filter to TaskFilterContent
- [ ] Ensure pinned tasks appear first in list view

#### Files to Modify
- `packages/types/src/task.ts` - Add fields
- `apps/todo/src/lib/firebase/firestore.ts` - Add toggle functions
- `apps/todo/src/components/task/task-card.tsx` - Add entry actions
- `apps/todo/src/components/task/task-filter-content.tsx` - Add color filter

---

### 2.2 Track App (Priority: High)

**Current:** Custom view toggle (list, calendar, analytics), no standard toolbar
**Goal:** Standard WorkspaceToolbar with view modes

#### Checklist
- [ ] Define Subscription type in packages/types with standard fields
- [ ] Add WorkspaceToolbar with view options
- [ ] Create SubscriptionCard with entry actions
- [ ] Add SubscriptionFilterContent (colors, tags, renewal date range)
- [ ] Add sort options (renewalDate, cost, name, createdAt)
- [ ] Integrate ActivityCalendar showing renewals per day

#### Files to Create/Modify
- `packages/types/src/subscription.ts` - Create type
- `apps/track/src/app/workspace/page.tsx` - Add WorkspaceToolbar
- `apps/track/src/components/subscription-card.tsx` - Entry actions
- `apps/track/src/components/subscription-filter-content.tsx` - Filters

---

### 2.3 Moments App (Priority: Medium)

**Current:** Custom buttons for timeline, flipbook, slideshow, trivia
**Goal:** Keep creative modes, add standard entry management

#### Checklist
- [ ] Add `pinned`, `archived`, `color` fields to Moment type
- [ ] Create MomentCard with entry actions
- [ ] Add WorkspaceToolbar with creative view modes
- [ ] Add MomentFilterContent (people, location, mood, weather, colors, dates)
- [ ] Add sort options (date, location, mood)
- [ ] Keep flipbook/slideshow/trivia as special view modes

#### View Mode Strategy
```typescript
const VIEW_OPTIONS: ViewOption<MomentViewMode>[] = [
  { value: 'timeline', icon: Clock, label: 'Timeline' },
  { value: 'grid', icon: LayoutGrid, label: 'Grid' },
  { value: 'calendar', icon: Calendar, label: 'Calendar' },
  // Creative modes in separate "Play" menu or secondary toolbar
];

const PLAY_MODES = [
  { value: 'flipbook', icon: BookOpen, label: 'Flipbook' },
  { value: 'slideshow', icon: Play, label: 'Slideshow' },
  { value: 'trivia', icon: HelpCircle, label: 'Trivia' },
];
```

---

### 2.4 Grow App (Habits) (Priority: Medium)

**Current:** Card grouping by status (due today, not due, frozen)
**Goal:** Standard toolbar with grouped view mode

#### Checklist
- [ ] Add `pinned`, `archived`, `color` fields to Habit type
- [ ] Create HabitCard with entry actions
- [ ] Add WorkspaceToolbar with view modes (list, grouped, calendar)
- [ ] Add HabitFilterContent (frequency, category, colors, streak status)
- [ ] Add sort options (streak, completionRate, dueTime, name)
- [ ] Keep grouped view as default (matches current UX)

#### View Modes
- `list` - All habits in list
- `grouped` - Due Today / Not Due / Frozen sections (current default)
- `calendar` - Habit completions calendar

---

### 2.5 Fit App (Priority: Medium)

**Current:** List view with sections, leaderboard for squads
**Goal:** Standard toolbar with workout management

#### Checklist
- [ ] Add `pinned`, `archived`, `color` fields to Workout type
- [ ] Create WorkoutCard with entry actions
- [ ] Add WorkspaceToolbar with view modes (list, calendar)
- [ ] Add WorkoutFilterContent (exercise type, muscle group, duration, colors)
- [ ] Add sort options (date, duration, exercises count)
- [ ] Keep leaderboard as secondary view for squad spaces

---

### 2.6 Health App (Priority: Low)

**Current:** Dashboard-focused, daily check-ins
**Goal:** Add optional list/calendar views for history

#### Checklist
- [ ] Add `pinned`, `color` (no archive - health data shouldn't be archived)
- [ ] Create MetricCard with entry actions
- [ ] Add WorkspaceToolbar with view modes (dashboard, list, calendar)
- [ ] Add HealthFilterContent (metric types, date range)
- [ ] Add sort options (date, specific metric values)

---

### 2.7 Pulse App (Priority: Low)

**Current:** Minimal - just clock widget
**Goal:** Expand to vitality dashboard with standardized structure

#### Checklist
- [ ] Define vitality entry types (energy levels, focus, wellness)
- [ ] Add WorkspaceToolbar (if entries are added)
- [ ] Create entry cards with standard actions
- [ ] Add calendar view for vitality tracking

---

### 2.8 Projects App (Priority: Low - Specialized)

**Current:** Dashboard/Whiteboard toggle
**Goal:** Keep specialized, add standard entry management for project items

#### Checklist
- [ ] Add standard fields to project items
- [ ] Add entry actions to project cards
- [ ] Keep dashboard/whiteboard as primary views
- [ ] Consider adding list view for project items

---

### 2.9 Workflow App (Priority: N/A)

**Current:** Canvas-based visual editor
**Goal:** Keep as-is - this is a specialized tool

The workflow builder is intentionally different - it's a visual programming tool, not an entry-based app.

---

## Phase 3: Consistency Checklist

### Every App Should Have

#### Layout (Required)
- [ ] WorkspacePageLayout wrapper
- [ ] Insights banner (AI-powered, collapsible)
- [ ] Composer/creation UI
- [ ] SpaceSwitcher (if spaces enabled)

#### Toolbar (Required for entry-based apps)
- [ ] WorkspaceToolbar component
- [ ] View mode toggle (minimum: list + one other)
- [ ] Sort dropdown with relevant options
- [ ] Filter dropdown with app-specific filters

#### Entry Management (Required)
- [ ] Entry card component
- [ ] Pin action with visual indicator
- [ ] Archive action (move to archive view)
- [ ] Color picker (12 standard colors)
- [ ] Delete with confirmation dialog

#### Filtering (Required)
- [ ] Color filter
- [ ] Date range filter with presets
- [ ] App-specific filters (mood, priority, etc.)
- [ ] Clear filters action
- [ ] Active filter count badge

#### Sorting (Required)
- [ ] Date created (default)
- [ ] Date modified
- [ ] Title/Name
- [ ] App-specific sort options

#### Views (Minimum 2)
- [ ] List view (default fallback)
- [ ] Grid/Masonry view OR Calendar view
- [ ] App-specific views (board, timeline, etc.)

### App-Specific Features (Examples)

| App | Unique Filters | Unique Sorts | Unique Views |
|-----|----------------|--------------|--------------|
| Notes | - | noteDate | - |
| Journey | mood | - | - |
| Todo | status, priority, assignee | dueDate, priority | board, my-day, matrix |
| Track | renewal status | cost, renewalDate | analytics |
| Moments | people, location, weather | - | flipbook, slideshow, trivia |
| Grow | frequency, category | streak, completionRate | grouped |
| Fit | exercise type, muscle group | duration | leaderboard |
| Health | metric type | metric values | dashboard |

---

## Phase 4: Implementation Order

### Sprint 1: Infrastructure (1 week)
1. Add StandardEntryFields to base types
2. Create useEntryActions hook
3. Create EntryBoard component
4. Enhance filter infrastructure

### Sprint 2: High Priority Apps (2 weeks)
1. Todo - Add entry actions, color filter
2. Track - Full standardization

### Sprint 3: Medium Priority Apps (2 weeks)
1. Moments - Toolbar + entry actions
2. Grow - Toolbar + entry actions
3. Fit - Toolbar + entry actions

### Sprint 4: Low Priority Apps (1 week)
1. Health - Add views + entry actions
2. Pulse - Expand if needed
3. Projects - Entry actions only

### Sprint 5: Polish (1 week)
1. Cross-app testing
2. Keyboard shortcuts consistency
3. Animation consistency
4. Accessibility audit

---

## Shared Components Summary

### Already Shared (packages/ui)
- WorkspacePageLayout
- WorkspaceToolbar
- ActivityCalendar
- ListSection
- EmptyState
- ConfirmationDialog
- FilterDropdown
- SortDropdown

### To Create (packages/ui)
- EntryBoard (with pinned section)
- EntryContextMenu
- EntryColorPicker
- useEntryActions hook
- BaseFilterContent

### To Move to packages/types
- StandardEntryFields interface
- EntryColor type (already there)
- Add to: Task, Subscription, Habit, Moment, Workout, HealthMetric

---

## Migration Strategy for Each App

### Step 1: Types
1. Add `pinned`, `archived`, `color` to entry type
2. Update Firestore schema if needed

### Step 2: Firestore Functions
1. Add `togglePin(id, pinned)`
2. Add `toggleArchive(id, archived)`
3. Add `updateColor(id, color)`
4. Add `deleteEntry(id)` with proper cleanup

### Step 3: Entry Card
1. Add pin badge (top-right corner when pinned)
2. Add color background support
3. Add context menu with actions
4. Add delete confirmation

### Step 4: Toolbar
1. Add WorkspaceToolbar if missing
2. Add view mode options
3. Add filter content with color filter
4. Add sort options

### Step 5: Entry Board/List
1. Separate pinned from unpinned
2. Support view modes (list, masonry, calendar)
3. Filter out archived entries (unless in archive view)

### Step 6: Testing
1. Test all entry actions
2. Test all view modes
3. Test filters and sorts
4. Test with spaces (if applicable)

---

## Success Criteria

### User Experience
- Users can switch between apps and immediately understand the UI
- Common actions (pin, archive, color, delete) work the same everywhere
- View modes are consistent (list looks like list, calendar looks like calendar)
- Filtering and sorting work predictably

### Developer Experience
- New apps can be scaffolded using standard patterns
- Entry card components follow a consistent pattern
- Shared hooks reduce boilerplate
- Type safety across all entry types

### Technical Quality
- All apps build without errors
- No duplicate code for common functionality
- Consistent animation timing
- Accessible keyboard navigation
