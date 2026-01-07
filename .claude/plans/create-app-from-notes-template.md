# Template: Create New App (Copy of Notes with Full-Page Editor)

> **Reusable Plan** - Use this template to create new apps based on the Notes app but with a full-page editor experience (like Microsoft Word). This was used to create the Docs app and can be used for Tables (Spreadsheets), etc.

## Overview

Create a new app by copying notes, but with a workflow-style editor experience where clicking an item opens a full-page editor instead of a modal.

---

## Variables to Replace

Replace these placeholders throughout the implementation:

| Variable             | Example (Docs)      | Example (Tables)      |
| -------------------- | ------------------- | --------------------- |
| `{APP_NAME}`         | Docs                | Tables                |
| `{APP_SLUG}`         | docs                | tables                |
| `{APP_PORT}`         | 3012                | 3013                  |
| `{ITEM_NAME}`        | doc                 | table                 |
| `{ITEM_NAME_PLURAL}` | docs                | tables                |
| `{ITEM_NAME_CAPS}`   | Doc                 | Table                 |
| `{ICON_NAME}`        | FileText            | Table2                |
| `{APP_COLOR}`        | blue                | green                 |
| `{APP_HEX}`          | #3b82f6             | #22c55e               |
| `{DOMAIN}`           | docs.ainexspace.com | tables.ainexspace.com |
| `{DESCRIPTION}`      | Rich documents      | Spreadsheet editing   |
| `{SUBTITLE}`         | Rich documents      | Data & formulas       |

---

## Implementation Steps

### Phase 1: Base Setup

1. **Copy notes app**

   ```bash
   cp -r apps/notes apps/{APP_SLUG}
   rm -rf apps/{APP_SLUG}/node_modules apps/{APP_SLUG}/.next
   ```

2. **Update package.json** (`apps/{APP_SLUG}/package.json`)
   - Name: `@ainexsuite/{APP_SLUG}`
   - Port: `{APP_PORT}`
   - Description: "{APP_NAME} app - {DESCRIPTION} at {DOMAIN}"

3. **Update vercel.json** (`apps/{APP_SLUG}/vercel.json`)
   - Filter: `@ainexsuite/{APP_SLUG}`
   - Paths: `./apps/{APP_SLUG}`

### Phase 2: Configuration Updates

4. **Add to app-registry.ts** (`packages/types/src/app-registry.ts`)

   ```typescript
   // Add to AppSlug type
   | '{APP_SLUG}'

   // Add to APP_REGISTRY
   {APP_SLUG}: {
     name: '{APP_NAME}',
     slug: '{APP_SLUG}',
     description: '{DESCRIPTION}',
     icon: '{ICON_NAME}',
     color: '{APP_COLOR}',
     gradient: 'from-{APP_COLOR}-500 to-{APP_COLOR}-600',
     devUrl: 'http://localhost:{APP_PORT}',
     prodUrl: 'https://{DOMAIN}',
     devPort: {APP_PORT},
     category: 'productivity',
     features: ['Feature1', 'Feature2'],
     status: 'active',
   },
   ```

5. **Add to ecosystem.config.js**

   ```javascript
   {
     name: "{APP_SLUG}",
     cwd: "./apps/{APP_SLUG}",
     script: "pnpm",
     args: "dev",
     env: { PORT: {APP_PORT}, NODE_ENV: "development", ...sharedEnv },
     // ... other config
   },
   ```

6. **Update UI configs**
   - `packages/ui/src/config/apps.ts` - Add to SUITE_APPS + portMap
   - `packages/ui/src/utils/cross-app-navigation.ts` - Add '{APP_PORT}': '{APP_SLUG}'
   - `packages/ui/src/utils/navigation.tsx` - Add icon mapping
   - `packages/ui/src/components/layout/app-navigation-sidebar.tsx` - Add to APP_SUBTITLES

7. **Add to notification.ts** (`packages/types/src/notification.ts`)
   ```typescript
   {APP_SLUG}: [
     { id: 'new-{ITEM_NAME}', label: 'New {ITEM_NAME_CAPS}', description: 'Create a {ITEM_NAME}', icon: '{ICON_NAME}', shortcut: 'N', app: '{APP_SLUG}', category: 'create' },
   ],
   ```

### Phase 3: Rename Internal References

8. **Global rename in apps/{APP_SLUG}/**
   - `note` → `{ITEM_NAME}`
   - `Note` → `{ITEM_NAME_CAPS}`
   - `notes` → `{ITEM_NAME_PLURAL}`
   - `Notes` → `{ITEM_NAME_PLURAL capitalized}`
   - appId: `notes` → `{APP_SLUG}`

9. **Rename files and directories**
   - `components/notes/` → `components/{ITEM_NAME_PLURAL}/`
   - `note-*.ts(x)` → `{ITEM_NAME}-*.ts(x)`
   - `notes-provider.tsx` → `{ITEM_NAME_PLURAL}-provider.tsx`
   - `lib/types/note.ts` → `lib/types/{ITEM_NAME}.ts`

10. **Update Firestore collection path** (`lib/firebase/collections.ts`)
    - Change to `users/{userId}/{ITEM_NAME_PLURAL}`

### Phase 4: Add Dynamic Editor Route

11. **Create route structure**

    ```
    apps/{APP_SLUG}/src/app/workspace/[{ITEM_NAME}Id]/
    ├── page.tsx      # Editor page wrapper
    └── layout.tsx    # Full-width editor layout
    ```

12. **[{ITEM_NAME}Id]/page.tsx** - Minimal wrapper

    ```typescript
    'use client';
    import { use } from 'react';
    import { FullPage{ITEM_NAME_CAPS}Editor } from '@/components/{ITEM_NAME_PLURAL}/full-page-{ITEM_NAME}-editor';

    interface PageProps {
      params: Promise<{ {ITEM_NAME}Id: string }>;
    }

    export default function {ITEM_NAME_CAPS}EditorPage({ params }: PageProps) {
      const { {ITEM_NAME}Id } = use(params);
      return <FullPage{ITEM_NAME_CAPS}Editor {ITEM_NAME}Id={{ITEM_NAME}Id} />;
    }
    ```

13. **[{ITEM_NAME}Id]/layout.tsx** - Full-width layout
    - WorkspaceHeader with appName="{APP_SLUG}"
    - Full-width main content area
    - FeedbackWidget

14. **Modify {ITEM_NAME}-card.tsx**
    - Change onClick from modal to `router.push(`/workspace/${{ITEM_NAME}.id}`)`

15. **Create full-page-{ITEM_NAME}-editor.tsx**
    - Firestore real-time subscription
    - Full-width editor (TipTap or custom)
    - Debounced auto-save
    - Back navigation

### Phase 5: DNS & Documentation

16. **Add DNS record** (Namecheap)
    - CNAME: `{APP_SLUG}` → `6564e084d3bfb57d.vercel-dns-016.com`

17. **Update documentation**
    - `.claude/commands/restart-all.md` - Add port and app
    - `.claude/CLAUDE.md` - Add to apps table

18. **Build and verify**
    ```bash
    pnpm build
    ```

---

## Critical Files to Create/Modify

### New Files

- `apps/{APP_SLUG}/src/app/workspace/[{ITEM_NAME}Id]/page.tsx`
- `apps/{APP_SLUG}/src/app/workspace/[{ITEM_NAME}Id]/layout.tsx`
- `apps/{APP_SLUG}/src/components/{ITEM_NAME_PLURAL}/full-page-{ITEM_NAME}-editor.tsx`

### Config Files to Update

- `packages/types/src/app-registry.ts`
- `packages/types/src/notification.ts`
- `packages/ui/src/config/apps.ts`
- `packages/ui/src/utils/cross-app-navigation.ts`
- `packages/ui/src/utils/navigation.tsx`
- `packages/ui/src/components/layout/app-navigation-sidebar.tsx`
- `ecosystem.config.js`
- `.claude/commands/restart-all.md`
- `.claude/CLAUDE.md`

---

## Firestore Collection

- **Path:** `users/{userId}/{ITEM_NAME_PLURAL}/{ITEM_NAME}Id`
- **Schema:** Customize based on app needs

---

## Example Implementations

### Docs App (Completed)

- Port: 3012
- Domain: docs.ainexspace.com
- Item: doc/docs
- Editor: TipTap rich text

### Tables App (Future)

- Port: 3013
- Domain: tables.ainexspace.com
- Item: table/tables
- Editor: Spreadsheet grid component
