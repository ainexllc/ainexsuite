# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AINexSuite Projects** - A Next.js 15 + Firebase project management app with React Flow-powered whiteboard functionality. Part of the AinexSuite monorepo.

**Port**: 3009 (dev server)

## Development Commands

```bash
# Development
pnpm dev                     # Start dev server on port 3009
pnpm build                   # Production build
pnpm start                   # Start production server
pnpm lint                    # Run ESLint with zero warnings

# Deployment
pnpm deploy                  # Deploy to Vercel production

# Dependencies (auto-runs on install)
pnpm build:deps              # Build workspace dependencies
```

## Architecture Overview

### Core Stack
- **Framework**: Next.js 15 (App Router) with React 19
- **Authentication**: Firebase Auth with Google OAuth (via `@ainexsuite/auth` package)
- **Database**: Cloud Firestore (via `@ainexsuite/firebase` package)
- **Whiteboard**: React Flow (@xyflow/react) with custom sticky note nodes
- **Styling**: Tailwind CSS with shared config preset
- **Fonts**: Geist Sans/Mono, Kanit, Bebas Neue, League Spartan

### Monorepo Integration
This app is part of the AinexSuite Turborepo and uses workspace packages:
- `@ainexsuite/auth` - Shared authentication provider and hooks
- `@ainexsuite/firebase` - Firebase config and Firestore instance
- `@ainexsuite/types` - Shared TypeScript types
- `@ainexsuite/ui` - Shared UI components (HomepageTemplate, Footer, etc.)
- `@ainexsuite/config` - Shared Tailwind and ESLint configs

### Key Application Flow

**1. Authentication Flow**
- Unauthenticated users → Marketing homepage (`/`)
- Authenticated users → Auto-redirect to `/workspace`
- Uses `@ainexsuite/auth` `<AuthProvider>` and `useAuth()` hook

**2. Workspace Structure**
```
/ (page.tsx)              # Marketing page with HomepageTemplate
  → Checks auth
  → If logged in → redirect to /workspace
  → If not → show sign-in/sign-up

/workspace (page.tsx)     # Protected whiteboard workspace
  → Requires authentication
  → Fixed top nav with search and profile
  → React Flow whiteboard canvas
  → Real-time Firestore persistence
```

**3. Whiteboard System** (`/src/components/whiteboard/`)
- **Whiteboard.tsx** - Main canvas with React Flow
- **StickyNoteNode.tsx** - Custom node type for sticky notes
- **useUndoRedo.ts** - Undo/redo history management
- **Firestore persistence** - Auto-saves to `whiteboards/{userId}`
- **Features**:
  - Drag-and-drop sticky notes
  - Connectable edges between notes
  - Undo/redo (Ctrl+Z / Ctrl+Y)
  - Dark/light mode toggle
  - Export/import to JSON
  - Edge validation (prevents orphaned edges)

**4. Visual Styling System**
- `visual-style.ts` - Gradient theme variants (Ember Glow, Aurora Mist)
- `VisualStyleProvider` - Context for theme switching
- Current theme: Blue-cyan gradients with glassmorphism

## Important Implementation Details

### Firestore Data Structure
```typescript
// Collection: whiteboards/{userId}
{
  nodes: Array<{
    id: string;
    type: 'stickyNote';
    position: { x: number; y: number };
    data: {
      text: string;
      color: string;
      size: 'small' | 'medium' | 'large';
    };
  }>;
  edges: Array<{
    id: string;
    source: string;  // node id
    target: string;  // node id
    type: string;
  }>;
  isDarkMode: boolean;
  updatedAt: string; // ISO timestamp
}
```

### Edge Validation Pattern
The whiteboard implements edge validation to prevent orphaned edges (edges referencing deleted nodes):
- `validateEdges()` function filters out invalid edges
- Called on load and before save
- Automatically cleans up orphaned edges in Firestore

### Firebase Admin API Routes
- `/api/auth/custom-token` - Generate custom Firebase tokens
- `/api/auth/session` - Session management
- Uses `firebase-admin` with server environment variables

### Environment Variables
```typescript
// Server-side (firebase-admin)
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
FIREBASE_ADMIN_DATABASE_URL

// Client-side (firebase client SDK)
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
```

## File Organization

```
src/
├── app/
│   ├── layout.tsx                    # Root layout with AuthProvider
│   ├── page.tsx                      # Marketing homepage
│   ├── workspace/page.tsx            # Protected whiteboard workspace
│   ├── globals.css                   # Global styles
│   └── api/auth/                     # Firebase Admin API routes
├── components/
│   ├── whiteboard/                   # React Flow whiteboard
│   │   ├── Whiteboard.tsx           # Main canvas component
│   │   ├── StickyNoteNode.tsx       # Custom sticky note node
│   │   ├── hooks/useUndoRedo.ts     # History management
│   │   └── whiteboard.css           # Whiteboard-specific styles
│   ├── branding/
│   │   └── ainex-studios-logo.tsx   # Logo component
│   ├── providers/
│   │   └── visual-style-provider.tsx # Theme context provider
│   ├── footer.tsx                    # App footer
│   └── project-modal.tsx             # Project modal component
├── lib/
│   ├── firebase/
│   │   └── admin-app.ts             # Firebase Admin initialization
│   └── theme/
│       └── visual-style.ts          # Gradient theme system
└── env.ts                            # Environment variable exports
```

## Styling Approach

**Theme**: Blue-cyan glassmorphism with atmospheric glows
- Primary: `#38bdf8` (sky-400)
- Secondary: `#0ea5e9` (sky-500)
- Background: `#050505` (near-black)
- Glassmorphism: `backdrop-blur-2xl` with `rgba` backgrounds
- Atmospheric effects: Large blurred gradient circles

**Shared Tailwind Config**: Extends `@ainexsuite/config/tailwind` preset

## Testing & Development Notes

### Whiteboard Development
- React Flow requires `ReactFlowProvider` wrapper
- Nodes need callbacks for delete/text change operations
- Edges must be validated on load/save to prevent orphans
- Auto-save debounced to 1 second after changes

### Authentication Testing
- Use Google OAuth sign-in (configured in Firebase Console)
- Auth state managed by `@ainexsuite/auth` package
- Session persistence handled by Firebase Auth

### Common Gotchas
1. **Whiteboard callbacks**: Node data must include `onDelete` and `onTextChange` functions - these are stripped before saving to Firestore
2. **Edge validation**: Always validate edges before setting state to prevent orphaned connections
3. **Monorepo builds**: Run `pnpm build:deps` if workspace packages change
4. **Vercel config**: Note that `vercel.json` has hardcoded filter for `@ainexsuite/main` - this should be updated to `@ainexsuite/projects`

## Deployment Configuration

**Vercel Setup**:
- Build from monorepo root with Turborepo
- Output directory: `.next`
- Framework detection: Next.js
- **Issue**: `vercel.json` currently references `@ainexsuite/main` instead of `@ainexsuite/projects`

**Firebase Deployment**:
- Firestore security rules required for `whiteboards` collection
- Ensure user can only read/write their own whiteboard: `whiteboards/{userId}`

## Related Documentation

See parent monorepo documentation:
- `../../.claude/CLAUDE.md` - Monorepo project context
- `~/.claude/CLAUDE.md` - Global development standards
