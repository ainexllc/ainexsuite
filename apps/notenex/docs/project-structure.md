# Project Structure

Complete file organization and naming conventions for AiNex applications using Next.js 15 App Router.

## Directory Overview

```
your-app/
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/              # Utilities, types, constants
│   └── styles/           # Global styles (optional)
├── docs/                  # Documentation
├── .env.local            # Environment variables
├── .gitignore
├── firebase.json         # Firebase config
├── firestore.rules       # Firestore security rules
├── firestore.indexes.json
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## /src/app Structure

**Next.js 15 App Router** - File-based routing

```
src/app/
├── layout.tsx            # Root layout (wraps all pages)
├── page.tsx              # Homepage (/)
├── globals.css           # Global styles
├── workspace/
│   └── page.tsx          # /workspace
├── reminders/
│   └── page.tsx          # /reminders
├── focus/
│   └── page.tsx          # /focus
├── shared/
│   └── page.tsx          # /shared
├── ideas/
│   └── page.tsx          # /ideas
├── archive/
│   └── page.tsx          # /archive
├── trash/
│   └── page.tsx          # /trash
└── api/                  # API routes
    └── example/
        └── route.ts      # /api/example
```

### Special Files

| File | Purpose |
|------|---------|
| `layout.tsx` | Shared layout for route segment |
| `page.tsx` | Page UI (makes route publicly accessible) |
| `loading.tsx` | Loading UI (Suspense boundary) |
| `error.tsx` | Error UI (Error boundary) |
| `not-found.tsx` | 404 UI |
| `route.ts` | API endpoint |

### Root Layout Pattern

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Your App Name",
  description: "Your app description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
```

---

## /src/components Structure

```
src/components/
├── layout/               # Layout components
│   ├── app-shell.tsx
│   ├── top-nav.tsx
│   ├── navigation-panel.tsx
│   ├── settings-panel.tsx
│   ├── profile-dropdown.tsx
│   └── container.tsx
├── branding/            # Brand components
│   └── logo-wordmark.tsx
├── providers/           # Context providers
│   ├── app-providers.tsx
│   ├── theme-provider.tsx
│   ├── auth-provider.tsx
│   ├── notes-provider.tsx
│   ├── labels-provider.tsx
│   ├── reminders-provider.tsx
│   └── preferences-provider.tsx
├── notes/               # Feature: Notes
│   ├── note-board.tsx
│   ├── note-card.tsx
│   ├── note-editor.tsx
│   ├── note-composer.tsx
│   ├── view-toggle.tsx
│   └── archive-board.tsx
├── reminders/           # Feature: Reminders
│   ├── reminder-list.tsx
│   └── reminder-card.tsx
├── workspace/           # Feature: Workspace
│   └── ...
├── marketing/           # Landing page components
│   └── landing-page.tsx
├── auth/                # Authentication UI
│   ├── login-form.tsx
│   └── signup-form.tsx
└── ui/                  # Generic UI components
    ├── button.tsx
    ├── input.tsx
    ├── modal.tsx
    ├── toaster.tsx
    └── confirm-modal.tsx
```

### Component Naming Conventions

**File names:** kebab-case
- `app-shell.tsx` ✅
- `AppShell.tsx` ❌

**Component names:** PascalCase
```tsx
export function AppShell() { }  // ✅
export function appShell() { }  // ❌
```

**Export pattern:**
```tsx
// Named export (preferred)
export function ComponentName() { }

// Default export (for pages only)
export default function Page() { }
```

---

## /src/lib Structure

```
src/lib/
├── auth/                 # Authentication
│   ├── auth-context.ts
│   └── auth-utils.ts
├── firebase/            # Firebase integration
│   ├── client-app.ts   # Client SDK
│   ├── admin-app.ts    # Server SDK
│   └── config.ts
├── constants/           # Constants
│   ├── navigation.ts   # Nav items
│   ├── note-colors.ts  # Color definitions
│   └── note-patterns.ts # SVG patterns
├── types/               # TypeScript types
│   ├── note.ts
│   ├── reminder.ts
│   ├── label.ts
│   ├── user.ts
│   └── settings.ts
├── utils/               # Utility functions
│   ├── cn.ts           # className utility
│   ├── datetime.ts     # Date formatting
│   └── note-colors.ts  # Color utilities
├── hooks/               # Custom hooks
│   ├── use-notes.ts
│   └── use-debounce.ts
└── api/                 # API utilities
    └── client.ts
```

### Type Definitions Pattern

```tsx
// src/lib/types/note.ts
export type NoteColor =
  | "default"
  | "note-white"
  | "note-lemon"
  // ... other colors

export type NotePattern =
  | "none"
  | "dots"
  | "grid"
  // ... other patterns

export interface Note {
  id: string;
  userId: string;
  title: string;
  body: string;
  color: NoteColor;
  pattern: NotePattern;
  pinned: boolean;
  archived: boolean;
  deleted: boolean;
  createdAt: number;
  updatedAt: number;
}
```

---

## Configuration Files

### package.json

```json
{
  "name": "your-app-name",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Path Alias:** `@/*` maps to `./src/*`

```tsx
import { AppShell } from "@/components/layout/app-shell";
import { Note } from "@/lib/types/note";
```

### next.config.ts

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profile pics
      },
    ],
  },
};

export default nextConfig;
```

### tailwind.config.ts

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      // Custom design tokens
    },
  },
  plugins: [],
};

export default config;
```

---

## Firebase Files

### firebase.json

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### firestore.rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### firestore.indexes.json

```json
{
  "indexes": [],
  "fieldOverrides": []
}
```

---

## Environment Variables

### .env.local

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### .env.example

```env
# Copy this to .env.local and fill in your values

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## .gitignore

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# firebase
.firebase/
firebase-debug.log
firestore-debug.log
```

---

## Import Order Convention

**Recommended order:**

```tsx
// 1. External dependencies
import { useState, useEffect } from "react";
import Link from "next/link";
import { clsx } from "clsx";

// 2. Internal components
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

// 3. Internal utilities/types
import { cn } from "@/lib/utils/cn";
import type { Note } from "@/lib/types/note";

// 4. Relative imports
import { LocalComponent } from "./local-component";

// 5. Styles
import "./styles.css";
```

---

## Feature-Based Organization (Alternative)

For larger apps, consider feature-based structure:

```
src/
├── app/
│   ├── (auth)/          # Route group
│   │   ├── login/
│   │   └── signup/
│   └── (dashboard)/     # Route group
│       ├── workspace/
│       └── reminders/
├── features/            # Feature modules
│   ├── notes/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   └── reminders/
│       ├── components/
│       ├── hooks/
│       ├── types/
│       └── utils/
└── shared/              # Shared across features
    ├── components/
    ├── hooks/
    └── utils/
```

---

## File Size Guidelines

**Keep files focused:**
- Components: < 300 lines
- Utilities: < 150 lines
- Types: < 200 lines

**When to split:**
- Component has multiple distinct sub-components
- Utility file has unrelated functions
- Type file has types for multiple domains

---

## Naming Patterns

### Components
- Layout components: `app-shell.tsx`, `top-nav.tsx`
- Feature components: `note-card.tsx`, `reminder-list.tsx`
- UI components: `button.tsx`, `modal.tsx`
- Providers: `theme-provider.tsx`, `auth-provider.tsx`

### Utilities
- Functions: `cn.ts`, `datetime.ts`
- Constants: `navigation.ts`, `note-colors.ts`
- Hooks: `use-notes.ts`, `use-debounce.ts`

### Types
- Singular: `note.ts`, `user.ts`, `label.ts`
- Interface prefix: `Note`, `User`, `Label` (not `INote`)
- Type suffix: `NoteColor`, `NotePattern`

---

## Documentation Structure

```
docs/
├── README.md
├── design-system.md
├── components.md
├── layouts.md
├── navigation.md
├── ui-patterns.md
├── icons.md
├── animations.md
├── theming.md
├── functional-patterns.md
├── page-templates.md
├── dependencies.md
├── project-structure.md (this file)
├── setup-guides/
│   ├── local-development.md
│   ├── firebase-setup.md
│   ├── vercel-deployment.md
│   └── environment-variables.md
├── advanced-patterns/
│   ├── error-handling.md
│   ├── loading-states.md
│   ├── form-validation.md
│   ├── accessibility.md
│   ├── hooks-patterns.md
│   └── utilities.md
└── templates/
    ├── components/
    ├── pages/
    ├── config/
    └── lib/
```

---

## Implementation Checklist

- [ ] Set up Next.js 15 with App Router
- [ ] Configure TypeScript with path aliases
- [ ] Create `/src/app` structure with pages
- [ ] Organize components by feature in `/src/components`
- [ ] Set up lib folder with types, utils, constants
- [ ] Configure Tailwind and global styles
- [ ] Add Firebase configuration files
- [ ] Create .env.example template
- [ ] Configure .gitignore properly
- [ ] Document file organization for team

---

**Next Steps:**
- [Dependencies →](./dependencies.md) - What to install
- [Setup Guides →](./setup-guides/local-development.md) - How to set up
- [Components →](./components.md) - Where components live
