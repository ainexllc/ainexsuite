# Workspace Unification Plan

## Goals
1. **AI Insights at top of page** - Full-width banner, always visible
2. **Remove glow styles** - More professional look
3. **Single background style** - Consistent across all apps

---

## Current State Analysis

### Background Variants (packages/ui/src/components/backgrounds/workspace-background.tsx)
Currently 6 variants available:
- `glow` (default) - Radial glow from top with corner accents
- `aurora` - Northern lights with multiple layers
- `minimal` - Single subtle gradient
- `grid` - Grid pattern with accent highlights
- `dots` - Dot matrix pattern
- `mesh` - Multi-point mesh gradient with noise

### AI Insights Current Placement

| App | Insights Component | Current Position |
|-----|-------------------|------------------|
| **Health** | `HealthInsights` | Sidebar (right column) |
| **Fit** | `FitInsights` | Sidebar + mobile condensed at top |
| **Notes** | `WorkspaceInsights` | Sidebar + mobile condensed at top |
| **Journey** | `JournalInsights` | Sidebar + mobile below composer |
| **Moments** | `MomentsInsights` | Sidebar only |
| **Grow** | `AIInsightsBanner` | Sidebar only |

### Layout Patterns
Most apps use: `xl:grid xl:grid-cols-[minmax(0,1fr)_340px]` (main + 340px sidebar)

---

## Proposed Changes

### Phase 1: Single Professional Background Style

**Decision Needed**: Which background variant to standardize on?

**Recommendation**: `minimal` or `grid` (both are subtle and professional)
- `minimal`: Single radial gradient, very clean
- `grid`: Subtle grid pattern, adds depth without being distracting

**Changes**:
1. Update `WorkspaceLayout` default from `'grid'` to chosen variant
2. Set default intensity lower (0.15-0.2) for professional look
3. Remove/deprecate `glow`, `aurora`, `mesh` variants from future use

**Files to modify**:
- `packages/ui/src/components/layouts/workspace-layout.tsx` - Change default variant

### Phase 2: Full-Width AI Insights Banner

**New Layout Structure**:
```
┌─────────────────────────────────────────────────┐
│ [Header/Nav]                                     │
├─────────────────────────────────────────────────┤
│ [AI Insights Banner - Full Width]               │  ← NEW
├─────────────────────────────────────────────────┤
│ [Space Switcher] [Actions...]                   │
├─────────────────────────────────────────────────┤
│ [Main Content - Full Width]                     │
│                                                 │
│ No more sidebar - use full width               │
└─────────────────────────────────────────────────┘
```

**New Shared Component**: `packages/ui/src/components/insights/ai-insights-banner.tsx`
- Full-width banner component
- Accepts `variant` prop for app-specific styling
- Accepts `children` or `insights` prop for content
- Collapsible/expandable state
- Loading and error states

**Apps to Update** (6 apps with AI insights):

1. **Health** (`apps/health/src/app/workspace/page.tsx`)
   - Move `HealthInsights` from sidebar to top banner
   - Remove 3-column grid, use full width

2. **Fit** (`apps/fit/src/app/workspace/page.tsx`)
   - Already has mobile condensed at top
   - Unify to single full-width banner
   - Remove sidebar insights

3. **Notes** (`apps/notes/src/app/workspace/page.tsx`)
   - Move `WorkspaceInsights` to top
   - Remove sidebar column

4. **Journey** (`apps/journey/src/components/dashboard/notebook-lite-dashboard.tsx`)
   - Move `JournalInsights` to top
   - Remove `LargeScreenOverview` sidebar pattern

5. **Moments** (`apps/moments/src/app/workspace/page.tsx`)
   - Move `MomentsInsights` to top banner
   - Keep FlashbackWidget inline or in banner

6. **Grow** (`apps/grow/src/app/workspace/page.tsx`)
   - `AIInsightsBanner` already exists but in sidebar
   - Move to top, full-width

---

## Implementation Steps

### Step 1: Background Standardization
1. Set `WorkspaceLayout` default backgroundVariant to `'minimal'`
2. Set default backgroundIntensity to `0.15`
3. Update each app to not override these defaults (remove custom variant props)

### Step 2: Create Shared AI Banner Component
1. Create `packages/ui/src/components/insights/ai-insights-banner.tsx`
2. Export from `packages/ui/src/components/index.ts`
3. Design API:
   ```tsx
   <AIInsightsBanner
     title="AI Insights"
     appColor="#10b981" // Health green
     isLoading={loading}
     error={error}
   >
     {/* App-specific insights content */}
   </AIInsightsBanner>
   ```

### Step 3: Update Each App Workspace
For each app:
1. Remove sidebar column from grid
2. Add AI Insights banner at top (below SpaceSwitcher)
3. Adjust main content to use full width
4. Test responsive behavior

### Step 4: Update Individual Insights Components
Each app's insights component needs a new `variant="banner"` mode:
- `HealthInsights` - horizontal layout for banner
- `FitInsights` - horizontal layout for banner
- `WorkspaceInsights` (Notes) - horizontal layout for banner
- `JournalInsights` - horizontal layout for banner
- `MomentsInsights` - horizontal layout for banner
- `AIInsightsBanner` (Grow) - already banner-style, just move position

---

## Files to Modify

### Shared Packages
- `packages/ui/src/components/layouts/workspace-layout.tsx`
- `packages/ui/src/components/insights/ai-insights-banner.tsx` (NEW)
- `packages/ui/src/components/index.ts`

### App Workspaces (6 apps)
- `apps/health/src/app/workspace/page.tsx`
- `apps/fit/src/app/workspace/page.tsx`
- `apps/notes/src/app/workspace/page.tsx`
- `apps/journey/src/components/dashboard/notebook-lite-dashboard.tsx`
- `apps/moments/src/app/workspace/page.tsx`
- `apps/grow/src/app/workspace/page.tsx`

### Individual Insights Components (may need banner variant)
- `apps/health/src/components/health-insights.tsx`
- `apps/fit/src/components/fit-insights.tsx`
- `apps/notes/src/components/notes/workspace-insights.tsx`
- `apps/journey/src/components/journal/journal-insights.tsx`
- `apps/moments/src/components/moments-insights.tsx`
- `apps/grow/src/components/ai/AIInsightsBanner.tsx`

---

## User Decisions

1. **Background style**: `dots` - Dot matrix pattern (modern and minimal)
2. **Insights banner**: Collapsible - User can expand/collapse
3. **On this day/Flashback widgets**: Keep inline in main content area
