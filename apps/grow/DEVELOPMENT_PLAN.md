# Grow App Development Plan

**Last Updated:** November 2025
**Status:** MVP → Production Ready

---

## Overview

Grow is an AI-powered habit tracking platform with gamification features. This plan addresses current gaps and outlines new feature development.

---

## Phase 1: Fixing MVP Gaps

Priority fixes for existing incomplete functionality.

### 1.1 Streak Calculation Logic
**Location:** `src/lib/date-utils.ts`
**Current State:** Simplified daily-only logic, marked as placeholder

**Tasks:**
- [ ] Implement proper streak calculation for all schedule types:
  - Daily habits: consecutive days completed
  - Weekly habits: consecutive weeks with required completions
  - Interval habits: completed within interval window
  - Specific days: consecutive scheduled days completed
- [ ] Handle streak freezes (paused habits shouldn't break streak)
- [ ] Add streak recovery grace period (configurable, e.g., 1 day)
- [ ] Update `currentStreak` and `bestStreak` in Firestore on completion
- [ ] Add unit tests for streak edge cases

**Files to modify:**
- `src/lib/date-utils.ts` - Core logic
- `src/lib/firebase-service.ts` - DB updates
- `src/lib/store.ts` - Optimistic updates

---

### 1.2 Interval Scheduling Logic
**Location:** `src/lib/date-utils.ts` → `isHabitDueToday()`
**Current State:** Incomplete, only handles daily/weekly

**Tasks:**
- [ ] Implement interval scheduling (every N days from last completion)
- [ ] Track `lastCompletedAt` on habit for interval calculation
- [ ] Handle edge case: new habit with no completions yet
- [ ] Add "times per week" flexible scheduling
- [ ] Visual indicator for "due today" vs "optional today"

**Files to modify:**
- `src/lib/date-utils.ts`
- `src/types/models.ts` - Add `lastCompletedAt` to Habit

---

### 1.3 Habit Completion UI Feedback
**Location:** `src/app/workspace/page.tsx`
**Current State:** Comment placeholder, no visual feedback

**Tasks:**
- [ ] Add checkmark/completion indicator on habit cards
- [ ] Implement completion animation (satisfying micro-interaction)
- [ ] Show streak flame with current count
- [ ] Add "undo" option for accidental completions (5-second window)
- [ ] Color coding: completed (green), due (purple), not due (gray)
- [ ] Show completion timestamp on hover

**Files to modify:**
- `src/app/workspace/page.tsx`
- Create `src/components/habits/HabitCard.tsx` (extract from page)
- Create `src/components/habits/CompletionButton.tsx`

---

### 1.4 Space Creation UX
**Location:** `src/components/spaces/SpaceSwitcher.tsx`
**Current State:** Uses browser `prompt()` for input

**Tasks:**
- [ ] Create `SpaceCreatorModal` component
- [ ] Add space type selection with descriptions:
  - Personal: "Just you, focused on your goals"
  - Couple: "Share habits with your partner, add wagers"
  - Squad: "Team accountability with leaderboards"
- [ ] Space name input with validation
- [ ] Optional: theme color picker
- [ ] Invite flow for couple/squad (email or link)

**Files to create:**
- `src/components/spaces/SpaceCreatorModal.tsx`
- `src/components/spaces/SpaceInvite.tsx`

---

### 1.5 Completion Data Pagination
**Location:** `src/components/FirestoreSync.tsx`
**Current State:** Loads all completions, won't scale

**Tasks:**
- [ ] Implement date-windowed queries (last 30 days by default)
- [ ] Add "load more" for historical analytics
- [ ] Create Cloud Function for aggregated stats (avoid client calculation)
- [ ] Cache completion counts in habit document
- [ ] Add loading states for data fetching

**Files to modify:**
- `src/components/FirestoreSync.tsx`
- `src/lib/firebase-service.ts`
- Create Cloud Function: `functions/src/aggregateCompletions.ts`

---

### 1.6 Tests & Documentation
**Current State:** No tests, minimal docs

**Tasks:**
- [ ] Add unit tests for:
  - Streak calculation (`date-utils.test.ts`)
  - Analytics utilities (`analytics-utils.test.ts`)
  - Store actions (`store.test.ts`)
- [ ] Add integration tests for Firestore operations
- [ ] Create README.md with:
  - Feature overview
  - Development setup
  - Architecture decisions
  - API documentation

**Files to create:**
- `src/lib/__tests__/date-utils.test.ts`
- `src/lib/__tests__/analytics-utils.test.ts`
- `README.md`

---

## Phase 2: New Features

Enhancements to make Grow more powerful.

### 2.1 AI Habit Suggestions
**Current State:** Basic chat route exists, not integrated

**Tasks:**
- [ ] "Suggest habits" based on user goals
- [ ] AI-powered habit descriptions and tips
- [ ] Smart scheduling recommendations based on existing habits
- [ ] Weekly AI insights: "You're most consistent on Tuesdays"
- [ ] Habit pairing suggestions: "People who do X also do Y"

**Implementation:**
- Create `src/components/ai/HabitSuggester.tsx`
- Create `src/components/ai/WeeklyInsights.tsx`
- Enhance `/api/ai/chat` with habit-specific prompts

---

### 2.2 Deeper Analytics
**Current State:** 7-day chart, basic insights

**Tasks:**
- [ ] Monthly/yearly view options
- [ ] Habit-specific analytics (per-habit streaks, best times)
- [ ] Correlation insights: "When you meditate, you're 40% more likely to exercise"
- [ ] Export data (CSV, JSON)
- [ ] Goal tracking: "Complete 80% of habits this month"
- [ ] Heatmap calendar view (like GitHub contributions)

**Files to create:**
- `src/components/analytics/HeatmapCalendar.tsx`
- `src/components/analytics/CorrelationInsights.tsx`
- `src/components/analytics/GoalTracker.tsx`
- `src/app/workspace/analytics/page.tsx` (dedicated analytics page)

---

### 2.3 Reminders & Notifications
**Current State:** In-app notifications only

**Tasks:**
- [ ] Push notification support (FCM)
- [ ] Email reminders (daily digest option)
- [ ] Custom reminder times per habit
- [ ] Smart reminders: "You usually complete this at 7am"
- [ ] Streak danger alerts: "Don't break your 30-day streak!"
- [ ] Notification preferences UI

**Implementation:**
- Create Cloud Function for scheduled notifications
- Add `reminderTime` to Habit model
- Create `src/app/workspace/settings/notifications/page.tsx`

---

### 2.4 Social Features (Squad Enhancement)
**Current State:** Basic squad with leaderboard

**Tasks:**
- [ ] Activity feed: "Alex completed Morning Routine"
- [ ] Reactions/cheers on completions
- [ ] Squad challenges with rewards
- [ ] Public/private habit toggle
- [ ] Squad discovery (join public squads)
- [ ] Achievement badges

**Files to create:**
- `src/components/social/ActivityFeed.tsx`
- `src/components/social/Reactions.tsx`
- `src/components/gamification/Achievements.tsx`
- `src/app/workspace/squad/page.tsx`

---

### 2.5 Habit Templates & Categories
**Current State:** 3 habit packs (Morning, Couple, Deep Work)

**Tasks:**
- [ ] Expand to 10+ curated packs
- [ ] Category system (Health, Productivity, Relationships, Learning)
- [ ] User-created templates (share with community)
- [ ] "Import from template" in habit creation
- [ ] Seasonal/themed packs (New Year, Summer, etc.)

**Categories to add:**
- Health & Fitness
- Mental Wellness
- Productivity
- Learning & Growth
- Relationships
- Finance
- Creativity
- Self-Care

---

## Phase 3: Polish

UX improvements for production readiness.

### 3.1 Onboarding Flow
**Current State:** Straight to workspace after auth

**Tasks:**
- [ ] Welcome modal with app introduction
- [ ] Guided first habit creation
- [ ] Goal setting: "What do you want to achieve?"
- [ ] Template suggestions based on goals
- [ ] Tour of key features (spaces, streaks, quests)
- [ ] Skip option for returning users

**Files to create:**
- `src/components/onboarding/WelcomeModal.tsx`
- `src/components/onboarding/GoalSelector.tsx`
- `src/components/onboarding/FeatureTour.tsx`

---

### 3.2 Modal System Overhaul
**Current State:** Each modal is standalone, inconsistent

**Tasks:**
- [ ] Create unified modal component with:
  - Consistent animations (slide up on mobile, fade on desktop)
  - Keyboard navigation (Escape to close)
  - Focus trapping
  - Backdrop click to close
- [ ] Migrate all modals to use shared component:
  - HabitEditor
  - QuestEditor
  - MemberManager
  - SpaceCreator (new)

**Files to create:**
- `src/components/ui/Modal.tsx` (or use @ainexsuite/ui)
- Update all modal components

---

### 3.3 Mobile UX
**Current State:** Responsive but not mobile-optimized

**Tasks:**
- [ ] Bottom navigation for mobile
- [ ] Swipe gestures:
  - Swipe right to complete habit
  - Swipe left for options (edit, delete, freeze)
- [ ] Pull-to-refresh
- [ ] Optimized touch targets (48px minimum)
- [ ] Mobile-specific layouts for analytics
- [ ] Add to home screen prompt (PWA)

**Files to create:**
- `src/components/mobile/BottomNav.tsx`
- `src/components/mobile/SwipeableHabitCard.tsx`
- Update `src/app/manifest.json` for PWA

---

### 3.4 Empty States & Error Handling
**Current State:** Minimal error handling

**Tasks:**
- [ ] Empty state designs:
  - No habits yet → "Create your first habit"
  - No completions today → "You're all caught up!"
  - No squad members → "Invite your team"
- [ ] Error boundaries with friendly messages
- [ ] Offline support with sync indicator
- [ ] Retry mechanisms for failed operations
- [ ] Toast notifications for success/error

**Files to create:**
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/ErrorBoundary.tsx`
- `src/components/ui/OfflineIndicator.tsx`

---

### 3.5 Accessibility
**Current State:** Basic accessibility

**Tasks:**
- [ ] ARIA labels on all interactive elements
- [ ] Screen reader announcements for completions
- [ ] High contrast mode support
- [ ] Reduced motion preference
- [ ] Keyboard shortcuts:
  - `c` - Complete first due habit
  - `n` - New habit
  - `s` - Switch space
  - `?` - Show shortcuts

---

## Phase 4: Scaling

Infrastructure for growth.

### 4.1 Cloud Functions for Heavy Lifting
**Current State:** Most logic is client-side

**Tasks:**
- [ ] `calculateStreaks` - Run daily, update all streak counts
- [ ] `aggregateAnalytics` - Pre-compute weekly/monthly stats
- [ ] `sendReminders` - Scheduled push notifications
- [ ] `processQuestCompletions` - Update quest progress
- [ ] `cleanupOldCompletions` - Archive old data

**Files to create:**
- `functions/src/streaks.ts`
- `functions/src/analytics.ts`
- `functions/src/reminders.ts`
- `functions/src/quests.ts`
- `functions/src/maintenance.ts`

---

### 4.2 Performance Optimization
**Current State:** Works for small datasets

**Tasks:**
- [ ] Virtual scrolling for long habit lists
- [ ] Lazy load analytics components
- [ ] Image optimization for avatars
- [ ] Bundle size analysis and reduction
- [ ] Firestore query optimization with composite indexes
- [ ] Service worker for caching

**Indexes to add (Firestore):**
```
habits: spaceId + createdAt (desc)
completions: spaceId + date (desc)
completions: habitId + date (desc)
notifications: recipientId + isRead + createdAt (desc)
```

---

### 4.3 Multi-Device Sync
**Current State:** Real-time sync works

**Tasks:**
- [ ] Conflict resolution for simultaneous edits
- [ ] Offline queue for completions
- [ ] Sync status indicator
- [ ] "Last synced" timestamp
- [ ] Force sync option

---

### 4.4 Data Export & Backup
**Tasks:**
- [ ] Export all user data (GDPR compliance)
- [ ] Import habits from other apps (Habitica, Streaks, etc.)
- [ ] Backup to Google Drive/iCloud
- [ ] Account deletion with data purge

---

## Priority Matrix

| Task | Impact | Effort | Priority |
|------|--------|--------|----------|
| Streak calculation fix | High | Medium | P0 |
| Completion UI feedback | High | Low | P0 |
| Space creation modal | Medium | Low | P1 |
| AI habit suggestions | High | Medium | P1 |
| Onboarding flow | High | Medium | P1 |
| Interval scheduling | Medium | Medium | P1 |
| Mobile UX | High | High | P2 |
| Deeper analytics | Medium | High | P2 |
| Cloud Functions | Medium | High | P2 |
| Social features | Medium | High | P3 |

---

## Timeline Estimate

**Phase 1 (MVP Fixes):** Core functionality
**Phase 2 (Features):** Differentiation
**Phase 3 (Polish):** Production quality
**Phase 4 (Scaling):** Growth readiness

---

## Notes

- All changes should follow existing patterns (Zustand + Firestore + shared packages)
- Maintain purple/indigo theme consistency
- Test on both desktop and mobile
- Consider couple/squad modes for all new features
- Document API changes in types package if shared

