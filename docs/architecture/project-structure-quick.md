# Project Structure - Quick Reference

## Monorepo Structure (Turborepo)

```
ainexsuite/
├── apps/
│   ├── main/           # Main dashboard
│   ├── journey/        # Journal (Orange theme)
│   ├── notes/          # Notes (Blue theme)
│   ├── fit/            # Fitness tracking
│   ├── grow/           # Growth tracking
│   ├── moments/        # Photo memories
│   ├── pulse/          # Health metrics
│   ├── todo/           # Task management
│   ├── track/          # Habit tracking
│   └── workflow/       # Workflow automation
├── packages/
│   ├── ui/             # Shared components
│   ├── types/          # TypeScript types
│   ├── auth/           # Authentication
│   ├── theme/          # Theme system
│   ├── ai/             # AI utilities
│   └── config/         # Shared configs
└── .claude/            # Claude Code config
```

---

## Individual App Structure

```
apps/main/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage (/)
│   │   ├── globals.css         # Global styles
│   │   ├── workspace/          # /workspace
│   │   │   └── page.tsx
│   │   └── api/                # API routes
│   │       └── route.ts
│   ├── components/             # React components
│   │   ├── layout/             # Layout components
│   │   ├── features/           # Feature-specific
│   │   └── ui/                 # Reusable UI
│   └── lib/                    # Utilities
│       ├── firebase.ts         # Firebase config
│       ├── types.ts            # Type definitions
│       └── utils.ts            # Helper functions
├── public/                     # Static assets
├── .env.local                  # Environment variables
├── firebase.json               # Firebase config
├── firestore.rules             # Security rules
├── firestore.indexes.json      # Composite indexes
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Key Files & Purposes

### Next.js App Router
| File | Purpose |
|------|---------|
| `layout.tsx` | Shared layout for route segment |
| `page.tsx` | Route page component |
| `loading.tsx` | Loading UI (Suspense) |
| `error.tsx` | Error boundary |
| `not-found.tsx` | 404 page |
| `route.ts` | API endpoint |

### Configuration
| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration |
| `tailwind.config.ts` | Tailwind CSS config |
| `tsconfig.json` | TypeScript config |
| `package.json` | Dependencies & scripts |

### Firebase
| File | Purpose |
|------|---------|
| `firebase.json` | Firebase services config |
| `firestore.rules` | Firestore security rules |
| `firestore.indexes.json` | Composite indexes |

---

## Component Organization

```
src/components/
├── layout/
│   ├── app-shell.tsx           # Main app wrapper
│   ├── top-nav.tsx             # Top navigation
│   ├── navigation-panel.tsx    # Left sidebar
│   └── footer.tsx              # Footer
├── features/
│   ├── notes/                  # Note-related components
│   ├── reminders/              # Reminder components
│   └── auth/                   # Auth components
└── ui/
    ├── button.tsx              # Button component
    ├── card.tsx                # Card component
    └── modal.tsx               # Modal component
```

---

## Lib Organization

```
src/lib/
├── firebase.ts                 # Firebase initialization
├── types.ts                    # Shared TypeScript types
├── utils.ts                    # Helper functions
├── constants.ts                # App constants
└── hooks/
    ├── use-auth.ts             # Auth hook
    └── use-notes.ts            # Notes hook
```

---

## Naming Conventions

### Files
- Components: `PascalCase.tsx` (e.g., `TopNav.tsx`)
- Utilities: `kebab-case.ts` (e.g., `format-date.ts`)
- Types: `PascalCase.ts` or `types.ts`
- Constants: `UPPER_SNAKE_CASE` or `constants.ts`

### Components
- React components: `PascalCase`
- Hooks: `useCamelCase`
- Utilities: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

### Directories
- `kebab-case` for multi-word directories
- `lowercase` for single-word directories

---

## Shared Packages

### @ainexsuite/ui
Shared UI components used across all apps:
```
packages/ui/src/
├── components/
│   ├── footer.tsx
│   ├── button.tsx
│   └── card.tsx
└── styles/
    └── globals.css
```

### @ainexsuite/types
Shared TypeScript types:
```typescript
export interface User {
  id: string;
  email: string;
  displayName?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
}
```

### @ainexsuite/auth
Shared authentication utilities:
```typescript
export const AuthProvider = ({ children }) => { /* ... */ };
export const useAuth = () => { /* ... */ };
export const SuiteGuard = ({ children }) => { /* ... */ };
```

---

## Environment Variables

### Required for All Apps
```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAIN_DOMAIN=https://yourdomain.com
```

---

## Import Aliases

Configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  }
}
```

Usage:
```typescript
import { TopNav } from '@/components/layout/top-nav';
import { formatDate } from '@/lib/utils';
```

---

## Turborepo Commands

```bash
# Run all apps
pnpm dev

# Run specific app
pnpm --filter @ainexsuite/main dev

# Build all apps
pnpm build

# Build specific app
pnpm --filter @ainexsuite/journey build

# Run tests
pnpm test

# Lint
pnpm lint
```

---

## Best Practices

1. **Shared Code**: Use packages for code shared across 2+ apps
2. **Component Scope**: Keep feature-specific components in app directories
3. **Type Safety**: Define types in shared packages or lib/types
4. **Environment**: Never commit `.env.local` files
5. **Imports**: Use path aliases (`@/`) for clean imports
6. **Organization**: Group by feature, not file type

For complete details, see `project-structure.md` (606 lines)
