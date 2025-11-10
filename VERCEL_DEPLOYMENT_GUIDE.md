# 🚀 AinexSuite Multi-App Vercel Deployment Guide

## Overview

This guide walks you through deploying 4 independent Next.js apps from the ainexsuite monorepo to Vercel, each with subdomain + custom domain access.

**Deployment Architecture:**
- **4 Separate Vercel Projects** (main, notes, journey, todo)
- **2 Domains per App** (subdomain + custom domain)
- **Shared Codebase** (monorepo with Turborepo)
- **Auto-Deploy** (GitHub integration)

---

## 📋 Phase 1: Deploy Main + Phase 3 Apps

### Apps to Deploy

| App | Vercel Project Name | Subdomain | Custom Domain |
|-----|-------------------|-----------|---------------|
| Main | `ainexsuite-main` | www.ainexsuite.com | ainexsuite.com |
| Notes | `ainexsuite-notes` | notes.ainexsuite.com | ainexnotes.com |
| Journey | `ainexsuite-journey` | journey.ainexsuite.com | ainexjournal.com |
| Todo | `ainexsuite-todo` | todo.ainexsuite.com | ainextodo.com |

---

## 🛠️ Step-by-Step Deployment

### Step 1: Deploy Main App

#### 1.1 Create Vercel Project for Main App

```bash
cd /Users/dino/ainex/ainexsuite/apps/main
vercel
```

**Follow the prompts:**
- Link to existing project? → **No**
- Project name? → `ainexsuite-main`
- Directory? → **./apps/main** (current directory)
- Override settings? → **Yes**
  - Build Command: `cd ../.. && pnpm turbo run build --filter=@ainexsuite/main`
  - Output Directory: `.next`
  - Install Command: `cd ../.. && pnpm install`

#### 1.2 Configure Project Settings

```bash
# Set production environment variables
vercel env add NEXT_PUBLIC_APP_NAME production
# Enter: main

vercel env add NEXT_PUBLIC_MAIN_DOMAIN production
# Enter: www.ainexsuite.com

vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
# Enter: [your Firebase API key]

vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
# Enter: [your Firebase auth domain]

vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
# Enter: alnexsuite

vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
# Enter: [your Firebase storage bucket]

vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
# Enter: [your Firebase messaging sender ID]

vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
# Enter: [your Firebase app ID]
```

#### 1.3 Deploy to Production

```bash
vercel --prod
```

#### 1.4 Add Custom Domains

**In Vercel Dashboard:**
1. Go to https://vercel.com/[your-team]/ainexsuite-main/settings/domains
2. Add domains:
   - `www.ainexsuite.com` (Primary)
   - `ainexsuite.com` (Redirect to www)

**In DNS Provider (Namecheap/Cloudflare/etc):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.21.21
```

---

### Step 2: Deploy Notes App

#### 2.1 Create Vercel Project

```bash
cd /Users/dino/ainex/ainexsuite/apps/notes
vercel
```

**Follow the prompts:**
- Link to existing project? → **No**
- Project name? → `ainexsuite-notes`
- Directory? → **./apps/notes**
- Override settings? → **Yes** (uses apps/notes/vercel.json automatically)

#### 2.2 Configure Environment Variables

```bash
vercel env add NEXT_PUBLIC_APP_NAME production
# Enter: notes

vercel env add NEXT_PUBLIC_MAIN_DOMAIN production
# Enter: www.ainexsuite.com

# Add all Firebase environment variables (same as main app)
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
```

#### 2.3 Deploy to Production

```bash
vercel --prod
```

#### 2.4 Add Custom Domains

**In Vercel Dashboard:**
1. Go to https://vercel.com/[your-team]/ainexsuite-notes/settings/domains
2. Add domains:
   - `notes.ainexsuite.com`
   - `ainexnotes.com` (Redirect to subdomain)
   - `www.ainexnotes.com` (Redirect to subdomain)

**In DNS Provider:**
```
# Subdomain
Type: CNAME
Name: notes
Value: cname.vercel-dns.com

# Custom domain
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

### Step 3: Deploy Journey App

#### 3.1 Create Vercel Project

```bash
cd /Users/dino/ainex/ainexsuite/apps/journey
vercel
```

**Follow the prompts:**
- Link to existing project? → **No**
- Project name? → `ainexsuite-journey`
- Directory? → **./apps/journey**

#### 3.2 Configure Environment Variables

```bash
vercel env add NEXT_PUBLIC_APP_NAME production
# Enter: journal

vercel env add NEXT_PUBLIC_MAIN_DOMAIN production
# Enter: www.ainexsuite.com

# Add all Firebase environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
```

#### 3.3 Deploy to Production

```bash
vercel --prod
```

#### 3.4 Add Custom Domains

**In Vercel Dashboard:**
1. Go to https://vercel.com/[your-team]/ainexsuite-journey/settings/domains
2. Add domains:
   - `journey.ainexsuite.com`
   - `ainexjournal.com`
   - `www.ainexjournal.com`

**In DNS Provider:**
```
# Subdomain
Type: CNAME
Name: journey
Value: cname.vercel-dns.com

# Custom domain
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

### Step 4: Deploy Todo App

#### 4.1 Create Vercel Project

```bash
cd /Users/dino/ainex/ainexsuite/apps/todo
vercel
```

**Follow the prompts:**
- Link to existing project? → **No**
- Project name? → `ainexsuite-todo`
- Directory? → **./apps/todo**

#### 4.2 Configure Environment Variables

```bash
vercel env add NEXT_PUBLIC_APP_NAME production
# Enter: todo

vercel env add NEXT_PUBLIC_MAIN_DOMAIN production
# Enter: www.ainexsuite.com

# Add all Firebase environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
```

#### 4.3 Deploy to Production

```bash
vercel --prod
```

#### 4.4 Add Custom Domains

**In Vercel Dashboard:**
1. Go to https://vercel.com/[your-team]/ainexsuite-todo/settings/domains
2. Add domains:
   - `todo.ainexsuite.com`
   - `ainextodo.com`
   - `www.ainextodo.com`

**In DNS Provider:**
```
# Subdomain
Type: CNAME
Name: todo
Value: cname.vercel-dns.com

# Custom domain
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 🔗 Step 5: Connect GitHub for Auto-Deployment

### 5.1 Connect Repository to All Projects

For **each project** (main, notes, journey, todo):

1. Go to Project Settings → Git
2. Click "Connect Git Repository"
3. Select: `ainexllc/ainexsuite`
4. Configure:
   - **Production Branch**: `main`
   - **Root Directory**:
     - Main: `apps/main`
     - Notes: `apps/notes`
     - Journey: `apps/journey`
     - Todo: `apps/todo`

### 5.2 Configure Ignored Build Step

Each app should only deploy when its files change. Add this to each project's settings:

**In Project Settings → Git → Ignored Build Step:**

**For Main App:**
```bash
git diff --quiet HEAD^ HEAD -- ./apps/main ./packages
```

**For Notes App:**
```bash
git diff --quiet HEAD^ HEAD -- ./apps/notes ./packages
```

**For Journey App:**
```bash
git diff --quiet HEAD^ HEAD -- ./apps/journey ./packages
```

**For Todo App:**
```bash
git diff --quiet HEAD^ HEAD -- ./apps/todo ./packages
```

This ensures:
- Each app only deploys when its own code or shared packages change
- No unnecessary deployments
- Faster CI/CD pipeline

---

## 🔐 Step 6: Configure Firebase for Cross-Domain SSO

### 6.1 Update Firebase Auth Domains

In Firebase Console (https://console.firebase.google.com/project/alnexsuite/authentication/settings):

**Add Authorized Domains:**
```
www.ainexsuite.com
notes.ainexsuite.com
journey.ainexsuite.com
todo.ainexsuite.com
ainexnotes.com
ainexjournal.com
ainextodo.com
```

### 6.2 Update Cloud Function for Session Cookies

Ensure your session cookie function sets the domain to `.ainexsuite.com`:

```javascript
// functions/src/auth.ts
res.cookie('session', sessionCookie, {
  maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  domain: '.ainexsuite.com' // Enables cross-subdomain sharing
});
```

### 6.3 Deploy Updated Cloud Functions

```bash
cd /Users/dino/ainex/ainexsuite
firebase deploy --only functions
```

---

## ✅ Step 7: Verification Checklist

### Test Each App

- [ ] **Main App** (www.ainexsuite.com)
  - [ ] Loads successfully
  - [ ] Login works
  - [ ] Dashboard displays app links
  - [ ] Firebase connection working

- [ ] **Notes App** (notes.ainexsuite.com)
  - [ ] Loads successfully
  - [ ] Custom domain (ainexnotes.com) redirects
  - [ ] Authentication persists from main app
  - [ ] Can create/view notes
  - [ ] Firebase data syncs

- [ ] **Journey App** (journey.ainexsuite.com)
  - [ ] Loads successfully
  - [ ] Custom domain (ainexjournal.com) redirects
  - [ ] Authentication persists from main app
  - [ ] Can create/view journal entries
  - [ ] Firebase data syncs

- [ ] **Todo App** (todo.ainexsuite.com)
  - [ ] Loads successfully
  - [ ] Custom domain (ainextodo.com) redirects
  - [ ] Authentication persists from main app
  - [ ] Can create/view todos
  - [ ] Firebase data syncs

### Test Cross-App Navigation

- [ ] Login on main app → Navigate to notes → Authenticated ✅
- [ ] Login on main app → Navigate to journey → Authenticated ✅
- [ ] Login on main app → Navigate to todo → Authenticated ✅
- [ ] Login on notes app → Navigate to main → Authenticated ✅
- [ ] Logout from any app → All apps logged out ✅

### Test Auto-Deployment

- [ ] Push code change to `apps/main` → Only main app deploys
- [ ] Push code change to `apps/notes` → Only notes app deploys
- [ ] Push code change to `packages/ui` → All apps deploy
- [ ] Push code change to `apps/journey` → Only journey app deploys

---

## 🚀 Phase 2: Deploy Remaining Apps (Future)

Once Phase 1 is stable, repeat the process for:

| App | Subdomain | Custom Domain |
|-----|-----------|---------------|
| **Track** | track.ainexsuite.com | ainextrack.com |
| **Moments** | moments.ainexsuite.com | ainexmoments.com |
| **Grow** | grow.ainexsuite.com | ainexgrow.com |
| **Pulse** | pulse.ainexsuite.com | ainexpulse.com |
| **Fit** | fit.ainexsuite.com | ainexfit.com |

Each app follows the same 4-step process:
1. Create Vercel project
2. Configure environment variables
3. Deploy to production
4. Add custom domains

---

## 📝 Environment Variables Reference

### Required for ALL Apps

```bash
NEXT_PUBLIC_APP_NAME=[app-name]
NEXT_PUBLIC_MAIN_DOMAIN=www.ainexsuite.com
NEXT_PUBLIC_FIREBASE_API_KEY=[your-key]
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=[your-domain]
NEXT_PUBLIC_FIREBASE_PROJECT_ID=alnexsuite
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=[your-bucket]
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=[your-id]
NEXT_PUBLIC_FIREBASE_APP_ID=[your-app-id]
```

### App-Specific Values

| App | NEXT_PUBLIC_APP_NAME |
|-----|---------------------|
| Main | `main` |
| Notes | `notes` |
| Journey | `journal` |
| Todo | `todo` |
| Track | `track` |
| Moments | `moments` |
| Grow | `grow` |
| Pulse | `pulse` |
| Fit | `fit` |

---

## 🆘 Troubleshooting

### Build Fails with "No Next.js version detected"

**Solution**: Ensure `Root Directory` in Vercel project settings points to the app directory (e.g., `apps/main`), not the monorepo root.

### Authentication Not Persisting Across Subdomains

**Solution**:
1. Verify session cookie domain is set to `.ainexsuite.com`
2. Check all domains are added to Firebase Authorized Domains
3. Ensure cookies are `secure: true` and `sameSite: 'none'`

### App Deploys When It Shouldn't

**Solution**: Check the Ignored Build Step configuration in Vercel project settings. It should only check the app's own directory and shared packages.

### Custom Domain Not Working

**Solution**:
1. Verify DNS records are correctly configured
2. Wait up to 48 hours for DNS propagation
3. Check Vercel domain settings show "Valid Configuration"
4. Try clearing browser cache

### pnpm Install Fails During Build

**Solution**:
1. Verify `installCommand` in vercel.json: `cd ../.. && pnpm install`
2. Check pnpm version in package.json: `"packageManager": "pnpm@8.15.1"`
3. Ensure Node.js version is 18+ in Vercel project settings

---

## 📊 Success Metrics

After completing this deployment:

✅ **4 Production Apps** running independently
✅ **8 Custom Domains** configured (2 per app)
✅ **Cross-App SSO** working seamlessly
✅ **Auto-Deployment** on code changes
✅ **Monorepo Benefits** maintained (shared packages)
✅ **Independent Scaling** per app

---

## 🎯 Next Steps

1. **Deploy Phase 1 Apps** (main, notes, journey, todo)
2. **Test Cross-App Navigation** and SSO
3. **Monitor Performance** via Vercel Analytics
4. **Deploy Phase 2 Apps** (track, moments, grow, pulse, fit)
5. **Set Up Monitoring** (error tracking, uptime)
6. **Configure CDN** (if needed)
7. **Implement CI/CD** enhancements

---

**Created**: November 10, 2025
**Project**: AinexSuite Monorepo
**Repository**: https://github.com/ainexllc/ainexsuite
**Vercel Team**: dinohorn35-gmailcoms-projects
