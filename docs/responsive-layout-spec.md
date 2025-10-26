# NoteNex Responsive Workspace Spec

**Version**: 2.0
**Last Updated**: October 2025

## Version 2.0 Changes
- **Centered Container Architecture**: Replaced multi-column grid with single centered container (max-width 1280px)
- **Navigation Overlay Pattern**: Navigation opens as slide-in overlay instead of permanent sidebar
- **Simplified Top Nav**: Reduced from 7-8 icons to 3-4 (hamburger, search, notifications, profile)
- **Profile Dropdown**: Consolidated settings, theme, refresh, and sign-out into single menu
- **Full-Width Mobile**: Content spans full viewport on mobile, centered with padding on desktop

## Goals
- Deliver a content-centric experience with everything in one centered container
- Prioritize editing canvas by removing permanent sidebars and multi-column layouts
- Use overlay panels (navigation, notifications) for secondary actions
- Maintain consistency across all screen sizes with responsive centering

## Viewport Tiers
| Token | Range (shortest edge) | Layout posture | Primary unlocks |
| ----- | --------------------- | -------------- | ---------------- |
| `XS`  | `< 480px`             | Full-width     | Edge-to-edge content, hamburger nav overlay |
| `SM`  | `480–767px`           | Full-width     | Search bar expands, logo visible |
| `MD`  | `768–1023px`          | Full-width     | Full search input, all nav icons visible |
| `LG`  | `1024–1279px`         | Centered       | Container centered (max 1280px), desktop padding |
| `XL`  | `≥ 1280px`            | Centered       | Full container width, visible background |

> The centered container (max-width 1280px) is the primary content area. On mobile (< 1024px), it spans full viewport width. On desktop (≥ 1024px), it's centered with horizontal padding and visible background.

## Layout Structure

### All Screen Sizes
```
┌─────────────────────────────────────┐
│  Top Nav: [≡] Logo Search [🔔][👤] │ ← Sticky, always visible
├─────────────────────────────────────┤
│         Background (desktop)         │
│  ┌───────────────────────────────┐  │
│  │   Centered Container          │  │ ← max-width 1280px
│  │   (Content Area)              │  │
│  │                               │  │
│  │   Note Board / Archive / etc  │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  [Feedback Button] bottom-left      │
└─────────────────────────────────────┘
```

### Overlay Panels (On Demand)
- **Navigation Panel**: Slides in from left (280px wide), triggered by hamburger button
- **Notifications Panel**: Slides in from right (max-w-sm), triggered by bell icon
- **Profile Dropdown**: Drops down from profile button (256px wide)

## Responsive Behavior by Tier

- **Mobile (< 1024px)**
  - Container: full-width, edge-to-edge
  - Padding: 0 (content manages its own padding)
  - Navigation: hamburger opens overlay panel
  - Top Nav: Logo hidden on XS, visible SM+
  - Search: icon-only on XS, full input SM+

- **Desktop (≥ 1024px)**
  - Container: centered, max-width 1280px
  - Padding: 1.5rem horizontal, 2rem vertical
  - Background: visible around container
  - Navigation: hamburger always visible, opens overlay
  - Top Nav: all elements visible
  - Search: full input with icon

## Core Regions & Behavior

### Top Navigation Bar
- **Position**: Sticky top, always visible, z-index 30
- **Height**: 64px (h-16)
- **Content** (left to right):
  1. **Hamburger Menu**: Opens navigation overlay panel (always visible)
  2. **Logo**: Hidden on XS, visible SM+ (hidden sm:block)
  3. **Search Bar**: Icon-only on XS, full input SM+
  4. **Notifications**: Bell icon, opens notification overlay panel
  5. **Profile**: Avatar + chevron, opens profile dropdown menu

### Centered Container (`.centered-shell`)
- **Purpose**: Main content area for all pages
- **Max Width**: 1280px
- **Mobile**: Full-width, no padding (edge-to-edge)
- **Desktop**: Centered with padding (1.5rem horizontal, 2rem vertical)
- **Background**: Visible on desktop around container

### Navigation Overlay Panel
- **Trigger**: Hamburger button in top nav
- **Width**: 280px
- **Position**: Fixed left, slides in from left edge
- **Animation**: 300ms ease-out transform
- **Z-index**: 40
- **Backdrop**: Semi-transparent with blur (z-30)
- **Sections**: Workspace, Utilities, Labels
- **Close**: Click backdrop, press Escape, or click nav item

### Profile Dropdown Menu
- **Trigger**: Profile button in top nav
- **Width**: 256px
- **Position**: Absolute, drops down from profile button
- **Animation**: 150ms fade-in + slide-down
- **Z-index**: 50
- **Contents**:
  - User info header
  - Settings (opens settings overlay)
  - Theme toggle (inline switch)
  - Refresh route
  - Sign out

### Notification Panel
- **Trigger**: Bell icon in top nav
- **Width**: max-w-sm (384px)
- **Position**: Fixed right, slides in from right edge
- **Animation**: Same as navigation panel
- **Z-index**: 40
- **Contents**: Recent activity feed, reminders

## Adaptive Patterns
- Progressive disclosure hides advanced formatting, automations, and analytics on smaller tiers—accessible via command palette (`⌘K` / `Ctrl+K`) or overflow menus.
- Collaboration indicators scale from single avatar dot (XS) to full roster (LG+) with presence statuses and cursor colors.
- Quick capture + note switching available across tiers; LG+ introduces drag-to-dock mini notes.
- Keyboard shortcut hints appear when pointer hover available; replaced with long-press tooltips on touch-only devices.

## Interaction & Navigation
- Command palette acts as universal action search with contextual suggestions; accessible every tier.
- Outline navigation: dropdown overlay on XS/SM; persistent tree in context column MD+; dedicated pane in XL.
- Gestures: pinch-to-zoom, two-finger tap context menu (mobile), swipe from edges to open drawers, drag handles for resizing panels (desktop).
- Multi-instance support at XL with two canvases; share toolbar when both active.

## Performance & Technical Guidance
- Prefer container queries for ribbon, inspector, and utility panels so they respond to actual container width rather than global viewport.
- Virtualize long lists (comments, history) for mobile performance; progressive load additional panes on-demand.
- Use CSS custom properties to describe column widths/gutters; update values responsively to avoid hard-coded `px`.
- Ensure all interactive controls meet 44px touch targets on XS/SM and 36px on desktop while keeping hover affordances.

## Accessibility & Theming
- Respect reduced-motion preferences (disable slide-in animations, use fades).  
- Provide high-contrast theme variants; ensure ribbon and sidebar gracefully reflow when font scaling (200%+) is enabled.  
- Keyboard navigation mirrors visual order; include focus traps for drawers/bottom sheets; ARIA landmarks (`header`, `main`, `aside`, `footer`) per tier.

## Component Inventory & Container Queries
| Component | Primary role | Container query triggers | Notes |
| --------- | ------------ | ------------------------ | ----- |
| `AppShell` | Owns global grid (`nav`, `main`, `utility`) | `shell-width: <720px`, `<1200px`, `≥1600px` | Toggle sidebar overlay vs dock, reveal utility rail at LG+, enable multi-pane at XL |
| `TopNav` | Header/ribbon housing nav, command palette, session controls | `nav-width: <420px`, `≥768px` | Swap search input for icon-only button on tight widths; reveal quick-action buttons from MD up |
| `CommandPalette` | Global action launcher | N/A | Always accessible; adjust density with prefers-reduced-motion |
| `Ribbon` | Formatting + AI actions | `ribbon-width: <480px`, `<720px`, `≥960px` | Collapse to segmented control on mobile, show full text labels on MD+, add secondary row at LG+ |
| `DocumentCanvas` | Core editing surface | `canvas-width: <540px`, `<900px`, `≥1200px` | Adjust inner padding/gutter, promote page guides from MD+, allow split view when `≥1200px` |
| `Sidebar` | Primary navigation and label management | `shell-width: <768px`, `≥1200px` | Overlay on mobile, collapsible icon rail on desktop, expand to full column at LG+ |
| `ContextInspector` | Styles, comments, metadata | `inspector-width: <360px`, `≥480px` | Bottom sheet on XS/SM, tabbed dock MD+, stackable panel LG+, undock option XL |
| `UtilityPanels` (History, Chat, Integrations) | Supplemental workflows | `utility-width: <320px`, `≥400px` | Hidden by default mobile, slide-in drawers MD, persistent third column LG+, detachable windows XL |
| `FooterStatus` | Presence + stats | `footer-width: <360px`, `≥600px` | Compress to pill when constrained, show AI ticker when wide |
| `NoteBoard` | Board/list of notes | `board-width: <640px`, `≥960px` | Switch column count via container columns, enable pinned grid layout MD+, allow drag-dock mini notes LG+ |

### Container Query Tokens
- Define logical custom properties in CSS (`--cq-shell`, `--cq-nav`, `--cq-ribbon`, etc.) that map to the component container width.  
- Use `@container (min-width: 720px)` style rules inside each component file rather than global breakpoints, letting nested components react independently.  
- Maintain Tailwind plugin or utility classes for common thresholds to avoid repetition:
  ```css
  @layer base {
    @container shell (min-width: 1200px) {
      .shell-lg\\:grid-cols-3 {
        grid-template-columns: var(--nav-col) 1fr var(--utility-col);
      }
    }
  }
  ```
- Surface container names in JSX via `style={{ containerName: "shell" }}` (or Tailwind plugin) for `AppShell`, `Ribbon`, `DocumentCanvas`, and `Inspector` wrappers.
- Backfill with viewport breakpoints only when container queries unsupported (progressive enhancement fallback).

### Implementation Changelog
- `AppShell` now exposes `cq-shell` container with grid tracks unlocking at 1200px (sidebar dock) and 1600px (utility rail).  
- `TopNav` uses `@container nav` to collapse the search input into an icon action below 640px and stagger quick-action visibility above 640px/900px.  
- `NoteBoard` replaces viewport column classes with `@container board` queries (2 cols ≥640px, 3 cols ≥960px) to respect panel width within multi-pane layouts.
- `Sidebar` content is marked `cq-sidebar`, allowing section titles to auto-hide when the rail collapses, independent of viewport size.  
- Utility rail scaffold (`cq-utility`) is present but hidden until the shell reaches ≥1600px; future work will populate it with history/chat modules.
- Context inspector (`cq-inspector`) activates at ≥1024px, surfacing selected note preview, workspace stats, active filters, and recent activity alongside the canvas; uses sticky positioning and internal scroll to keep tools in view.

### Follow-up
1. Layer in document-specific formatting/comment tabs within the inspector and hook into collaborative data sources.  
2. Build real utility modules (activity, chat, automations) and mount them in the new rail, with progressive disclosure rules per tier.  
3. Validate combined container rules for overlapping states (e.g., narrow shell + expanded sidebar) and adjust spacing tokens where needed.
