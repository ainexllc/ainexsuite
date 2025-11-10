# Vercel Project Cleanup & Naming Guide

**Date**: November 10, 2025
**Status**: Action Required - Consolidate and Rename

---

## 🔄 Project Consolidation Needed

You currently have TWO projects for the main app:
1. **"main"** (prj_qWQuZ68lqYmfGA0hJJwygUtRW0s4)
2. **"ainexsuite"** (prj_RlA8kTMJwv9DdZ5jEtUzzaO5xCIK)

**Goal**: Consolidate into ONE project named **"ainexsuite-main"** for consistent naming.

---

## ✅ Target Project Structure

You should have these **7 projects** with consistent naming:

| App | Project Name | Status | Dashboard URL |
|-----|--------------|--------|---------------|
| Main | **ainexsuite-main** | 🔄 Needs Rename | https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-main |
| Journey | **ainexsuite-journey** | ✅ Active | https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-journey |
| Notes | **ainexsuite-notes** | ✅ Active | https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-notes |
| Todo | **ainexsuite-todo** | ✅ Active | https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-todo |
| Moments | **ainexsuite-moments** | ✅ Active | https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-moments |
| Grow | **ainexsuite-grow** | ✅ Active | https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-grow |
| Track | **ainexsuite-track** | ✅ Active | https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-track |

**Perfect naming consistency**: All projects follow the `ainexsuite-[app]` pattern!

---

## 🔧 Recommended Actions (Choose One Path)

### Path A: Rename "main" to "ainexsuite-main" (Easier)

**Step 1: Rename the "main" project**
1. Go to: https://vercel.com/dinohorn35-gmailcoms-projects/main/settings
2. Under **General** → **Project Name**
3. Change from `main` to `ainexsuite-main`
4. Click **Save**

**Step 2: Delete the "ainexsuite" project**
1. Go to: https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite/settings
2. Scroll to bottom → **Delete Project**
3. Type: `ainexsuite` to confirm
4. Click: **Delete**

**Why this path?**
- The "main" project has Next.js framework detected
- Less configuration needed
- Cleaner starting point

---

### Path B: Rename "ainexsuite" to "ainexsuite-main"

**Step 1: Configure the "ainexsuite" project**
1. Go to: https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite/settings
2. Under **General** → **Project Name**: Change to `ainexsuite-main`
3. Under **General** → **Framework Preset**: Select **Next.js**
4. Under **Git** → **Root Directory**: Set to `apps/main`
5. Under **Build & Development Settings**:
   - Build Command: `cd ../.. && pnpm turbo run build --filter=@ainexsuite/main`
   - Output Directory: `.next`
   - Install Command: `cd ../.. && pnpm install`
6. Click **Save** for each setting

**Step 2: Delete the "main" project**
1. Go to: https://vercel.com/dinohorn35-gmailcoms-projects/main/settings
2. Scroll to bottom → **Delete Project**
3. Type: `main` to confirm
4. Click: **Delete**

**Why this path?**
- You want to use the "ainexsuite" name specifically
- Requires more configuration but keeps that project

---

## 🔄 Migration Status

### Old Project (ainexsuite)
- ❌ Should not be used
- ❌ Deployments failing/canceled
- ❌ Cannot deploy monorepo properly

### New Projects (7 individual apps)
- ✅ Created November 10, 2025
- ✅ Properly configured for monorepo
- ✅ Each app has own Vercel project
- ✅ Root directory set correctly per app
- ✅ Ready for environment variables
- ⏳ Waiting for GitHub connection
- ⏳ Waiting for custom domains

---

## 📋 Next Steps (For New Projects)

After cleaning up the old "ainexsuite" project:

1. **Add Environment Variables** to all 7 new projects
   - See: `scripts/env-template.txt`
   - See: `VERCEL_PROJECTS_CREATED.md`

2. **Connect GitHub Integration**
   - Link each project to `ainexllc/ainexsuite`
   - Set root directory for each app

3. **Add Custom Domains**
   - 20 domains total
   - See: `VERCEL_PROJECTS_CREATED.md` for list

4. **Configure DNS**
   - 21 DNS records
   - See: `VERCEL_DEPLOYMENT_ACTION_PLAN.md`

---

## 🚨 Important Notes

1. **Don't deploy to "ainexsuite" project** - use the individual app projects
2. **GitHub is already connected** to "ainexsuite" project - this will need to be transferred to individual projects
3. **Deployments are being canceled** automatically by the ignoreCommand, which is correct behavior
4. **No domains are configured** on the old project yet, so deletion is safe

---

## ✅ Verification

After deleting/disabling the old project, verify:

- [ ] Old "ainexsuite" project deleted or paused
- [ ] 7 new projects show in dashboard
- [ ] No deployments triggering on old project
- [ ] GitHub integration being set up on new projects

---

## 📖 Related Documentation

- **New projects info**: `VERCEL_PROJECTS_CREATED.md`
- **Deployment guide**: `VERCEL_DEPLOYMENT_ACTION_PLAN.md`
- **Environment vars**: `scripts/env-template.txt`

---

**Action Required**: Delete or disable the old "ainexsuite" project to avoid confusion.
