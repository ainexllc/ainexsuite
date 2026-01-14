# AinexSuite

**Turborepo monorepo** | Next.js 15 + React 19 + TypeScript | Firebase/Firestore | Vercel auto-deploy

## Apps

| App      | Port | Color   | Purpose               | Domain                  |
| -------- | ---- | ------- | --------------------- | ----------------------- |
| main     | 3000 | #f97316 | Central dashboard     | ainexspace.com          |
| notes    | 3001 | #eab308 | Colorful notes        | notes.ainexspace.com    |
| journal  | 3002 | #f97316 | Mood/reflections      | journal.ainexspace.com  |
| todo     | 3003 | #8b5cf6 | Task management       | todo.ainexspace.com     |
| health   | 3004 | #10b981 | Body metrics          | health.ainexspace.com   |
| album    | 3005 | #ec4899 | Memory curation       | album.ainexspace.com    |
| habits   | 3006 | #14b8a6 | Personal development  | habits.ainexspace.com   |
| mosaic   | 3007 | #ef4444 | Dashboard display     | mosaic.ainexspace.com   |
| fit      | 3008 | #3b82f6 | Workout tracking      | fit.ainexspace.com      |
| projects | 3009 | #6366f1 | Project management    | projects.ainexspace.com |
| flow     | 3010 | #06b6d4 | Visual automation     | flow.ainexspace.com     |
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
pnpm dev                              # Start all apps
pnpm --filter @ainexsuite/main dev    # Single app
pnpm build                            # REQUIRED before pushing to main
pnpm lint
pnpm format                           # Prettier format all files
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

### Vercel MCP

- **Purpose**: Deployment management, env vars, build logs
- **Auth**: Uses Vercel CLI token from `~/Library/Application Support/com.vercel.cli/auth.json`
- **Location**: `.mcp-servers/vercel-mcp/`
- **Tools**:
  - `vercel_list_deployments` - List deployments for a project
  - `vercel_get_deployment` - Get deployment details
  - `vercel_list_env_vars` - List env var names (values hidden)
  - `vercel_add_env_var` - Add environment variable
  - `vercel_delete_env_var` - Delete environment variable
  - `vercel_get_build_logs` - Get build logs
  - `vercel_rollback` - Rollback to previous deployment
  - `vercel_trigger_deployment` - Trigger new deployment
  - `vercel_cancel_deployment` - Cancel building deployment
  - `vercel_get_project` - Get project details
  - `vercel_list_projects` - List all projects

### GitHub MCP

- **Purpose**: Pull requests, issues, releases, workflows, branch protection
- **Auth**: Uses `gh` CLI token (already authenticated)
- **Location**: `.mcp-servers/github-mcp/`
- **Repo**: `dinohorn/ainexsuite`
- **Tools**:
  - `github_list_prs` - List pull requests with filters
  - `github_get_pr` - Get PR details including checks and reviews
  - `github_create_pr` - Create a pull request
  - `github_merge_pr` - Merge a PR (merge/squash/rebase)
  - `github_list_issues` - List issues with filters
  - `github_create_issue` - Create an issue
  - `github_close_issue` - Close an issue
  - `github_list_releases` - List releases
  - `github_create_release` - Create a release with tag
  - `github_get_workflow_runs` - Get GitHub Actions runs
  - `github_get_branch_protection` - Get branch protection rules

### Stripe MCP

- **Purpose**: Test payment operations, customers, subscriptions
- **Auth**: Stripe test key (`sk_test_*`) - TEST MODE ONLY
- **Location**: `.mcp-servers/stripe-mcp/`
- **Safety**: Refuses to start with live keys
- **Tools**:
  - `stripe_list_customers` - List customers with filters
  - `stripe_get_customer` - Get customer details
  - `stripe_create_test_customer` - Create test customer
  - `stripe_list_subscriptions` - List subscriptions
  - `stripe_get_subscription` - Get subscription details
  - `stripe_cancel_subscription` - Cancel a subscription
  - `stripe_list_products` - List products with prices
  - `stripe_list_invoices` - List invoices
  - `stripe_simulate_webhook` - Generate test webhook payloads
  - `stripe_get_balance` - Get account balance

---

## Claude Plugins (Enabled)

| Plugin            | Purpose                              |
| ----------------- | ------------------------------------ |
| context7          | Documentation lookup for any library |
| frontend-design   | High-quality UI component generation |
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

| Tool       | Purpose                        | Auth Status   |
| ---------- | ------------------------------ | ------------- |
| `vercel`   | Deployments, env vars, domains | Authenticated |
| `firebase` | Firebase CLI operations        | Authenticated |
| `stripe`   | Payment testing, webhooks      | Authenticated |
| `gh`       | GitHub CLI (PRs, issues, etc.) | Authenticated |
| `pnpm`     | Package manager                | Ready         |
| `turbo`    | Monorepo build orchestration   | Ready         |

### GitHub CLI (`gh`) - Use for all GitHub operations

```bash
# Pull Requests
gh pr create --title "Title" --body "Description"
gh pr list
gh pr view <number>
gh pr merge <number>
gh pr checkout <number>

# Issues
gh issue create --title "Title" --body "Description"
gh issue list
gh issue view <number>
gh issue close <number>

# Repo info
gh repo view
gh api repos/{owner}/{repo}/pulls/{number}/comments
```

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
| ainexsuite-mosaic   | apps/mosaic    | @ainexsuite/mosaic   |
| ainexsuite-flow     | apps/flow      | @ainexsuite/flow     |
| ainexsuite-fit      | apps/fit       | @ainexsuite/fit      |
| ainexsuite-projects | apps/projects  | @ainexsuite/projects |
| ainexsuite-subs     | apps/subs      | @ainexsuite/subs     |
| ainexsuite-docs     | apps/docs      | @ainexsuite/docs     |
| ainexsuite-tables   | apps/tables    | @ainexsuite/tables   |
| ainexsuite-calendar | apps/calendar  | @ainexsuite/calendar |
| ainexsuite-admin    | apps/admin     | @ainexsuite/admin    |

---

## Custom Skills (Invoke with /skill-name)

### Service Integration

| Skill             | Purpose                                     |
| ----------------- | ------------------------------------------- |
| `/vercel`         | Deploy apps, manage env vars, domains, logs |
| `/firebase`       | Firestore queries, Auth, Storage, Rules     |
| `/firebase-rules` | Validate and deploy Firestore/Storage rules |
| `/stripe`         | Payments, subscriptions, webhooks           |
| `/namecheap`      | DNS record management                       |
| `/resend`         | Send transactional emails                   |

### App & Server Management

| Skill          | Purpose                                          |
| -------------- | ------------------------------------------------ |
| `/create-app`  | Scaffold a new app with full configuration       |
| `/start-all`   | Start all dev servers                            |
| `/run-apps`    | Start specific apps (e.g., /run-apps main notes) |
| `/restart-all` | Kill all dev ports and restart all apps          |
| `/ports`       | Show which apps are running on which ports       |
| `/logs`        | Tail logs for specific app                       |
| `/open`        | Open app in browser (localhost or production)    |

### Build & Deploy

| Skill           | Purpose                                      |
| --------------- | -------------------------------------------- |
| `/build-check`  | Run lint, type-check, build before push      |
| `/bundle-check` | Analyze bundle sizes, detect regressions     |
| `/commit`       | Create git commit with proper format         |
| `/push-all`     | Lint, commit, push and monitor Vercel builds |
| `/push-app`     | Lint, commit, push and monitor single app    |

### Cross-App Management

| Skill            | Purpose                                   |
| ---------------- | ----------------------------------------- |
| `/sync-versions` | Bump versions across all or selected apps |
| `/env-sync`      | Sync env vars between Vercel and local    |
| `/deps`          | Show dependency tree for an app           |

### Firebase & Data

| Skill           | Purpose                                     |
| --------------- | ------------------------------------------- |
| `/rules-audit`  | Audit security rules for vulnerabilities    |
| `/migrate-data` | Run Firestore migrations with safety checks |
| `/type-gen`     | Generate TypeScript types from Firestore    |

### Development Guides

| Skill           | Purpose                                     |
| --------------- | ------------------------------------------- |
| `/ai-chatbot`   | AI chatbot development (prompts, streaming) |
| `/health-check` | Monorepo health dashboard (builds, deploys) |

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
8. **GitHub operations** - Use `gh` CLI or GitHub MCP server for PRs, issues, and repo operations
