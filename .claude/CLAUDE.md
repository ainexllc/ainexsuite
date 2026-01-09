# AinexSuite

**Turborepo monorepo** | Next.js 15 + React 19 + TypeScript | Firebase/Firestore | Vercel auto-deploy

## Apps

| App      | Port | Color   | Purpose               | Vercel Domain           |
| -------- | ---- | ------- | --------------------- | ----------------------- |
| main     | 3000 | #f97316 | Central dashboard     | ainexspace.com          |
| notes    | 3001 | #eab308 | Colorful notes        | ainexnotes.com          |
| journal  | 3002 | #f97316 | Mood/reflections      | journal.ainexspace.com  |
| todo     | 3003 | #8b5cf6 | Task management       | ainextask.com           |
| health   | 3004 | #10b981 | Body metrics          | health.ainexspace.com   |
| album    | 3005 | #ec4899 | Memory curation       | album.ainexspace.com    |
| habits   | 3006 | #14b8a6 | Personal development  | grow.ainexsuite.com     |
| mosaic   | 3007 | #ef4444 | Dashboard display     | display.ainexspace.com  |
| fit      | 3008 | #3b82f6 | Workout tracking      | fit.ainexspace.com      |
| projects | 3009 | #6366f1 | Project management    | ainexproject.com        |
| flow     | 3010 | #06b6d4 | Visual automation     | ainexworkflow.com       |
| subs     | 3011 | #10b981 | Subscription tracking | subs.ainexspace.com     |
| docs     | 3012 | #3b82f6 | Rich documents        | docs.ainexspace.com     |
| tables   | 3013 | #10b981 | Spreadsheets          | tables.ainexspace.com   |
| calendar | 3014 | #06b6d4 | Scheduling            | calendar.ainexspace.com |
| admin    | 3020 | —       | Admin dashboard       | admin.ainexspace.com    |

## Packages

- **ui** - Shared components (TopNav, AppShell, NavigationPanel, Modal, SpaceSwitcher, etc.)
- **types** - TypeScript definitions
- **theme** - CSS variables, useTheme(), dark/light mode
- **firebase** - Firestore, Auth, Stripe
- **auth** - SSO, session cookies
- **ai** - Gemini, GPT-4, Claude, Grok
- **config** - Tailwind preset, ESLint, TypeScript configs
- **generators** - create-ainex-app, add-grok-ai

---

## Commands

### Development

```bash
pnpm dev                              # All apps (via PM2)
pnpm --filter @ainexsuite/main dev    # Single app
pnpm build                            # REQUIRED before pushing to main
pnpm lint
pnpm format                           # Prettier format all files
```

### PM2 Process Management

```bash
pnpm pm2:start      # Start all apps via PM2
pnpm pm2:stop       # Stop all apps
pnpm pm2:restart    # Restart all apps
pnpm pm2:delete     # Delete all processes
pnpm pm2:logs       # View logs
pnpm pm2:status     # Check status
pnpm pm2:monit      # Monitor dashboard
```

### Build & Deploy

```bash
pnpm build                            # Build all
pnpm build:apps                       # Build only apps
pnpm build:packages                   # Build only packages
pnpm deploy:all                       # Deploy all apps to Vercel
```

---

## MCP Servers (Available)

### Firebase MCP

- **Purpose**: Firestore queries, Auth management, Storage operations, Security Rules
- **Config**: `.claude/settings.json`
- **Usage**: Query Firestore collections, manage users, deploy rules

### Resend MCP

- **Purpose**: Send transactional emails
- **API Key**: `re_WMzujV5Y_Kt2LQSsnfcrVLk27v2vrsfCt`
- **Sender**: `noreply@ainexspace.com`
- **Reply-to**: `support@ainexspace.com`
- **Location**: `.mcp-servers/resend-mcp/`

### Namecheap MCP

- **Purpose**: DNS record management
- **API User**: `dinohorn`
- **API Key**: `5579f9d5abca4fe18fa708f9f222d7e0`
- **Client IP**: `136.33.77.24`
- **Location**: `.mcp-servers/namecheap-mcp/`

---

## Claude Plugins (Enabled)

| Plugin            | Purpose                              |
| ----------------- | ------------------------------------ |
| context7          | Documentation lookup for any library |
| frontend-design   | High-quality UI component generation |
| github            | GitHub PR/issue management           |
| commit-commands   | Git commit workflows                 |
| security-guidance | Security best practices              |
| vercel            | Deployment management                |
| firebase          | Firebase operations                  |
| stripe            | Payment integration                  |

---

## API Keys & Services

### Firebase

- **Project**: `ainexsuite`
- **Auth Domain**: `ainexsuite.firebaseapp.com`
- **Storage Bucket**: `ainexsuite.appspot.com`
- **Admin credentials**: Set in each app's `.env.local` and Vercel env vars

### Vercel

- **Team**: `ainex-projects`
- **CLI**: Authenticated as `ainex`
- **Token Location**: `~/Library/Application Support/com.vercel.cli/auth.json`

### Stripe

- **Test keys**: `pk_test_*` / `sk_test_*` (in Vercel env vars)
- **Live keys**: `pk_live_*` / `sk_live_*` (in Vercel env vars)
- **Webhooks**: `/api/webhooks/stripe` endpoint in each app

### Resend

- **API Key**: `re_WMzujV5Y_Kt2LQSsnfcrVLk27v2vrsfCt`
- **Domain**: `ainexspace.com` (verified)

### Namecheap

- **API Key**: `5579f9d5abca4fe18fa708f9f222d7e0`
- **API User**: `dinohorn`

### AI Services

- **Grok**: `GROK_API_KEY` in `.env.local`
- **FAL (Image Gen)**: `FAL_KEY` in `.env.local`
- **OpenRouter**: For multi-model access

---

## CLI Tools Available

| Tool       | Purpose                        | Auth Status                 |
| ---------- | ------------------------------ | --------------------------- |
| `vercel`   | Deployments, env vars, domains | Authenticated               |
| `firebase` | Firebase CLI operations        | Authenticated               |
| `stripe`   | Payment testing, webhooks      | Install with `stripe login` |
| `gh`       | GitHub CLI                     | Authenticated               |
| `pm2`      | Process management             | Ready                       |
| `pnpm`     | Package manager                | Ready                       |
| `turbo`    | Monorepo build orchestration   | Ready                       |

---

## Useful Vercel Commands

```bash
# List deployments
vercel ls <project-name>

# Check project settings
vercel project inspect <project-name>

# Update project settings via API
curl -X PATCH "https://api.vercel.com/v9/projects/<project-id>" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"rootDirectory": "apps/<app>", "buildCommand": "..."}'

# Trigger deployment via API
curl -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "<project>", "project": "<project-id>", "target": "production", "gitSource": {"type": "github", "repoId": "1083404142", "ref": "main"}}'

# View logs
vercel logs <deployment-url>

# Pull env vars
vercel env pull .env.local
```

---

## Vercel Projects

| Project Name        | Root Directory | Package Filter       |
| ------------------- | -------------- | -------------------- |
| ainexsuite-main     | apps/main      | @ainexsuite/main     |
| ainexsuite-notes    | apps/notes     | @ainexsuite/notes    |
| ainexsuite-journal  | apps/journal   | @ainexsuite/journal  |
| ainexsuite-todo     | apps/todo      | @ainexsuite/todo     |
| ainexsuite-health   | apps/health    | @ainexsuite/health   |
| ainexsuite-album    | apps/album     | @ainexsuite/album    |
| ainexsuite-habits   | apps/habits    | @ainexsuite/habits   |
| ainexsuite-display  | apps/mosaic    | @ainexsuite/mosaic   |
| ainexsuite-workflow | apps/flow      | @ainexsuite/flow     |
| ainexsuite-fit      | apps/fit       | @ainexsuite/fit      |
| ainexsuite-projects | apps/projects  | @ainexsuite/projects |
| ainexsuite-subs     | apps/subs      | @ainexsuite/subs     |
| ainexsuite-calendar | apps/calendar  | @ainexsuite/calendar |
| ainexsuite-admin    | apps/admin     | @ainexsuite/admin    |

---

## Custom Skills (Invoke with /skill-name)

| Skill          | Purpose                                     |
| -------------- | ------------------------------------------- |
| `/vercel`      | Deploy apps, manage env vars, domains, logs |
| `/firebase`    | Firestore queries, Auth, Storage, Rules     |
| `/stripe`      | Payments, subscriptions, webhooks           |
| `/namecheap`   | DNS record management                       |
| `/resend`      | Send transactional emails                   |
| `/restart-all` | Kill ports 3000-3020 and restart all apps   |
| `/build-check` | Run lint, type-check, build before push     |
| `/commit`      | Create git commit with proper format        |

---

## Vercel Token (for API calls)

Location: `~/Library/Application Support/com.vercel.cli/auth.json`

Use for direct API calls when CLI doesn't support an operation (e.g., updating project root directory).

---

## Common Patterns

### App vercel.json structure

```json
{
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@ainexsuite/<app> --force",
  "installCommand": "cd ../.. && rm -rf node_modules .pnpm-store && pnpm install --force",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "ignoreCommand": "cd ../.. && git diff --quiet HEAD^ HEAD -- ./apps/<app> ./packages ./package.json ./pnpm-lock.yaml ./turbo.json ./.npmrc"
}
```

### Environment Variables per App

Each app needs in Vercel:

- `NEXT_PUBLIC_FIREBASE_*` - Firebase client config
- `FIREBASE_ADMIN_*` - Firebase Admin SDK
- `RESEND_API_KEY` - Email sending
- `STRIPE_*` - Payment processing (if applicable)

---

## Rules

1. **Build before push** - `pnpm build` must pass before pushing to main
2. **Multi-app changes** - Apply consistently across all affected apps
3. **Shared components** - Edit in `packages/ui`, not per-app
4. **Types** - Define in `packages/types`
5. **No force push/rebase** without explicit request
6. **Use MCP servers** - Firebase, Resend, Namecheap MCPs are available
7. **Check Vercel first** - Use `vercel ls` to see deployment status before debugging
