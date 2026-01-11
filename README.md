# AINexSuite

Multi-app productivity suite with 8 apps + main dashboard, single sign-on, shared Firebase backend, and Grok 4 AI assistants.

## Architecture

- **Monorepo**: Turborepo with pnpm workspaces
- **Apps**: 11 Next.js 15 applications on subdomains
- **Backend**: Firebase (alnexsuite project)
- **AI**: Grok 4 (grok-beta) via xAI API
- **Deployment**: Vercel with custom domains

## Project Structure

```
ainexsuite/
├── apps/                    # 11 Next.js applications
│   ├── main/               # www.ainexspace.com
│   ├── projects/           # project.ainexspace.com
│   ├── notes/              # notes.ainexspace.com
│   ├── journey/            # journey.ainexspace.com
│   ├── todo/               # todo.ainexspace.com
│   ├── track/              # track.ainexspace.com
│   ├── moments/            # moments.ainexspace.com
│   ├── habits/               # habits.ainexspace.com
│   ├── pulse/              # pulse.ainexspace.com
│   ├── fit/                # fit.ainexspace.com
│   └── workflow/           # workflow.ainexspace.com
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

# Set up development environment (creates .env.local files for all apps)
./scripts/setup-dev-env.sh

# Build all packages
pnpm build

# Run all apps in dev mode
pnpm dev
```

### Development Scripts

```bash
# Run specific app
pnpm dev:notes
pnpm dev:journey

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
✅ Phase 3: App Standardization (Layouts, Fonts, Themes) - **COMPLETE**
⏳ Phase 4: App Feature Implementation (11 Apps) - **IN PROGRESS**

- Implemented: Main, Projects, Notes, Journey, Todo, Fit, Grow, Pulse, Moments, Track, Workflow
- Status: Shared `WorkspaceLayout` & Branding applied.
  📋 Phase 5: Cross-App Integration - **PENDING**
  📋 Phase 6: Production Deployment - **PENDING**

**Overall Progress: 50% Complete (3/6 phases done)**

## Documentation

- [GEMINI Report](./GEMINI.md) - Latest standardization report
- [Design System](./docs/ui-ux/DESIGN_SYSTEM.md) - NoteNex design system
- [Architecture](./docs/architecture/project-structure.md) - Project structure and layout
- [Custom Skills](./.claude/skills/) - Expert guidance documents

## License

Private - AINex LLC

---

**Status**: Phase 4 In Progress - App Feature Implementation
