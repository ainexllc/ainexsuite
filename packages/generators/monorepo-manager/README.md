# @ainexsuite/monorepo-manager

Monorepo Manager Agent - Automate deployment, updates, and consistency checks across all AINexSuite apps.

## Overview

Manage 9 Next.js apps and 6 shared packages with ease. This tool automates:

- ✅ Deploying all apps to Vercel
- ✅ Updating shared packages across apps
- ✅ Running tests for affected apps
- ✅ Auditing design system consistency
- ✅ Managing environment variables

## Installation

From the monorepo root:

```bash
cd packages/generators/monorepo-manager
npm install
npm link
```

## Commands

### Deploy All Apps

Deploy all 9 apps to Vercel at once:

```bash
# Preview deployments
monorepo-manager deploy:all

# Production deployments
monorepo-manager deploy:all --production
```

**What it does:**
- Deploys main, notes, journal, todo, track, moments, grow, pulse, fit
- Runs in sequence to avoid conflicts
- Skips apps that don't exist yet
- Shows progress for each app

**Time saved:** 45-60 minutes (vs deploying manually)

### Deploy Specific App

Deploy a single app:

```bash
# Preview
monorepo-manager deploy notes

# Production
monorepo-manager deploy notes --production
```

### Update Shared Packages

Update all apps to use the latest shared packages:

```bash
monorepo-manager update:shared
```

**What it does:**
1. Builds all shared packages (`@ainexsuite/ui`, `@ainexsuite/firebase`, etc.)
2. Updates dependencies in all apps
3. Runs `pnpm install` to link workspace packages

**When to use:**
- After updating a shared component
- After modifying design tokens
- After changing Firebase config
- Before deploying all apps

### Test Affected Apps

Run tests only for apps affected by recent changes:

```bash
monorepo-manager test:affected
```

**What it does:**
- Analyzes git diff to find changed files
- Identifies affected apps
- Runs tests only for those apps
- If shared package changed, tests all apps

**Smart detection:**
- `apps/notes/...` → Tests only notes app
- `packages/ui/...` → Tests all apps
- `packages/firebase/...` → Tests all apps

### Audit Design System

Check for design system compliance:

```bash
monorepo-manager audit:design-system
```

**Checks for:**
- Missing `@ainexsuite/ui` package
- Hard-coded colors (should use design tokens)
- Inconsistent styling patterns
- Missing imports from shared UI

**Example output:**
```
🎨 Auditing design system consistency...

⚠️  Found design system issues:

  - notes: Using hard-coded colors instead of design tokens
  - journal: Missing @ainexsuite/ui package
```

### List All Apps

Show all apps in the monorepo:

```bash
monorepo-manager list
```

**Output:**
```
📋 AINexSuite Apps:

  • main
    Main dashboard showing all apps
    Domain: www.ainexsuite.com

  • notes
    Note-taking with AI assistance
    Domain: notes.ainexsuite.com

  • journal
    Daily reflections and mood tracking
    Domain: journal.ainexsuite.com

  ...
```

## Deployment Workflow

### Initial Deployment

First time deploying all apps:

```bash
# 1. Build shared packages
pnpm build

# 2. Update all apps
monorepo-manager update:shared

# 3. Deploy all to preview
monorepo-manager deploy:all

# 4. Test on preview URLs
# Visit each app: https://<app>-<hash>.vercel.app

# 5. Deploy to production
monorepo-manager deploy:all --production
```

### Regular Updates

After making changes:

```bash
# 1. Test locally
npm run dev

# 2. Test affected apps
monorepo-manager test:affected

# 3. Deploy changed app
monorepo-manager deploy notes --production
```

### Major Changes to Shared Packages

When updating design system, Firebase config, or shared components:

```bash
# 1. Make changes to shared packages

# 2. Update all apps
monorepo-manager update:shared

# 3. Test all apps
pnpm test

# 4. Deploy all apps
monorepo-manager deploy:all --production
```

## Environment Variables Management

### Set Variables for All Apps

Create a script to set environment variables across all Vercel projects:

```bash
# Create scripts/set-env.sh
#!/bin/bash

APPS=("main" "notes" "journal" "todo" "track" "moments" "grow" "pulse" "fit")

for app in "${APPS[@]}"; do
  echo "Setting variables for $app..."
  cd apps/$app
  vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
  # ... other variables
  cd ../..
done
```

### Pull Variables Locally

```bash
# For each app
cd apps/notes
vercel env pull .env.vercel
```

## Continuous Integration

Integrate with GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy All Apps

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm build
      - run: npx monorepo-manager deploy:all --production
```

## Advanced Usage

### Custom Deployment Order

Deploy specific apps in order:

```bash
# Deploy backend first, then frontend
monorepo-manager deploy main --production
sleep 10
monorepo-manager deploy notes --production
monorepo-manager deploy journal --production
```

### Parallel Deployments

Deploy multiple apps in parallel (use with caution):

```bash
monorepo-manager deploy notes &
monorepo-manager deploy journal &
monorepo-manager deploy todo &
wait
```

### Rollback Strategy

Rollback a failed deployment:

```bash
# Via Vercel CLI
cd apps/notes
vercel rollback <deployment-url>

# Or redeploy previous working version
git checkout <previous-commit>
monorepo-manager deploy notes --production
```

## Architecture

The Monorepo Manager coordinates:

1. **9 Next.js Apps**
   - Each deployed to separate Vercel project
   - Each has custom domain (e.g., notes.ainexsuite.com)

2. **6 Shared Packages**
   - Workspace packages linked with `pnpm`
   - Built before deployment
   - Versioned together

3. **Vercel Projects**
   - 9 separate projects (one per app)
   - Shared environment variables
   - Auto-deployments from GitHub

## Troubleshooting

### Deployment fails for one app

**Solution:** Deploy apps individually to identify issue:
```bash
monorepo-manager deploy notes
# Check error logs
```

### Shared package not updating

**Solution:** Force rebuild:
```bash
cd packages/ui
rm -rf dist
npm run build
monorepo-manager update:shared
```

### Environment variables not syncing

**Solution:** Pull and verify:
```bash
cd apps/<app>
vercel env pull
cat .env.vercel
```

### Design audit showing false positives

**Solution:** Update audit logic in `cli.js` or add exceptions

## Performance Metrics

**Deployment times** (measured on standard connection):
- Single app: 2-3 minutes
- All apps (sequential): 18-27 minutes
- All apps (parallel, risky): 8-12 minutes

**Build times:**
- Shared packages: 1-2 minutes
- Single Next.js app: 30-60 seconds
- Full monorepo: 5-8 minutes

## Best Practices

1. **Always update shared packages before deploying all apps**
   ```bash
   monorepo-manager update:shared
   monorepo-manager deploy:all --production
   ```

2. **Test affected apps before production deployment**
   ```bash
   monorepo-manager test:affected
   ```

3. **Deploy to preview first, then production**
   ```bash
   monorepo-manager deploy:all         # Preview
   # Test on preview URLs
   monorepo-manager deploy:all --production
   ```

4. **Run design audit regularly**
   ```bash
   monorepo-manager audit:design-system
   ```

5. **Keep deployment logs**
   ```bash
   monorepo-manager deploy:all --production > deployment-$(date +%Y%m%d).log
   ```

## Contributing

When extending the manager:

1. Add new commands to `cli.js`
2. Use `ora` for loading indicators
3. Use `chalk` for colored output
4. Handle errors gracefully
5. Update this README

## License

MIT

---

**Created by**: AINex LLC
**Part of**: AINexSuite Productivity Suite
**Automates**: 9 apps, 6 shared packages, unlimited deployments
