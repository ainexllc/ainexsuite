# AINexSuite - Vercel Deployment Plan

## Overview

This plan will deploy all 9 apps to Vercel as separate projects, giving each app its own domain.

## What's Been Set Up

✅ **9 `vercel.json` files created** - one in each app directory:
- `apps/main/vercel.json`
- `apps/notes/vercel.json`
- `apps/journey/vercel.json`
- `apps/todo/vercel.json`
- `apps/track/vercel.json`
- `apps/moments/vercel.json`
- `apps/grow/vercel.json`
- `apps/pulse/vercel.json`
- `apps/fit/vercel.json`

Each configuration tells Vercel how to build that specific app from the monorepo.

---

## Deployment Strategy

### Step 1: Deploy Each App Individually

Navigate to each app directory and deploy:

```bash
# Deploy Main app
cd apps/main
vercel --prod
cd ../..

# Deploy Notes app
cd apps/notes
vercel --prod
cd ../..

# Deploy Journey app
cd apps/journey
vercel --prod
cd ../..

# Deploy Todo app
cd apps/todo
vercel --prod
cd ../..

# Deploy Track app
cd apps/track
vercel --prod
cd ../..

# Deploy Moments app
cd apps/moments
vercel --prod
cd ../..

# Deploy Grow app
cd apps/grow
vercel --prod
cd ../..

# Deploy Pulse app
cd apps/pulse
vercel --prod
cd ../..

# Deploy Fit app
cd apps/fit
vercel --prod
cd ../..
```

### Step 2: Automated Deployment Script

Or use this one-liner to deploy all apps at once:

```bash
for app in main notes journey todo track moments grow pulse fit; do
  echo "🚀 Deploying $app..."
  cd apps/$app && vercel --prod && cd ../..
done
```

---

## Expected Results

After deployment, you'll have 9 separate Vercel projects:

| App | Project Name | Default Domain | Custom Domain (later) |
|-----|--------------|----------------|----------------------|
| Main | ainexsuite-main | `ainexsuite-main-*.vercel.app` | `www.ainexsuite.com` |
| Notes | ainexsuite-notes | `ainexsuite-notes-*.vercel.app` | `notes.ainexsuite.com` |
| Journey | ainexsuite-journey | `ainexsuite-journey-*.vercel.app` | `journey.ainexsuite.com` |
| Todo | ainexsuite-todo | `ainexsuite-todo-*.vercel.app` | `todo.ainexsuite.com` |
| Track | ainexsuite-track | `ainexsuite-track-*.vercel.app` | `track.ainexsuite.com` |
| Moments | ainexsuite-moments | `ainexsuite-moments-*.vercel.app` | `moments.ainexsuite.com` |
| Grow | ainexsuite-grow | `ainexsuite-grow-*.vercel.app` | `grow.ainexsuite.com` |
| Pulse | ainexsuite-pulse | `ainexsuite-pulse-*.vercel.app` | `pulse.ainexsuite.com` |
| Fit | ainexsuite-fit | `ainexsuite-fit-*.vercel.app` | `fit.ainexsuite.com` |

---

## Environment Variables

Before deploying, you'll need to add environment variables to each Vercel project:

### Required Variables (All Apps)

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# AI Integration (for apps with AI features)
GROK_API_KEY=your-grok-api-key
```

### How to Add Environment Variables

**Option 1: Via Vercel Dashboard**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select the project
3. Go to Settings → Environment Variables
4. Add each variable

**Option 2: Via CLI**
```bash
cd apps/main
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
# ... repeat for all variables
```

---

## Post-Deployment Steps

### 1. Verify Deployments
Check all projects are live:
```bash
vercel project ls
```

### 2. Connect Custom Domains

For each app, add custom domains in Vercel dashboard:

**Main App:**
- `www.ainexsuite.com`
- `ainexsuite.com` (redirect to www)

**Other Apps:**
- `notes.ainexsuite.com`
- `journey.ainexsuite.com`
- `todo.ainexsuite.com`
- `track.ainexsuite.com`
- `moments.ainexsuite.com`
- `grow.ainexsuite.com`
- `pulse.ainexsuite.com`
- `fit.ainexsuite.com`

### 3. Configure DNS

Add DNS records for each subdomain:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: CNAME
Name: notes
Value: cname.vercel-dns.com

Type: CNAME
Name: journey
Value: cname.vercel-dns.com

# ... repeat for all subdomains
```

### 4. Connect to GitHub (Optional but Recommended)

For automatic deployments on every push:

1. Go to each Vercel project
2. Settings → Git
3. Connect to `ainexllc/ainexsuite` repository
4. Set Root Directory to the app's directory (e.g., `apps/notes`)
5. Vercel will auto-deploy on every push to main

---

## Monitoring & Management

### View All Projects
```bash
vercel project ls
```

### View Deployments for a Specific App
```bash
cd apps/notes
vercel ls --yes
```

### Rollback a Deployment
```bash
cd apps/notes
vercel rollback <deployment-url>
```

### Delete a Project
```bash
vercel remove <project-name>
```

---

## Troubleshooting

### Build Fails
1. Check the build logs in Vercel dashboard
2. Test locally: `cd apps/[app] && pnpm build`
3. Verify all dependencies are installed

### Environment Variables Not Working
1. Make sure variables start with `NEXT_PUBLIC_` for client-side access
2. Redeploy after adding environment variables
3. Check variable names match exactly

### Monorepo Build Issues
1. Verify `vercel.json` has correct filter: `--filter=@ainexsuite/[appname]`
2. Ensure workspace packages are transpiled in `next.config.js`
3. Check `pnpm-workspace.yaml` is correctly configured

---

## Quick Reference Commands

```bash
# Deploy single app to production
cd apps/main && vercel --prod

# Deploy single app to preview
cd apps/main && vercel

# Add environment variable
vercel env add VARIABLE_NAME

# Pull environment variables locally
vercel env pull

# List all deployments
vercel ls --yes

# Check project details
vercel inspect <deployment-url>
```

---

## Next Steps

1. ✅ Run deployment script or deploy apps one by one
2. ⏳ Add environment variables to each project
3. ⏳ Test all deployed apps
4. ⏳ Connect custom domains
5. ⏳ Set up GitHub auto-deployments
6. ⏳ Monitor first production traffic

---

**Questions?** Check [Vercel Documentation](https://vercel.com/docs) or [Turborepo Deployment Guide](https://turbo.build/repo/docs/handbook/deploying-with-docker)
