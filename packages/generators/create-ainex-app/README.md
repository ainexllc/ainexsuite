# @ainexsuite/create-ainex-app

App Generator Agent for AINexSuite - Scaffold new Next.js 15 apps in minutes.

## Overview

This tool automatically generates fully-configured Next.js 15 applications for the AINexSuite monorepo, complete with:

- ✅ SSO authentication (session cookies)
- ✅ NoteNex design system (dark/light mode)
- ✅ Firebase backend integration
- ✅ TypeScript and Tailwind CSS
- ✅ Shared UI components
- ✅ Optional Grok AI assistant

## Installation

From the monorepo root:

```bash
cd packages/generators/create-ainex-app
npm install
npm link
```

## Usage

### Basic App

```bash
create-ainex-app notes
```

Generates a basic app with SSO and design system.

### App with AI Assistant

```bash
create-ainex-app journal --type with-ai
```

Generates an app with floating AI chat panel powered by Grok 4.

### Dashboard App

```bash
create-ainex-app main --type dashboard
```

Generates the main dashboard showing all 8 apps.

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `<app-name>` | App name (lowercase, e.g., notes, journal) | Required |
| `--type <type>` | Template type: `base`, `with-ai`, `dashboard` | `base` |
| `--skip-install` | Skip npm install | `false` |

## Templates

### 1. Base Template

Basic Next.js 15 app with:
- AppShell layout (TopNav, NavigationPanel)
- SSO authentication
- Container layout (max 1280px)
- Dark/light theme syncing
- Firebase integration

**Generated structure:**
```
apps/<app-name>/
├── src/
│   └── app/
│       ├── layout.tsx    # Root layout with AppShell
│       ├── page.tsx      # Homepage
│       └── globals.css   # Imports shared styles
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── .env.example
└── README.md
```

### 2. With-AI Template

Everything in base template, plus:
- `@ainexsuite/ai` package
- Floating AI assistant button
- Chat panel with streaming responses
- Grok 4 integration

**Additional files:**
```
src/components/ai/
└── ai-assistant-panel.tsx
```

### 3. Dashboard Template

Everything in with-ai template, plus:
- App grid showing all 8 apps
- Links to subdomains
- Activity feed placeholder
- Wide container layout

## Generated App Features

Every generated app includes:

### Package Dependencies
```json
{
  "dependencies": {
    "next": "^15.5.4",
    "react": "^19.1.0",
    "@ainexsuite/ui": "workspace:*",
    "@ainexsuite/firebase": "workspace:*",
    "@ainexsuite/auth": "workspace:*",
    "@ainexsuite/types": "workspace:*"
  }
}
```

### Environment Variables
```env
# Firebase (pre-configured)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# App-specific
NEXT_PUBLIC_APP_NAME=<app-name>
NEXT_PUBLIC_DOMAIN=<app-name>.ainexspace.com
```

### Shared Packages

All apps use shared packages from the monorepo:

- `@ainexsuite/ui` - UI components (AppShell, Container, Button, etc.)
- `@ainexsuite/firebase` - Firebase SDK configuration
- `@ainexsuite/auth` - SSO authentication utilities
- `@ainexsuite/ai` - Grok AI integration (with-ai template only)
- `@ainexsuite/types` - TypeScript types
- `@ainexsuite/config` - ESLint, Tailwind, TypeScript configs

## Development Workflow

After generating an app:

```bash
# Navigate to app
cd apps/<app-name>

# Start development server
npm run dev
```

App will be available at http://localhost:3000

## Placeholders

The generator replaces these placeholders in template files:

| Placeholder | Example | Usage |
|-------------|---------|-------|
| `{{APP_NAME}}` | `notes` | App name (lowercase) |
| `{{APP_NAME_CAPITALIZED}}` | `Notes` | App name (capitalized) |
| `{{APP_TYPE}}` | `with-ai` | Template type used |
| `{{DOMAIN}}` | `notes.ainexspace.com` | Production domain |

## Adding New Templates

To create a new template:

1. Create directory in `templates/`
```bash
mkdir templates/my-template
```

2. Add template files with placeholders

3. Update CLI to support new template type

4. Document the template in this README

## Architecture

The generator follows this process:

1. **Validate** app name (lowercase letters only)
2. **Confirm** with user
3. **Copy** template files to `apps/<app-name>/`
4. **Replace** placeholders in all files
5. **Install** dependencies (unless `--skip-install`)
6. **Display** next steps

## Troubleshooting

### App already exists

Error: `❌ App "notes" already exists`

**Solution:** Choose a different name or delete existing app

### Invalid app name

Error: `❌ App name must be lowercase letters only`

**Solution:** Use only lowercase letters (e.g., notes, journal, todo)

### Missing shared packages

Error: `Cannot find module '@ainexsuite/ui'`

**Solution:** Build shared packages first:
```bash
# From monorepo root
pnpm install
pnpm build
```

## Contributing

When modifying templates:

1. Update all 3 templates (base, with-ai, dashboard)
2. Test generation of each template
3. Verify placeholders are replaced correctly
4. Update this README

## License

MIT

---

**Created by**: AINex LLC
**Part of**: AINexSuite Productivity Suite
**Learn more**: See [finalplan.md](../../../finalplan.md)
