# Vercel Multi-App Deployment Setup Guide

## Overview
This guide walks through deploying 4 separate Next.js apps from the ainexsuite monorepo to individual Vercel projects, each with dual-domain configuration (subdomain + standalone domain).

---

## Phase 1: Create Vercel Projects

### 1. Main Dashboard App

**Project Name**: `ainexsuite-main`

1. Go to https://vercel.com/new
2. Select repository: `ainexllc/ainexsuite`
3. Configure project:
   - **Project Name**: `ainexsuite-main`
   - **Framework**: Next.js
   - **Root Directory**: `apps/main`
   - **Build Command**: `cd ../.. && pnpm install && pnpm turbo run build --filter=@ainexsuite/main`
   - **Install Command**: `cd ../.. && pnpm install`
   - **Output Directory**: `.next`
   - **Node Version**: `22.x`
4. **Ignore Build Step**: `cd ../.. && git diff --quiet HEAD^ HEAD -- ./apps/main ./packages ./package.json ./pnpm-lock.yaml ./turbo.json`
5. Add Environment Variables (see Environment Variables section)
6. Click **Deploy**

### 2. Notes App

**Project Name**: `ainexsuite-notes`

1. Go to https://vercel.com/new
2. Select repository: `ainexllc/ainexsuite`
3. Configure project:
   - **Project Name**: `ainexsuite-notes`
   - **Framework**: Next.js
   - **Root Directory**: `apps/notes`
   - **Build Command**: `cd ../.. && pnpm install && pnpm turbo run build --filter=@ainexsuite/notes`
   - **Install Command**: `cd ../.. && pnpm install`
   - **Output Directory**: `.next`
   - **Node Version**: `22.x`
4. **Ignore Build Step**: `cd ../.. && git diff --quiet HEAD^ HEAD -- ./apps/notes ./packages ./package.json ./pnpm-lock.yaml ./turbo.json`
5. Add Environment Variables (see Environment Variables section)
6. Click **Deploy**

### 3. Journey App

**Project Name**: `ainexsuite-journey`

1. Go to https://vercel.com/new
2. Select repository: `ainexllc/ainexsuite`
3. Configure project:
   - **Project Name**: `ainexsuite-journey`
   - **Framework**: Next.js
   - **Root Directory**: `apps/journey`
   - **Build Command**: `cd ../.. && pnpm install && pnpm turbo run build --filter=@ainexsuite/journey`
   - **Install Command**: `cd ../.. && pnpm install`
   - **Output Directory**: `.next`
   - **Node Version**: `22.x`
4. **Ignore Build Step**: `cd ../.. && git diff --quiet HEAD^ HEAD -- ./apps/journey ./packages ./package.json ./pnpm-lock.yaml ./turbo.json`
5. Add Environment Variables (see Environment Variables section)
6. Click **Deploy**

### 4. Todo App

**Project Name**: `ainexsuite-todo`

1. Go to https://vercel.com/new
2. Select repository: `ainexllc/ainexsuite`
3. Configure project:
   - **Project Name**: `ainexsuite-todo`
   - **Framework**: Next.js
   - **Root Directory**: `apps/todo`
   - **Build Command**: `cd ../.. && pnpm install && pnpm turbo run build --filter=@ainexsuite/todo`
   - **Install Command**: `cd ../.. && pnpm install`
   - **Output Directory**: `.next`
   - **Node Version**: `22.x`
4. **Ignore Build Step**: `cd ../.. && git diff --quiet HEAD^ HEAD -- ./apps/todo ./packages ./package.json ./pnpm-lock.yaml ./turbo.json`
5. Add Environment Variables (see Environment Variables section)
6. Click **Deploy**

---

## Phase 2: Environment Variables

### Required Variables for All 4 Apps

Add these to **each** Vercel project (Settings → Environment Variables):

```bash
# App Identification
NEXT_PUBLIC_APP_NAME=main              # Change for each app: main, notes, journal, todo
NEXT_PUBLIC_MAIN_DOMAIN=www.ainexsuite.com

# Firebase Configuration (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=<from Firebase Console>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<from Firebase Console>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=alnexsuite
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<from Firebase Console>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<from Firebase Console>
NEXT_PUBLIC_FIREBASE_APP_ID=<from Firebase Console>

# Firebase Admin SDK (Server-side only)
FIREBASE_SERVICE_ACCOUNT_KEY=<JSON string from Firebase Admin SDK>
```

### App-Specific NEXT_PUBLIC_APP_NAME Values

| Project | NEXT_PUBLIC_APP_NAME |
|---------|---------------------|
| ainexsuite-main | `main` |
| ainexsuite-notes | `notes` |
| ainexsuite-journey | `journal` |
| ainexsuite-todo | `todo` |

---

## Phase 3: Domain Configuration

### Step 1: Configure DNS Records

#### For ainexsuite.com (Primary Domain)

In your DNS provider (e.g., Cloudflare, GoDaddy), add:

```
Type: A     | Name: @        | Value: 76.76.21.21              | TTL: Auto
Type: CNAME | Name: www      | Value: cname.vercel-dns.com     | TTL: Auto
Type: CNAME | Name: notes    | Value: cname.vercel-dns.com     | TTL: Auto
Type: CNAME | Name: journey  | Value: cname.vercel-dns.com     | TTL: Auto
Type: CNAME | Name: todo     | Value: cname.vercel-dns.com     | TTL: Auto
```

#### For Standalone Domains

For each standalone domain (ainexnotes.com, ainexjourney.com, ainextodo.com):

```
Type: A     | Name: @    | Value: 76.76.21.21              | TTL: Auto
Type: CNAME | Name: www  | Value: cname.vercel-dns.com     | TTL: Auto
```

### Step 2: Add Domains to Vercel Projects

#### ainexsuite-main
Go to Project Settings → Domains, add:
- `ainexsuite.com`
- `www.ainexsuite.com`

#### ainexsuite-notes
Go to Project Settings → Domains, add:
- `notes.ainexsuite.com`
- `ainexnotes.com`
- `www.ainexnotes.com`

#### ainexsuite-journey
Go to Project Settings → Domains, add:
- `journey.ainexsuite.com`
- `ainexjourney.com`
- `www.ainexjourney.com`

#### ainexsuite-todo
Go to Project Settings → Domains, add:
- `todo.ainexsuite.com`
- `ainextodo.com`
- `www.ainextodo.com`

### Step 3: Verify SSL Certificates

Vercel will automatically provision SSL certificates for all domains. Wait 1-5 minutes and verify:
- All domains show "Valid" status
- HTTPS redirects work correctly

---

## Phase 4: Enable GitHub Auto-Deploy

For **each** of the 4 Vercel projects:

1. Go to Project Settings → Git
2. Verify **Production Branch**: `main`
3. Enable: ✅ "Automatically create production deployment when a new commit is pushed to the production branch"
4. Enable: ✅ "Preview Deployments"

---

## Phase 5: Test Deployments

### Test Smart Deployment Logic

1. **Test App-Specific Changes**:
   ```bash
   # Make a change to notes app
   echo "// test" >> apps/notes/src/app/page.tsx
   git add apps/notes/src/app/page.tsx
   git commit -m "Test: Notes app change"
   git push origin main
   ```
   **Expected**: Only `ainexsuite-notes` deploys

2. **Test Shared Package Changes**:
   ```bash
   # Make a change to shared UI package
   echo "// test" >> packages/ui/src/index.ts
   git add packages/ui/src/index.ts
   git commit -m "Test: UI package change"
   git push origin main
   ```
   **Expected**: All 4 apps deploy

3. **Test Root Config Changes**:
   ```bash
   # Make a change to root package.json
   echo "  " >> package.json
   git add package.json
   git commit -m "Test: Root config change"
   git push origin main
   ```
   **Expected**: All 4 apps deploy

### Verify Cross-Domain Authentication

1. **Test Subdomain SSO**:
   - Navigate to `https://www.ainexsuite.com`
   - Log in with Google
   - Navigate to `https://notes.ainexsuite.com`
   - **Expected**: Still authenticated (same root domain)

2. **Test Standalone Domain**:
   - Navigate to `https://ainexnotes.com`
   - **Expected**: Redirected to login (different root domain)
   - Log in with Google
   - **Expected**: Stay authenticated on `ainexnotes.com`

3. **Test Cross-App Navigation**:
   - From `www.ainexsuite.com`, click link to Notes app
   - **Expected**: Opens `notes.ainexsuite.com` with authentication preserved

---

## Troubleshooting

### Build Fails with "No Next.js version detected"

**Solution**: Ensure Root Directory is set correctly:
- Should be: `apps/[app-name]`
- NOT: `apps` or empty

### App Deploys When It Shouldn't

**Solution**: Check ignoreCommand in `apps/[app-name]/vercel.json`:
```json
"ignoreCommand": "cd ../.. && git diff --quiet HEAD^ HEAD -- ./apps/[app-name] ./packages ./package.json ./pnpm-lock.yaml ./turbo.json"
```

### Authentication Not Working Across Subdomains

**Solution**: Verify Firebase session cookie domain is set to `.ainexsuite.com` in Cloud Functions

### DNS Not Resolving

**Solution**:
1. Wait 24-48 hours for DNS propagation
2. Verify CNAME records point to `cname.vercel-dns.com`
3. Check domain is added in Vercel project settings

### SSL Certificate Pending

**Solution**:
1. Wait 5-10 minutes for automatic provisioning
2. If still pending, remove and re-add domain in Vercel
3. Verify DNS records are correct

---

## Success Criteria Checklist

- [ ] All 4 Vercel projects created
- [ ] All projects have correct Root Directory set
- [ ] All projects have environment variables configured
- [ ] All projects have ignoreCommand configured
- [ ] DNS records added for all domains
- [ ] All domains added to Vercel projects
- [ ] SSL certificates issued for all domains
- [ ] GitHub auto-deploy enabled for all projects
- [ ] Test deployment verified for each app
- [ ] Cross-domain authentication tested
- [ ] Smart deployment logic tested

---

## Next Steps: Remaining 5 Apps

After validating the first 4 apps, repeat this process for:

1. **ainexsuite-track** → `track.ainexsuite.com` + `ainextrack.com`
2. **ainexsuite-moments** → `moments.ainexsuite.com` + `ainexmoments.com`
3. **ainexsuite-grow** → `grow.ainexsuite.com` + `ainexgrow.com`
4. **ainexsuite-pulse** → `pulse.ainexsuite.com` + `ainexpulse.com`
5. **ainexsuite-fit** → `fit.ainexsuite.com` + `ainexfit.com`

---

## Reference

- **Monorepo Root**: `/Users/dino/ainex/ainexsuite`
- **Apps Directory**: `/Users/dino/ainex/ainexsuite/apps/`
- **Shared Packages**: `/Users/dino/ainex/ainexsuite/packages/`
- **Vercel CLI**: `vercel --version` (46.0.2)
- **GitHub Repo**: `ainexllc/ainexsuite`
