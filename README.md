# AINexSuite

Multi-app productivity suite with 8 apps + main dashboard, single sign-on, shared Firebase backend, and Grok 4 AI assistants.

## Architecture

- **Monorepo**: Turborepo with pnpm workspaces
- **Apps**: 9 Next.js 15 applications on subdomains
- **Backend**: Firebase (alnexsuite project)
- **AI**: Grok 4 (grok-beta) via xAI API
- **Deployment**: Vercel with custom domains

## Project Structure

```
ainexsuite/
├── apps/                    # 9 Next.js applications
│   ├── main/               # www.ainexsuite.com
│   ├── notes/              # notes.ainexsuite.com
│   ├── journal/            # journal.ainexsuite.com
│   ├── todo/               # todo.ainexsuite.com
│   ├── track/              # track.ainexsuite.com
│   ├── moments/            # moments.ainexsuite.com
│   ├── grow/               # grow.ainexsuite.com
│   ├── pulse/              # pulse.ainexsuite.com
│   └── fit/                # fit.ainexsuite.com
├── packages/                # 6 shared packages
│   ├── ui/                 # NoteNex design system
│   ├── firebase/           # Firebase SDKs
│   ├── auth/               # SSO session cookies
│   ├── ai/                 # Grok AI integration
│   ├── types/              # TypeScript types
│   ├── config/             # Shared configs
│   └── generators/         # 3 custom agents
│       ├── create-ainex-app/
│       ├── add-grok-ai/
│       └── monorepo-manager/
└── functions/               # Firebase Cloud Functions
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- Firebase CLI

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all apps in dev mode
pnpm dev
```

### Development Scripts

```bash
# Run specific app
pnpm dev:notes
pnpm dev:journal

# Build all
pnpm build

# Lint all
pnpm lint

# Test all
pnpm test

# Clean all
pnpm clean
```

## Custom Development Tools

### Agents (Automation)

1. **App Generator** - Scaffold new apps in 10 minutes
   ```bash
   pnpm create-ainex-app <app-name> --type=<base|with-ai|dashboard>
   ```

2. **Grok AI Integration** - Add AI to existing apps
   ```bash
   pnpm add-grok-ai <app-name>
   ```

3. **Monorepo Manager** - Deploy and manage all apps
   ```bash
   pnpm deploy:all
   ```

### Skills (Expert Guidance)

6 custom skills in `.claude/skills/`:
- Design System Enforcer
- Firebase Security Architect
- AI Prompt Engineer
- Monorepo Best Practices
- Performance Optimizer
- Testing Strategy

## Firebase Cloud Functions

Located in `functions/`:

1. **generateSessionCookie** - Creates SSO session cookies
2. **checkAuthStatus** - Verifies authentication
3. **chatWithGrok** - Handles AI requests

Deploy:
```bash
cd functions
npm install
firebase deploy --only functions
```

## Deployment

### Deploy All Apps to Vercel

```bash
pnpm deploy:all
```

### Deploy Specific App

```bash
pnpm deploy:notes
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, NoteNex design system
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **AI**: Grok 4 via xAI API
- **Build**: Turborepo, pnpm
- **Deployment**: Vercel

## Progress

✅ Phase 0: Development Tools Setup (3 agents, 6 skills) - **COMPLETE**
✅ Phase 1: Foundation & Infrastructure (monorepo, packages, Cloud Functions) - **COMPLETE**
✅ Phase 2: Main Dashboard with SSO - **COMPLETE**
⏳ Phase 3: First 3 Apps (Notes in progress, Journal, Todo) - **IN PROGRESS**
📋 Phase 4: Remaining 5 Apps (Track, Moments, Grow, Pulse, Fit) - **PENDING**
📋 Phase 5: Cross-App Integration - **PENDING**
📋 Phase 6: Production Deployment - **PENDING**

**Overall Progress: 33% Complete (2.5/6 phases done)**

## Documentation

- [Final Plan](./finalplan.md) - Complete 9-week implementation plan
- [Progress Tracker](./PROGRESS.md) - Detailed progress and next steps
- [Design System](./packages/ui/src/styles/globals.css) - NoteNex design system
- [Custom Skills](./.claude/skills/) - Expert guidance documents

## License

Private - AINex LLC

---

**Status**: Phase 1 Complete - Ready for app development
