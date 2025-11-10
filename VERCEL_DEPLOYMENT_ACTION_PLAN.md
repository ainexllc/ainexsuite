# Vercel Deployment Action Plan - Phase 4

**Status**: Ready for Execution
**Estimated Time**: 3.5 hours (+ 24-48h DNS propagation)
**Date**: November 10, 2025

---

## 🎯 Deployment Strategy

**Approach**: Hybrid (Vercel Dashboard + CLI)
- Dashboard: Project creation and domain management
- CLI: Environment variables and verification

**Priority Order**:
1. **Phase 1**: Main App (dashboard)
2. **Phase 2**: Journey App (full dual-domain)
3. **Phase 3**: Remaining 5 Apps (batch)

---

## ✅ Pre-Deployment Checklist

Before starting, verify:
- [ ] All 7 apps build successfully: `pnpm build`
- [ ] Vercel CLI authenticated: `vercel whoami`
- [ ] GitHub repo pushed: `git status`
- [ ] Firebase backend deployed (Phase 3 complete)
- [ ] Environment variables documented (`.env.template`)
- [ ] DNS provider access ready

---

## 📋 Phase-by-Phase Action Items

### Phase 1: Deploy Main App (20 minutes)

**Vercel Dashboard Steps**:

1. **Go to**: https://vercel.com/dashboard
2. **Click**: "Add New" → "Project"
3. **Import**: `ainexllc/ainexsuite`
4. **Configure**:
   ```
   Project Name: ainexsuite-main
   Framework: Next.js
   Root Directory: apps/main
   Build Command: cd ../.. && npx turbo run build --filter=@ainexsuite/main
   Output Directory: .next
   Install Command: pnpm install
   Node Version: 20.x
   ```

5. **Environment Variables** (Add in dashboard):
   ```bash
   # Public Variables
   NEXT_PUBLIC_APP_NAME=main
   NEXT_PUBLIC_MAIN_DOMAIN=www.ainexsuite.com
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAvYZXrWGomqINh20NNiMlWxddm5eetkKc
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=alnexsuite.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=alnexsuite
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=alnexsuite.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1062785888767
   NEXT_PUBLIC_FIREBASE_APP_ID=1:1062785888767:web:9e29360b8b12e9723a77ca

   # Server Variables (Mark as SECRET)
   FIREBASE_ADMIN_PROJECT_ID=alnexsuite
   FIREBASE_ADMIN_CLIENT_EMAIL=[Get from Firebase Console]
   FIREBASE_ADMIN_PRIVATE_KEY=[Get from Firebase Console]
   ```

   **Important**: Select "Production", "Preview", and "Development" for each

6. **Click**: "Deploy"

7. **Add Domains** (After first deployment):
   - Go to: Project Settings → Domains
   - Add: `ainexsuite.com`
   - Add: `www.ainexsuite.com`
   - Vercel will show DNS instructions

8. **Configure DNS** (At your DNS provider):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

**CLI Verification**:
```bash
# Link project locally
cd apps/main
vercel link --project ainexsuite-main --yes

# Pull env vars to verify
vercel env pull .env.local

# Test build
cd ../..
pnpm --filter @ainexsuite/main build
```

**✅ Phase 1 Complete When**:
- [ ] Main app deployed successfully
- [ ] https://ainexsuite-main.vercel.app accessible
- [ ] Environment variables configured
- [ ] Domains added (DNS propagating)
- [ ] Build passes locally

---

### Phase 2: Deploy Journey App (20 minutes)

**Vercel Dashboard Steps**:

1. **Create New Project** (same as Phase 1):
   ```
   Project Name: ainexsuite-journey
   Framework: Next.js
   Root Directory: apps/journey
   Build Command: cd ../.. && npx turbo run build --filter=@ainexsuite/journey
   ```

2. **Environment Variables**:
   - Same Firebase variables as Main
   - Change: `NEXT_PUBLIC_APP_NAME=journey`

3. **Add 3 Domains**:
   - `journey.ainexsuite.com` (subdomain)
   - `ainexjourney.com` (standalone primary)
   - `www.ainexjourney.com` (standalone www)

4. **DNS Configuration**:

   **For ainexsuite.com** (add subdomain):
   ```
   Type: CNAME
   Name: journey
   Value: cname.vercel-dns.com
   ```

   **For ainexjourney.com** (new domain):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

**CLI Verification**:
```bash
cd apps/journey
vercel link --project ainexsuite-journey --yes
vercel env pull .env.local
cd ../..
pnpm --filter @ainexsuite/journey build
```

**✅ Phase 2 Complete When**:
- [ ] Journey app deployed
- [ ] https://ainexsuite-journey.vercel.app accessible
- [ ] 3 domains added
- [ ] DNS configured for subdomain + standalone
- [ ] Build passes locally

---

### Phase 3: Deploy Remaining 5 Apps (50 minutes)

**For Each App** (Notes, Tasks, Moments, Grow, Track):

1. **Create Vercel Project**:
   - Repeat Vercel dashboard steps
   - Use correct Root Directory: `apps/notes`, `apps/todo`, etc.
   - Use correct Build Command filter

2. **Environment Variables**:
   - Copy from Main app
   - Update `NEXT_PUBLIC_APP_NAME` per app

3. **Add 3 Domains Each**:

   | App | Subdomain | Standalone |
   |-----|-----------|------------|
   | Notes | notes.ainexsuite.com | ainexnotes.com, www.ainexnotes.com |
   | Tasks | tasks.ainexsuite.com | ainextasks.com, www.ainextasks.com |
   | Moments | moments.ainexsuite.com | ainexmoments.com, www.ainexmoments.com |
   | Grow | grow.ainexsuite.com | ainexgrow.com, www.ainexgrow.com |
   | Track | track.ainexsuite.com | ainextrack.com, www.ainextrack.com |

4. **DNS Configuration**:
   - Add CNAME for each subdomain on ainexsuite.com
   - Add A + CNAME for each standalone domain

**Batch DNS Configuration**:
```
# On ainexsuite.com, add these subdomains:
Type: CNAME, Name: notes, Value: cname.vercel-dns.com
Type: CNAME, Name: tasks, Value: cname.vercel-dns.com
Type: CNAME, Name: moments, Value: cname.vercel-dns.com
Type: CNAME, Name: grow, Value: cname.vercel-dns.com
Type: CNAME, Name: track, Value: cname.vercel-dns.com

# For each standalone domain (ainexnotes.com, ainextasks.com, etc.):
Type: A, Name: @, Value: 76.76.21.21
Type: CNAME, Name: www, Value: cname.vercel-dns.com
```

**✅ Phase 3 Complete When**:
- [ ] All 5 apps deployed
- [ ] All Vercel preview URLs accessible
- [ ] 15 domains added (3 per app)
- [ ] DNS configured for all
- [ ] All builds pass locally

---

## 🔧 Command Reference

### Pre-Deployment
```bash
# Test all builds
cd /Users/dino/ainex/ainexsuite
pnpm build

# Check Vercel CLI
vercel whoami
vercel --version

# Check Git status
git status
git push origin main
```

### Link Projects
```bash
# Link each app
cd apps/main && vercel link --project ainexsuite-main --yes
cd apps/journey && vercel link --project ainexsuite-journey --yes
cd apps/notes && vercel link --project ainexsuite-notes --yes
cd apps/todo && vercel link --project ainexsuite-todo --yes
cd apps/moments && vercel link --project ainexsuite-moments --yes
cd apps/grow && vercel link --project ainexsuite-grow --yes
cd apps/track && vercel link --project ainexsuite-track --yes
```

### Verify Deployments
```bash
# List all projects
vercel ls

# Check specific project
vercel inspect ainexsuite-main

# View logs
vercel logs https://ainexsuite-main.vercel.app
```

### Test DNS
```bash
# Check DNS propagation
dig ainexsuite.com
dig journey.ainexsuite.com
dig ainexjourney.com

# Or use online tool
open https://dnschecker.org
```

---

## 🌐 DNS Records Master List

### Main Domain: ainexsuite.com

```
# Apex domain
Type: A, Name: @, Value: 76.76.21.21

# WWW subdomain
Type: CNAME, Name: www, Value: cname.vercel-dns.com

# App subdomains
Type: CNAME, Name: journey, Value: cname.vercel-dns.com
Type: CNAME, Name: notes, Value: cname.vercel-dns.com
Type: CNAME, Name: tasks, Value: cname.vercel-dns.com
Type: CNAME, Name: moments, Value: cname.vercel-dns.com
Type: CNAME, Name: grow, Value: cname.vercel-dns.com
Type: CNAME, Name: track, Value: cname.vercel-dns.com
```

### Standalone Domains

**For EACH domain** (ainexjourney.com, ainexnotes.com, ainextasks.com, ainexmoments.com, ainexgrow.com, ainextrack.com):

```
Type: A, Name: @, Value: 76.76.21.21
Type: CNAME, Name: www, Value: cname.vercel-dns.com
```

**Total DNS Records**: 2 (apex + www) + 7 (subdomains) + 12 (6 standalone × 2) = **21 DNS records**

---

## 📊 Environment Variables Template

### Per-App Environment Variables

**Required for ALL 7 apps**:

```bash
# App Identity (CHANGE PER APP)
NEXT_PUBLIC_APP_NAME=main|journey|notes|tasks|moments|grow|track

# Common URLs
NEXT_PUBLIC_MAIN_DOMAIN=www.ainexsuite.com

# Firebase Client (PUBLIC - Same for all)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAvYZXrWGomqINh20NNiMlWxddm5eetkKc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=alnexsuite.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=alnexsuite
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=alnexsuite.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1062785888767
NEXT_PUBLIC_FIREBASE_APP_ID=1:1062785888767:web:9e29360b8b12e9723a77ca

# Firebase Admin (SECRET - Same for all)
FIREBASE_ADMIN_PROJECT_ID=alnexsuite
FIREBASE_ADMIN_CLIENT_EMAIL=[From Firebase Console]
FIREBASE_ADMIN_PRIVATE_KEY=[From Firebase Console - multiline]

# Optional - AI Features
GROK_API_KEY=[Optional - Only for apps using AI]
```

**How to get Firebase Admin credentials**:
1. Go to: https://console.firebase.google.com/project/alnexsuite/settings/serviceaccounts/adminsdk
2. Click: "Generate new private key"
3. Download JSON file
4. Copy values to Vercel environment variables

---

## ⚠️ Common Issues & Solutions

### Issue: Build Fails
**Error**: "Command exited with 1"

**Solution**:
```bash
# Test locally first
cd /Users/dino/ainex/ainexsuite
pnpm --filter @ainexsuite/main build

# Check TypeScript errors
cd apps/main
npx tsc --noEmit

# Reinstall dependencies
pnpm install
```

### Issue: Environment Variables Not Working
**Error**: Firebase initialization fails

**Solution**:
1. Verify variables added to "Production" environment
2. Check variable names (case-sensitive)
3. Ensure `NEXT_PUBLIC_` prefix for client-side
4. Redeploy after adding variables

### Issue: Domain Not Accessible
**Error**: "Domain not found" or 404

**Solution**:
1. Check DNS propagation: https://dnschecker.org
2. Wait 24-48 hours for full propagation
3. Verify DNS records match Vercel instructions
4. Check domain added in Vercel project settings

### Issue: SSL Certificate Not Working
**Error**: "Your connection is not private"

**Solution**:
1. Wait 10-15 minutes after adding domain
2. Vercel auto-provisions Let's Encrypt certificates
3. Check domain verification status in Vercel
4. Ensure DNS CNAME points to cname.vercel-dns.com

---

## ✅ Final Deployment Checklist

### Infrastructure
- [ ] 7 Vercel projects created
- [ ] All projects linked to GitHub repo
- [ ] Root Directory set correctly for each app
- [ ] Build commands configured
- [ ] Node.js 20.x selected

### Environment Variables
- [ ] Firebase client variables added (all 7 apps)
- [ ] Firebase Admin SDK credentials added (all 7 apps)
- [ ] NEXT_PUBLIC_APP_NAME set correctly per app
- [ ] All variables added to Production, Preview, Development
- [ ] Secrets marked as SECRET

### Domains
- [ ] 2 domains on Main app (ainexsuite.com + www)
- [ ] 3 domains on Journey app (subdomain + 2 standalone)
- [ ] 3 domains on Notes app
- [ ] 3 domains on Tasks app
- [ ] 3 domains on Moments app
- [ ] 3 domains on Grow app
- [ ] 3 domains on Track app
- [ ] **Total: 20 domains configured**

### DNS
- [ ] A record for ainexsuite.com
- [ ] CNAME for www.ainexsuite.com
- [ ] 6 CNAME records for app subdomains
- [ ] A records for 6 standalone domains
- [ ] 6 CNAME records for www subdomains
- [ ] **Total: 21 DNS records configured**

### Deployments
- [ ] All 7 apps deployed successfully
- [ ] All Vercel preview URLs accessible
- [ ] No build errors in Vercel dashboard
- [ ] GitHub auto-deploy enabled
- [ ] Smart deployment (ignoreCommand) working

### Post-Deployment
- [ ] DNS propagation verified (dnschecker.org)
- [ ] SSL certificates issued (all 20 domains)
- [ ] All custom domains accessible
- [ ] Authentication tested
- [ ] Vercel Analytics enabled
- [ ] Deployment notifications configured

---

## 📈 Success Metrics

**Deployment Success Indicators**:
- ✅ All 7 Vercel projects showing "Ready"
- ✅ All 20 domains showing "Valid" status
- ✅ All SSL certificates showing "Active"
- ✅ All preview URLs returning 200 OK
- ✅ No build errors in deployment logs

**Performance Targets**:
- Build time: < 3 minutes per app
- Deploy time: < 5 minutes per app
- Page load: < 2 seconds
- Lighthouse score: > 90

---

## 🚀 Next Phase

After Phase 4 completes:
- **Phase 5**: Testing & Verification (1-2 hours)
  - Test authentication flows
  - Verify SSO across subdomains
  - Test standalone domain independence
  - Validate smart deployment logic
  - Check Firebase integration

---

## 📞 Support Resources

**Vercel Documentation**:
- Projects: https://vercel.com/docs/projects
- Domains: https://vercel.com/docs/projects/domains
- Environment Variables: https://vercel.com/docs/projects/environment-variables
- Monorepos: https://vercel.com/docs/monorepos

**Tools**:
- DNS Checker: https://dnschecker.org
- SSL Test: https://www.ssllabs.com/ssltest/
- Vercel Status: https://www.vercel-status.com

**Project Resources**:
- GitHub Repo: https://github.com/ainexllc/ainexsuite
- Vercel Dashboard: https://vercel.com/dinohorn35-gmailcoms-projects
- Firebase Console: https://console.firebase.google.com/project/alnexsuite

---

**Status**: Ready to Execute
**Next Action**: Begin Phase 1 - Deploy Main App
**Estimated Completion**: 3.5 hours (manual work) + 24-48h (DNS propagation)

