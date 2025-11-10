# Quick Start: Vercel Deployment

**Ready to deploy?** Follow these streamlined steps to get AinexSuite live on Vercel.

## ✅ Already Completed

- ✅ 7 Vercel projects created (ainexsuite-main, journey, notes, todo, moments, grow, track)
- ✅ All projects linked locally
- ✅ Build configurations optimized
- ✅ Project naming standardized

## 🚀 3 Steps to Production

### Step 1: Add Environment Variables (AUTOMATED)

Run the automated script to add all environment variables to all 7 projects:

```bash
cd /Users/dino/ainex/ainexsuite
./scripts/setup-env-helper.sh
```

**What it does**:
1. Prompts you to download Firebase Admin SDK JSON
2. Extracts credentials automatically
3. Adds 11 environment variables to all 7 projects
4. Applies to production, preview, and development environments
5. Marks Firebase Admin credentials as sensitive

**Time**: ~5 minutes (mostly automated)

**Requirements**:
- Firebase Admin SDK JSON file (downloaded from Firebase Console)

**What you'll be asked**:
1. Path to the downloaded Firebase JSON file
2. Confirmation to proceed
3. Option to delete the JSON file after extraction (recommended)

### Step 2: Connect GitHub (MANUAL)

For each of the 7 projects, connect to GitHub:

**Quick Links**:
- [ainexsuite-main/settings/git](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-main/settings/git)
- [ainexsuite-journey/settings/git](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-journey/settings/git)
- [ainexsuite-notes/settings/git](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-notes/settings/git)
- [ainexsuite-todo/settings/git](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-todo/settings/git)
- [ainexsuite-moments/settings/git](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-moments/settings/git)
- [ainexsuite-grow/settings/git](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-grow/settings/git)
- [ainexsuite-track/settings/git](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-track/settings/git)

**For each project**:
1. Repository: `ainexllc/ainexsuite`
2. Production Branch: `main`
3. Root Directory: `apps/[app-name]`

**Time**: ~15 minutes

### Step 3: Add Domains & Configure DNS (YOU HANDLE)

You mentioned you'll handle domain configuration. Here's what's needed:

**Domains to Add** (20 total):
- **Main**: ainexsuite.com, www.ainexsuite.com
- **Journey**: journey.ainexsuite.com, ainexjourney.com, www.ainexjourney.com
- **Notes**: notes.ainexsuite.com, ainexnotes.com, www.ainexnotes.com
- **Todo**: todo.ainexsuite.com, ainextodo.com, www.ainextodo.com
- **Moments**: moments.ainexsuite.com, ainexmoments.com, www.ainexmoments.com
- **Grow**: grow.ainexsuite.com, ainexgrow.com, www.ainexgrow.com
- **Track**: track.ainexsuite.com, ainextrack.com, www.ainextrack.com

**DNS Records** (21 total):
- 7 apex domains → A record → 76.76.21.21
- 7 www subdomains → CNAME → cname.vercel-dns.com
- 7 app subdomains → CNAME → cname.vercel-dns.com

**Time**: ~30 minutes + DNS propagation (24-48 hours)

## 🎯 Ready to Start?

### Option A: Run Automated Setup Now

If you have the Firebase JSON file ready:

```bash
cd /Users/dino/ainex/ainexsuite
./scripts/setup-env-helper.sh
```

### Option B: Manual Environment Variables

If you prefer to add variables manually:

1. See template: `scripts/env-template.txt`
2. Follow checklist: `MANUAL_SETUP_CHECKLIST.md`

## 📊 Progress Tracking

After each step, update the checklist in `MANUAL_SETUP_CHECKLIST.md`:

- [ ] Step 1: Environment variables added
- [ ] Step 2: GitHub connected to all 7 projects
- [ ] Step 3: Domains added and DNS configured
- [ ] Testing: All apps accessible and working

## 🆘 Need Help?

**Scripts**:
- `./scripts/setup-env-helper.sh` - Automated env setup
- `./scripts/add-env-variables.sh` - Direct env addition (requires exports)
- `./scripts/setup-vercel-projects.sh` - Re-link projects (already run)

**Documentation**:
- `VERCEL_PROJECT_STATUS.md` - Current status of all projects
- `MANUAL_SETUP_CHECKLIST.md` - Detailed step-by-step checklist
- `VERCEL_DEPLOYMENT_ACTION_PLAN.md` - Complete deployment strategy

**Vercel CLI Commands**:
```bash
# Check project status
cd apps/main && vercel project ls

# List environment variables
cd apps/main && vercel env ls

# Test deployment
cd apps/main && vercel

# Production deployment
cd apps/main && vercel --prod
```

## 🎉 What Happens After Deployment?

Once all steps are complete:

1. **Automatic Deployments**: Every push to `main` branch triggers production deployment
2. **Preview Deployments**: Every PR creates a preview deployment
3. **Custom Domains**: All 20 domains route to correct apps
4. **SSL Certificates**: Auto-provisioned by Vercel
5. **Global CDN**: Apps served from Vercel's edge network
6. **Authentication**: Shared Google Auth across all apps
7. **Firebase**: Real-time data sync across apps

## 🔐 Security Notes

- ✅ Firebase Admin credentials marked as sensitive
- ✅ Private keys never exposed in logs
- ✅ Environment variables encrypted by Vercel
- ✅ Delete Firebase JSON file after extraction
- ✅ Never commit `.env` files to git

## 📈 Expected Timeline

- **Step 1 (Env Variables)**: 5 minutes
- **Step 2 (GitHub)**: 15 minutes
- **Step 3 (Domains/DNS)**: 30 minutes setup + 24-48 hours propagation
- **Total Active Time**: ~50 minutes
- **Total Elapsed Time**: 24-48 hours (waiting for DNS)

---

**Questions?** Check the documentation files or reach out for assistance.

**Let's deploy!** 🚀
