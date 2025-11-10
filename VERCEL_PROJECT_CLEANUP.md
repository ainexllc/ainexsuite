# Vercel Project Cleanup Guide

**Date**: November 10, 2025
**Status**: Action Required

---

## ⚠️ Old Project Found

The project **"ainexsuite"** (prj_RlA8kTMJwv9DdZ5jEtUzzaO5xCIK) is an old monorepo-level project that should no longer be used.

**Dashboard URL**: https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite

### Issues with This Project
- ❌ No framework detected (framework: null)
- ❌ All recent deployments CANCELED or ERROR
- ❌ Configured at repository root, not app-specific
- ❌ Cannot properly build monorepo apps
- ❌ Conflicts with new individual app projects

### Current Status
- Last deployment: CANCELED
- Created: January 24, 2025
- Node version: 22.x
- Live: false

---

## ✅ Correct Projects to Use

You should be using these **7 individual app projects** instead:

| App | Project Name | Status | Dashboard URL |
|-----|--------------|--------|---------------|
| Main | **main** | ✅ Active | https://vercel.com/dinohorn35-gmailcoms-projects/main |
| Journey | **ainexsuite-journey** | ✅ Active | https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-journey |
| Notes | **ainexsuite-notes** | ✅ Active | https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-notes |
| Todo | **ainexsuite-todo** | ✅ Active | https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-todo |
| Moments | **ainexsuite-moments** | ✅ Active | https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-moments |
| Grow | **ainexsuite-grow** | ✅ Active | https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-grow |
| Track | **ainexsuite-track** | ✅ Active | https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-track |

---

## 🗑️ Recommended Action: Delete Old Project

### Option 1: Delete via Dashboard (Recommended)

1. Go to: https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite
2. Click: **Settings** (bottom of sidebar)
3. Scroll to: **Delete Project** section
4. Type: `ainexsuite` to confirm
5. Click: **Delete**

**Why delete?**
- Prevents confusion between old and new projects
- Stops failed deployment attempts
- Cleans up your project list
- No impact on the 7 working projects

### Option 2: Pause Deployments (Alternative)

If you want to keep it for historical reasons:

1. Go to: https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite
2. Go to: **Settings → Git**
3. Disable: **Automatic Deployments**
4. This prevents new deployments but keeps historical data

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
