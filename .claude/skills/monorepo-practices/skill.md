# Monorepo Best Practices Skill

## Purpose
Maintain a healthy monorepo architecture with proper package boundaries, dependency management, and build optimization across 9 apps and 6 shared packages.

## When to Use
- When adding new packages or dependencies
- When refactoring shared code
- When experiencing slow builds
- When resolving circular dependencies
- During code organization decisions

## Monorepo Structure

```
ainexsuite/
├── apps/                    # 9 Next.js applications
│   ├── main/               # Dashboard (www.ainexsuite.com)
│   ├── notes/              # Notes app
│   ├── journal/            # Journal app
│   ├── todo/               # Todo app
│   ├── track/              # Habits tracker
│   ├── moments/            # Photo journal
│   ├── grow/               # Learning goals
│   ├── pulse/              # Health metrics
│   └── fit/                # Fitness tracker
├── packages/                # 6 shared packages
│   ├── ui/                 # Shared UI components
│   ├── firebase/           # Firebase SDKs
│   ├── auth/               # Auth utilities
│   ├── ai/                 # Grok AI integration
│   ├── types/              # TypeScript types
│   └── config/             # Shared configs
├── functions/               # Firebase Cloud Functions
├── packages/generators/     # Development tools
│   ├── create-ainex-app/
│   ├── add-grok-ai/
│   └── monorepo-manager/
└── docs/                    # Documentation
```

## Package Boundaries

### Dependency Rules

**Apps can depend on**:
- All shared packages (`@ainexsuite/*`)
- External npm packages
- NOT other apps

**Shared packages can depend on**:
- Other shared packages (with restrictions)
- External npm packages
- NOT apps

**Allowed Package Dependencies**:
```
ui → types, config
firebase → types, config
auth → firebase, types, config
ai → firebase, auth, types, config
types → (no dependencies)
config → (no dependencies)
```

### Circular Dependency Prevention

❌ **Forbidden**:
```
packages/ui imports from packages/auth
packages/auth imports from packages/ui
```

✅ **Correct**: Extract shared types
```
packages/types exports common interfaces
packages/ui imports from types
packages/auth imports from types
```

## Workspace Configuration

### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'packages/generators/*'
```

### Root package.json

```json
{
  "name": "ainexsuite",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^1.11.0",
    "typescript": "^5.3.3"
  }
}
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

## Shared Package Guidelines

### 1. UI Package Structure

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── app-shell.tsx
│   │   │   ├── top-nav.tsx
│   │   │   ├── navigation-panel.tsx
│   │   │   └── container.tsx
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── modal.tsx
│   │   └── providers/
│   │       └── theme-provider.tsx
│   ├── styles/
│   │   └── globals.css
│   └── lib/
│       └── utils/
│           └── cn.ts
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

**Export Pattern**:
```typescript
// packages/ui/src/index.ts
export { AppShell } from './components/layout/app-shell';
export { TopNav } from './components/layout/top-nav';
export { Container } from './components/layout/container';
export { Button } from './components/ui/button';
// ... other exports
```

**Usage in Apps**:
```typescript
// apps/notes/src/app/page.tsx
import { Container, Button } from '@ainexsuite/ui';
```

### 2. Types Package Organization

```
packages/types/
├── src/
│   ├── index.ts           # Re-export all
│   ├── note.ts
│   ├── journal.ts
│   ├── todo.ts
│   ├── habit.ts
│   ├── user.ts
│   └── common.ts
└── package.json
```

**Type Definition Pattern**:
```typescript
// packages/types/src/note.ts
export type NoteColor =
  | 'default'
  | 'note-white'
  | 'note-lemon'
  // ... other colors;

export interface Note {
  id: string;
  ownerId: string;
  title: string;
  body: string;
  color: NoteColor;
  createdAt: number;
  updatedAt: number;
}

export type CreateNoteInput = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateNoteInput = Partial<Omit<Note, 'id' | 'ownerId'>>;
```

### 3. Config Package Setup

```
packages/config/
├── eslint.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

**Extending Configs**:
```javascript
// apps/notes/tailwind.config.ts
import baseConfig from '@ainexsuite/config/tailwind.config';

export default {
  ...baseConfig,
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}'
  ]
};
```

## Dependency Management

### Adding Dependencies

**To all apps**:
```bash
pnpm add <package> --filter "./apps/*"
```

**To specific app**:
```bash
pnpm add <package> --filter @ainexsuite/notes
```

**To shared package**:
```bash
pnpm add <package> --filter @ainexsuite/ui
```

### Updating Dependencies

**Update all workspace packages**:
```bash
pnpm update --recursive
```

**Update specific package everywhere**:
```bash
pnpm update react --recursive
```

### Checking for Duplicates

```bash
# Check for duplicate versions
pnpm list react --depth 1

# Deduplicate
pnpm dedupe
```

## Build Optimization

### Turborepo Caching

**What Turbo Caches**:
- Build outputs (`.next/`, `dist/`)
- Test results
- Lint results

**Cache Invalidation**:
```bash
# Clear Turbo cache
turbo run build --force

# Clear all caches
rm -rf .turbo node_modules/.cache
```

### Parallel Builds

```bash
# Build all in parallel
turbo run build

# Build specific apps
turbo run build --filter @ainexsuite/notes --filter @ainexsuite/journal
```

### Build Pipeline Optimization

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"],
      "cache": true
    }
  }
}
```

## Code Sharing Patterns

### When to Extract to Shared Package

✅ **Good candidates**:
- UI components used in 2+ apps
- Business logic used across apps
- Type definitions needed by multiple packages
- Utility functions used everywhere

❌ **Keep in app**:
- App-specific business logic
- Single-use components
- App-specific types
- One-off utilities

### Extraction Process

1. **Identify shared code**
2. **Create in appropriate package**
3. **Export from package index**
4. **Import in apps**
5. **Remove duplicates**

**Example**:
```typescript
// Before (duplicated in apps)
// apps/notes/src/utils/format-date.ts
// apps/journal/src/utils/format-date.ts

// After (shared)
// packages/types/src/utils/format-date.ts
export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

// Usage in apps
import { formatDate } from '@ainexsuite/types';
```

## Versioning Strategy

### Shared Packages

**Use workspace protocol**:
```json
{
  "dependencies": {
    "@ainexsuite/ui": "workspace:*",
    "@ainexsuite/types": "workspace:*"
  }
}
```

**Benefits**:
- Always uses local version
- No version conflicts
- Automatic updates

### External Dependencies

**Keep versions consistent**:
```bash
# Check version inconsistencies
pnpm list react

# Update to same version everywhere
pnpm update react@19.1.0 --recursive
```

## Common Anti-Patterns

### 1. Importing from App to App

❌ **Wrong**:
```typescript
// apps/notes/src/app/page.tsx
import { TodoList } from '../../todo/src/components/todo-list';
```

✅ **Correct**: Extract to shared package
```typescript
// packages/ui/src/components/todo-list.tsx
export function TodoList() { ... }

// apps/notes/src/app/page.tsx
import { TodoList } from '@ainexsuite/ui';
```

### 2. Duplicating Types

❌ **Wrong**:
```typescript
// apps/notes/src/types/note.ts
interface Note { ... }

// apps/journal/src/types/note.ts
interface Note { ... }  // Same definition!
```

✅ **Correct**:
```typescript
// packages/types/src/note.ts
export interface Note { ... }

// Both apps import
import { Note } from '@ainexsuite/types';
```

### 3. Tight Coupling Between Packages

❌ **Wrong**:
```typescript
// packages/ui depends on packages/firebase directly
import { db } from '@ainexsuite/firebase';
```

✅ **Correct**: Pass dependencies
```typescript
// packages/ui accepts DB as prop
export function DataTable({ db, query }) { ... }
```

### 4. Large Bundle Sizes from Shared Packages

❌ **Wrong**: Import everything
```typescript
import * as UI from '@ainexsuite/ui';
```

✅ **Correct**: Import only what you need
```typescript
import { Button, Container } from '@ainexsuite/ui';
```

## Monorepo Scripts

### Useful Commands

```json
{
  "scripts": {
    "dev:all": "turbo run dev",
    "dev:notes": "turbo run dev --filter @ainexsuite/notes",
    "build:all": "turbo run build",
    "build:shared": "turbo run build --filter './packages/*'",
    "build:apps": "turbo run build --filter './apps/*'",
    "lint:all": "turbo run lint",
    "test:all": "turbo run test",
    "test:affected": "turbo run test --filter=[HEAD^1]",
    "clean": "turbo run clean && rm -rf node_modules .turbo",
    "graph": "turbo run build --graph=graph.html"
  }
}
```

### Dependency Graph

```bash
# Generate visual dependency graph
turbo run build --graph=graph.html
open graph.html
```

## Performance Monitoring

### Build Times

Track build performance:
```bash
# With timing
turbo run build --profile=profile.json

# Analyze profile
turbo-analyze profile.json
```

### Cache Hit Rate

```bash
# Check cache effectiveness
turbo run build --summarize
```

**Target**: >80% cache hit rate

## Migration Guide

### Moving Code to Shared Package

1. **Create package structure**
```bash
mkdir -p packages/new-package/src
cd packages/new-package
pnpm init
```

2. **Configure package.json**
```json
{
  "name": "@ainexsuite/new-package",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js"
  }
}
```

3. **Move code**
```bash
mv apps/notes/src/utils/shared.ts packages/new-package/src/
```

4. **Update imports**
```typescript
// Old
import { util } from '../utils/shared';

// New
import { util } from '@ainexsuite/new-package';
```

5. **Add to workspace**
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/new-package'
```

6. **Install in apps**
```bash
pnpm install
```

## Checklist

### Before Committing
- [ ] No circular dependencies
- [ ] Package boundaries respected
- [ ] Types extracted to shared package
- [ ] Consistent dependency versions
- [ ] Build passes (`turbo run build`)
- [ ] Tests pass (`turbo run test`)
- [ ] Lint passes (`turbo run lint`)

### Before Publishing
- [ ] Update package versions
- [ ] Update CHANGELOG
- [ ] Build all packages
- [ ] Test in all apps
- [ ] Check bundle sizes
- [ ] Update documentation

## Resources

- [Turborepo Docs](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Monorepo Best Practices](https://monorepo.tools/)

---

**Remember**: Good monorepo management prevents future headaches. Invest time in proper structure upfront.
