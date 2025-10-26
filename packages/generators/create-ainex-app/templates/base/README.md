# {{APP_NAME_CAPITALIZED}} App

Part of the AINexSuite productivity suite.

## Development

```bash
# Install dependencies (from monorepo root)
pnpm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Production

Domain: `{{DOMAIN}}`

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Features

- ✅ Next.js 15 with App Router
- ✅ SSO authentication (shared across all AINexSuite apps)
- ✅ NoteNex design system (dark/light mode)
- ✅ Firebase backend (Firestore, Auth, Storage)
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Shared UI components from @ainexsuite/ui

## Tech Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS + NoteNex design system
- **Backend**: Firebase (Firestore, Auth, Storage)
- **State**: React Context
- **Authentication**: Firebase Auth with session cookies
- **Deployment**: Vercel

## Structure

```
src/
├── app/
│   ├── layout.tsx    # Root layout with AppShell
│   ├── page.tsx      # Homepage
│   └── globals.css   # Global styles
```

## Shared Packages

This app uses shared packages from the monorepo:

- `@ainexsuite/ui` - UI components and design system
- `@ainexsuite/firebase` - Firebase SDK configuration
- `@ainexsuite/auth` - SSO authentication utilities
- `@ainexsuite/types` - TypeScript types
- `@ainexsuite/config` - Shared configurations

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

- Firebase credentials (already set in example)
- App name and domain

## Documentation

See the [main documentation](../../docs/) for:
- Design system guidelines
- Component library
- Firebase setup
- Deployment guide
