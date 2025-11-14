# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AINexSuite Workflow** is a visual workflow builder application built with Next.js 15, React Flow, and Firebase. It allows users to design, automate, and visualize workflows using a drag-and-drop canvas interface with real-time persistence.

**Port**: 3010 (runs on `http://localhost:3010`)

## Development Commands

```bash
# Start development server on port 3010
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint with zero warnings tolerance
npm run lint

# Deploy to Vercel
npm run deploy

# Build workspace dependencies (runs automatically on postinstall)
npm run build:deps
```

## Architecture Overview

### React Flow Canvas System

The core of the application is built around **React Flow** (`@xyflow/react`), a powerful library for building node-based interfaces. The architecture follows these key principles:

**Node and Edge State Management**:
- Uses React Flow's `useNodesState` and `useEdgesState` hooks for managing canvas state
- All state changes are persisted to Firestore in real-time (1-second debounce)
- State is stored per-user in `workflows/{userId}` document with `{nodes, edges, viewport, updatedAt}` structure

**Edge Validation System**:
- Critical: The `validateEdges()` function (WorkflowCanvas.tsx:49) ensures edges only reference existing nodes
- Orphaned edges (edges pointing to deleted nodes) are automatically cleaned up on load and node changes
- Edge validation runs on initial load, theme changes, and when nodes are modified

**Undo/Redo System** (`useUndoRedo` hook):
- Snapshot-based approach with debouncing (500ms default)
- Maintains separate `past` and `future` history stacks (max 50 by default)
- Uses `isUndoRedoRef` flag to prevent snapshot creation during undo/redo operations
- Deep clones state using `JSON.parse(JSON.stringify())` to prevent reference issues

### Theme System Architecture

**Dynamic Theme Variables**:
- `ThemeContext` provides runtime theme switching with 8 color themes (purple, blue, green, orange, pink, cyan, red, amber)
- Theme colors are injected as CSS custom properties on `document.documentElement`:
  - `--theme-primary`, `--theme-primary-light`, `--theme-primary-dark`, `--theme-primary-rgb`
- All React Flow elements (edges, nodes, handles, controls) use these CSS variables
- Theme changes trigger edge re-styling to maintain visual consistency

**Edge Styling**:
- Default edge type: `smoothstep` with animated strokes
- Edges use `MarkerType.ArrowClosed` for arrow markers
- All edges inherit theme colors via `defaultEdgeOptions` (WorkflowCanvas.tsx:140)
- Edge styles are reapplied on theme changes using `setEdgesState` updater

### Node Types System

Four custom node types with distinct shapes and use cases:
- **Rectangle** (`RectangleNode`): Standard process nodes
- **Diamond** (`DiamondNode`): Decision/conditional nodes
- **Oval** (`OvalNode`): Start/End nodes
- **Parallelogram** (`ParallelogramNode`): Input/Output nodes

Each node type:
- Handles on all four sides (top, right, bottom, left) for flexible connections
- Editable labels via double-click (uses `contentEditable`)
- Custom rendering with SVG backgrounds for unique shapes
- Connection handles use `type: 'source'` and `type: 'target'` for bi-directional flow

### Authentication & Routing

**Auth Flow**:
- Homepage (`/`) shows marketing content when not authenticated
- Auto-redirects to `/workspace` when user is authenticated (800ms delay)
- Workspace page (`/workspace`) redirects to `/` if not authenticated
- Uses `@ainexsuite/auth` shared package for Firebase Authentication

**Protected Routes**:
- Only `/workspace` requires authentication
- Auth state is managed globally via `AuthProvider` in root layout

### Firebase Integration

**Firestore Schema**:
```
workflows/{userId}
├── nodes: Node[]          // React Flow nodes array
├── edges: Edge[]          // React Flow edges array
├── viewport: Viewport     // Canvas viewport state
└── updatedAt: string      // ISO timestamp
```

**Auto-save Behavior**:
- Debounced save on every nodes/edges change (1 second)
- Uses `setDoc` with `{ merge: true }` to preserve existing data
- Orphaned edges are cleaned up in Firestore on initial load

### Keyboard Shortcuts

Implemented via `useKeyboardShortcuts` hook:
- **Ctrl/Cmd + Z**: Undo
- **Ctrl/Cmd + Shift + Z** or **Ctrl/Cmd + Y**: Redo
- **Delete** or **Backspace**: Delete selected nodes/edges
- Shortcuts disabled when typing in input/textarea elements

### Shared Packages

This app depends on monorepo workspace packages:
- `@ainexsuite/auth`: Firebase Authentication wrapper
- `@ainexsuite/firebase`: Firebase config and initialization
- `@ainexsuite/ui`: Shared UI components (HomepageTemplate, Footer, etc.)
- `@ainexsuite/types`: TypeScript type definitions
- `@ainexsuite/config`: Shared Tailwind config and ESLint rules

Changes to shared packages require rebuilding: `npm run build:deps`

## Critical Implementation Details

### Edge Rendering and Visibility

**Z-Index Layering** (workflow-canvas.css):
- Edges: `z-index: 100` (ensures visibility above background)
- Edge paths: Forced visibility with `opacity: 1` and `visibility: visible`
- Background grid: Lower z-index (default)

**Edge Creation Flow**:
1. User drags from source handle to target handle
2. `onConnect` callback validates both nodes exist
3. Duplicate edge check prevents multiple edges between same handles
4. `addEdge()` creates new edge with theme-based styling
5. `takeSnapshot()` called for undo/redo support
6. State update triggers Firestore auto-save

### Node Deletion and Cleanup

When nodes are deleted:
1. Selected nodes are filtered out
2. ALL edges connected to deleted nodes are also removed (WorkflowCanvas.tsx:318-330)
3. Prevents orphaned edges in state
4. Snapshot taken before deletion for undo support

### Theme CSS Variable System

The theme system uses a two-layer approach:
1. `ThemeContext` sets CSS variables on document root (ThemeContext.tsx:30-38)
2. `workflow-canvas.css` uses these variables via `var(--theme-primary)`
3. Edge styling uses both CSS variables AND inline styles for React Flow compatibility

**Why Both?**:
- CSS variables: Static styling that persists across renders
- Inline styles: React Flow's `defaultEdgeOptions` for dynamic edge creation

## File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Marketing homepage with auto-redirect
│   └── workspace/
│       ├── layout.tsx          # Workspace-specific layout
│       └── page.tsx            # Main workspace with canvas
├── components/
│   ├── workflow-canvas/
│   │   ├── WorkflowCanvas.tsx  # Core canvas component
│   │   ├── ShapePalette.tsx    # Draggable shape palette
│   │   ├── Toolbar.tsx         # Canvas toolbar controls
│   │   ├── workflow-canvas.css # Canvas-specific styles
│   │   ├── nodes/              # Custom node implementations
│   │   └── hooks/              # Canvas-specific hooks
│   ├── ThemeSwitcher.tsx       # Theme selection UI
│   └── providers/              # App-specific providers
├── contexts/
│   └── ThemeContext.tsx        # Global theme state management
└── lib/
    └── themes.ts               # Theme definitions and utilities
```

## Common Gotchas

**Edge Validation is Critical**:
- Always run `validateEdges()` when loading from Firestore
- Never allow edges without corresponding source/target nodes
- Orphaned edges cause React Flow console warnings and potential crashes

**Theme Changes Require Edge Re-styling**:
- When theme changes, existing edges must be updated with new colors
- See `useEffect` at WorkflowCanvas.tsx:236 for implementation pattern

**Undo/Redo Snapshot Timing**:
- Take snapshot BEFORE state change, not after
- Use `isUndoRedoRef` flag to prevent recursive snapshots

**Node ID Counter Management**:
- On load, find max node ID and set counter to `maxId + 1`
- Prevents duplicate IDs when creating new nodes after load

**CSS Variable Propagation**:
- CSS variables set on `:root` are global
- React Flow uses shadow DOM in some cases - test theme changes thoroughly

## Debugging Edge Visibility Issues

If edges aren't rendering:
1. Check Debug Panel (top-right) - edges should appear in the list
2. Verify CSS variables are set: Inspect `document.documentElement.style`
3. Check browser console for edge validation errors
4. Ensure `defaultEdgeOptions` includes proper `style` and `markerEnd`
5. Verify z-index layering in developer tools

The Debug Panel shows:
- Total node count
- Total edge count
- List of all edges with source/target handles
- "Clear All Edges" button for troubleshooting
