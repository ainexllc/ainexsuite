---
name: deployment-orchestrator
description: Manage staging/production environments, rollbacks, and disaster recovery. Use when deploying, setting up environments, or recovering from incidents.
---

# Deployment Orchestration

## When to Use

- Deploying to production
- Setting up new environments
- Rolling back failed deployments
- Disaster recovery
- Environment configuration

## Quick Reference

### Vercel Deployment (AinexSuite)

```bash
# Deploy single app to production
cd apps/journal && vercel --prod

# Deploy all apps
pnpm deploy

# Deploy preview (PR preview)
vercel

# Check deployment status
vercel ls

# View deployment logs
vercel logs <deployment-url>
```

### Pre-Deployment Checklist

```bash
# 1. Run full build locally
pnpm build

# 2. Run linting
pnpm lint

# 3. Check for TypeScript errors
pnpm --filter @ainexsuite/types build
cd apps/journal && npx tsc --noEmit

# 4. Review environment variables
vercel env ls

# 5. Check git status
git status
git log --oneline -5
```

### Environment Configuration

```typescript
// Environment variable structure for AinexSuite
// .env.local (never commit)
NEXT_PUBLIC_FIREBASE_API_KEY = xxx;
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = xxx;
NEXT_PUBLIC_FIREBASE_PROJECT_ID = xxx;
FIREBASE_ADMIN_PRIVATE_KEY = xxx;
FIREBASE_ADMIN_CLIENT_EMAIL = xxx;

// Vercel environment setup
// Development, Preview, Production scopes
```

```bash
# Add environment variable to Vercel
vercel env add VARIABLE_NAME

# Pull env vars locally
vercel env pull .env.local

# List all env vars
vercel env ls
```

### Rollback Procedures

```bash
# 1. List recent deployments
vercel ls

# 2. Get deployment details
vercel inspect <deployment-url>

# 3. Promote previous deployment to production
vercel promote <previous-deployment-url>

# Alternative: Redeploy from specific commit
git checkout <commit-hash>
vercel --prod
```

### Deployment Scripts

```json
// package.json scripts
{
  "scripts": {
    "deploy": "vercel --prod",
    "deploy:preview": "vercel",
    "deploy:all": "turbo run deploy",
    "predeploy": "pnpm build && pnpm lint"
  }
}
```

### Vercel Project Configuration

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["sfo1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ],
  "rewrites": [{ "source": "/api/:path*", "destination": "/api/:path*" }]
}
```

### Firebase Deployment

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy all Firebase resources
firebase deploy

# Deploy specific functions
firebase deploy --only functions:functionName

# View function logs
firebase functions:log --only functionName
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
    uptime: process.uptime(),
  };

  // Check critical dependencies
  try {
    // Verify Firebase connection
    // await db.collection('_health').limit(1).get();
    health.database = "connected";
  } catch {
    health.database = "error";
    health.status = "degraded";
  }

  return NextResponse.json(health);
}
```

## Production Deployment Checklist

### Before Deploy

- [ ] All tests pass locally
- [ ] `pnpm build` succeeds
- [ ] `pnpm lint` passes
- [ ] Environment variables verified
- [ ] Database migrations applied (if any)
- [ ] Breaking changes documented

### During Deploy

- [ ] Monitor deployment logs
- [ ] Watch for build errors
- [ ] Note deployment URL

### After Deploy

- [ ] Verify health endpoint responds
- [ ] Test critical user flows
- [ ] Check error monitoring (no new errors)
- [ ] Verify analytics tracking
- [ ] Confirm environment variables loaded

### If Issues Occur

- [ ] Check Vercel deployment logs
- [ ] Review recent commits
- [ ] Rollback if critical
- [ ] Document incident

## Incident Response

### Severity Levels

| Level | Description                  | Response Time |
| ----- | ---------------------------- | ------------- |
| P1    | Site down, data loss         | Immediate     |
| P2    | Major feature broken         | < 1 hour      |
| P3    | Minor bug, workaround exists | < 4 hours     |
| P4    | Cosmetic, low impact         | Next sprint   |

### Response Steps

1. **Assess**: Determine severity and scope
2. **Communicate**: Update status page if needed
3. **Mitigate**: Rollback or hotfix
4. **Investigate**: Find root cause
5. **Document**: Write post-mortem

### Quick Rollback

```bash
# List last 5 deployments
vercel ls --limit 5

# Promote last known good deployment
vercel promote <deployment-url> --yes

# Verify rollback
curl https://your-app.vercel.app/api/health
```

## Environment Matrix

| App     | Dev Port | Production URL         | Status Page |
| ------- | -------- | ---------------------- | ----------- |
| main    | 3000     | ainexspace.com         | /api/health |
| journal | 3002     | journal.ainexspace.com | /api/health |
| notes   | 3001     | notes.ainexspace.com   | /api/health |
| todo    | 3003     | todo.ainexspace.com    | /api/health |
| ...     | ...      | ...                    | ...         |

## See Also

- [runbooks/deploy.md](runbooks/deploy.md) - Detailed deployment runbook
- [runbooks/rollback.md](runbooks/rollback.md) - Rollback procedures
- [runbooks/incident.md](runbooks/incident.md) - Incident response guide
