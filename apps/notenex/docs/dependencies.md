# Dependencies

Complete tech stack and package reference for building AiNex applications.

## Package.json Template

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
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-toast": "^1.2.15",
    "clsx": "^2.1.1",
    "firebase": "^11.2.0",
    "lucide-react": "^0.468.0",
    "next": "15.5.4",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-hook-form": "^7.65.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.20",
    "eslint": "^9",
    "eslint-config-next": "15.5.4",
    "firebase-admin": "^12.6.0",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.15",
    "typescript": "^5"
  }
}
```

## Core Dependencies

### Framework

**Next.js** (`next@15.5.4`)
- React framework for production
- App Router (not Pages Router)
- Server components and client components
- Built-in routing, image optimization
- [Documentation](https://nextjs.org/docs)

**React** (`react@19.1.0`)
- UI library
- Component-based architecture
- Hooks for state management
- [Documentation](https://react.dev)

**React DOM** (`react-dom@19.1.0`)
- React rendering for web
- Required for Next.js

### Styling

**TailwindCSS** (`tailwindcss@3.4.15`)
- Utility-first CSS framework
- JIT (Just-In-Time) compiler
- Custom design tokens
- [Documentation](https://tailwindcss.com)

**PostCSS** (`postcss@8.4.47`)
- CSS processor for Tailwind
- Autoprefixer plugin included

**Autoprefixer** (`autoprefixer@10.4.20`)
- Adds vendor prefixes automatically
- Required for cross-browser compatibility

**clsx** (`clsx@2.1.1`)
- Conditional className utility
- Lightweight alternative to classnames
- [Documentation](https://github.com/lukeed/clsx)

**Usage:**
```tsx
import { clsx } from "clsx";

<div className={clsx(
  "base-class",
  isActive && "active-class",
  isPending ? "pending" : "idle"
)} />
```

### Icons

**Lucide React** (`lucide-react@0.468.0`)
- Beautiful, consistent SVG icons
- Tree-shakeable imports
- 1000+ icons
- [Documentation](https://lucide.dev)

**Usage:**
```tsx
import { Menu, Search, X } from "lucide-react";

<Menu className="h-4 w-4" />
```

### Backend & Database

**Firebase** (`firebase@11.2.0`)
- Authentication (Google OAuth, Email/Password)
- Firestore (NoSQL database)
- Real-time data synchronization
- Cloud Storage
- [Documentation](https://firebase.google.com/docs)

**Firebase Admin** (`firebase-admin@12.6.0`)
- Server-side Firebase SDK
- Used in API routes
- Admin privileges for Firestore
- DevDependency

**Features Used:**
- Authentication (Google, Email/Password)
- Firestore Database
- Real-time Listeners
- Security Rules

### Forms & Validation

**React Hook Form** (`react-hook-form@7.65.0`)
- Performant form library
- Built-in validation
- Minimal re-renders
- [Documentation](https://react-hook-form.com)

**@hookform/resolvers** (`@hookform/resolvers@5.2.2`)
- Validation schema resolvers for React Hook Form
- Zod integration

**Zod** (`zod@3.23.8`)
- TypeScript-first schema validation
- Type inference
- Composable validators
- [Documentation](https://zod.dev)

**Usage:**
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

### UI Components

**Radix UI** (`@radix-ui/react-toast@1.2.15`)
- Headless UI components
- Accessible by default
- Only using Toast component currently
- [Documentation](https://www.radix-ui.com)

**Why Radix:**
- Accessibility built-in (ARIA)
- Unstyled (style with Tailwind)
- Composable primitives

**Potential Additions:**
```json
{
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-select": "^2.0.0"
}
```

## Development Dependencies

### TypeScript

**TypeScript** (`typescript@^5`)
- Type safety for JavaScript
- Better IDE support
- Catch errors at compile time
- [Documentation](https://www.typescriptlang.org)

**@types/node** (`@types/node@^20`)
- Node.js type definitions

**@types/react** (`@types/react@^19`)
- React type definitions

**@types/react-dom** (`@types/react-dom@^19`)
- React DOM type definitions

### Linting

**ESLint** (`eslint@^9`)
- JavaScript/TypeScript linter
- Code quality enforcement
- [Documentation](https://eslint.org)

**eslint-config-next** (`eslint-config-next@15.5.4`)
- Next.js recommended ESLint rules
- React rules included

**@eslint/eslintrc** (`@eslint/eslintrc@^3`)
- ESLint configuration utilities

## Optional Dependencies

### Fonts (via next/font)

Already included in Next.js, no install needed:

**Geist Sans** - Body text and UI
**Geist Mono** - Code and monospace
**Google Fonts** - For branding (Kanit)

**Usage:**
```tsx
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Kanit } from "next/font/google";

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-kanit",
});
```

### Recommended Additions

**Date/Time:**
```bash
npm install date-fns
```
- Lightweight date utilities
- Tree-shakeable
- [Documentation](https://date-fns.org)

**Unique IDs:**
```bash
npm install nanoid
```
- Unique ID generator
- Smaller than UUID
- [Documentation](https://github.com/ai/nanoid)

**Drag & Drop:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable
```
- Modern drag and drop
- Accessible
- [Documentation](https://dndkit.com)

## Installation

### New Project

```bash
# Create Next.js app
npx create-next-app@latest your-app-name --typescript --tailwind --app --no-src

# Navigate to project
cd your-app-name

# Install dependencies
npm install @hookform/resolvers @radix-ui/react-toast clsx firebase lucide-react react-hook-form zod

# Install dev dependencies
npm install -D firebase-admin
```

### Using the Starter Template

```bash
# Clone starter
cp -r /Users/dino/ainex/ainex-app-starter /Users/dino/ainex/your-app-name

# Navigate
cd /Users/dino/ainex/your-app-name

# Install
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Start dev server
npm run dev
```

## Package Version Compatibility

**Tested Combinations:**

| Package | Version | Compatible With |
|---------|---------|-----------------|
| Next.js | 15.5.4 | React 19.x |
| React | 19.1.0 | Next 15.x |
| TailwindCSS | 3.4.15 | Next 15.x |
| Firebase | 11.2.0 | Next 15.x (client & server) |
| TypeScript | 5.x | Next 15.x, React 19.x |
| Lucide React | 0.468.0 | React 19.x |

## Scripts

### Development

```bash
# Start dev server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Custom Scripts (Optional)

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "deploy": "npm run build && firebase deploy --only hosting",
    "deploy:rules": "firebase deploy --only firestore:rules",
    "deploy:indexes": "firebase deploy --only firestore:indexes",
    "emulators": "firebase emulators:start"
  }
}
```

## Environment Variables

Create `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Firebase Admin (server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
```

## Dependency Management

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update lucide-react

# Update all minor/patch versions
npm update

# Update to latest (including major versions)
npm install next@latest react@latest react-dom@latest
```

### Security Audits

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (if possible)
npm audit fix

# Force fix (may break things)
npm audit fix --force
```

## Bundle Size Considerations

**Keep Bundle Small:**
- ✅ Tree-shakeable imports (Lucide React, date-fns)
- ✅ Next.js automatic code splitting
- ✅ Use dynamic imports for large components
- ❌ Avoid moment.js (use date-fns instead)
- ❌ Avoid lodash (use native JS or lodash-es)

**Dynamic Imports:**

```tsx
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("@/components/heavy"), {
  loading: () => <Spinner />,
});
```

## License Considerations

All dependencies use permissive licenses:
- Next.js: MIT
- React: MIT
- TailwindCSS: MIT
- Firebase: Apache 2.0
- Lucide: ISC
- Radix UI: MIT
- React Hook Form: MIT
- Zod: MIT

---

**Next Steps:**
- [Project Structure →](./project-structure.md) - Where to install dependencies
- [Setup Guides →](./setup-guides/local-development.md) - How to set up new project
- [Functional Patterns →](./functional-patterns.md) - How to use these libraries
