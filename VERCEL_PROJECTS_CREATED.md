# Vercel Projects Created ✅

**Date**: November 10, 2025
**Status**: Projects created and linked

---

## ✅ Created Projects

All 7 Vercel projects have been successfully created and linked:

| App | Project Name | Project ID | Dashboard URL |
|-----|--------------|------------|---------------|
| Main | **ainexsuite-main** | prj_qWQuZ68lqYmfGA0hJJwygUtRW0s4 or prj_RlA8kTMJwv9DdZ5jEtUzzaO5xCIK | https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-main |
| Journey | ainexsuite-journey | prj_fS5vskHrC6t4P6PR9APDCFZvc1y4 | https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-journey |
| Notes | ainexsuite-notes | prj_2frXVyo3VBqYKGQpvukDVK7JJOL9 | https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-notes |
| Todo | ainexsuite-todo | prj_aL0K7qBIi0zN3ry3nLLwxzwcwAyy | https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-todo |
| Moments | ainexsuite-moments | prj_kQrxgJDlJBaps4NLzyHLW3pHlv6p | https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-moments |
| Grow | ainexsuite-grow | prj_fHkxkE3uGUEBeTjaM3q7COU8QMPx | https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-grow |
| Track | ainexsuite-track | prj_DmQ6gHMjLanp6UvqccgE0fDf0X5m | https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-track |

**Note**: You need to rename either the "main" or "ainexsuite" project to "ainexsuite-main" and delete the other one.

---

## 🔄 FIRST STEP: Rename Main Project

Before proceeding with environment variables and domains, you need to consolidate the main project:

### Option 1: Rename "main" to "ainexsuite-main" (Recommended)

1. Go to: https://vercel.com/dinohorn35-gmailcoms-projects/main/settings
2. Under **General** → **Project Name**
3. Change from `main` to `ainexsuite-main`
4. Click **Save**
5. Then go to: https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite
6. Settings → Scroll to bottom → **Delete Project**

### Option 2: Rename "ainexsuite" to "ainexsuite-main"

1. Go to: https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite/settings
2. Under **General** → **Project Name**
3. Change from `ainexsuite` to `ainexsuite-main`
4. Click **Save**
5. Configure Git Root Directory to `apps/main`
6. Set Framework Preset to **Next.js**
7. Then go to: https://vercel.com/dinohorn35-gmailcoms-projects/main
8. Settings → Scroll to bottom → **Delete Project**

**Why this matters**: Having consistent naming (ainexsuite-main, ainexsuite-journey, etc.) makes it much easier to manage all projects.

---

## 🎯 Next Steps (Required)

### Step 1: Get Firebase Admin Credentials

1. Go to: https://console.firebase.google.com/project/alnexsuite/settings/serviceaccounts/adminsdk
2. Click: **"Generate new private key"**
3. Download the JSON file
4. Open the file and copy these values:
   - `project_id` → For FIREBASE_ADMIN_PROJECT_ID
   - `client_email` → For FIREBASE_ADMIN_CLIENT_EMAIL
   - `private_key` → For FIREBASE_ADMIN_PRIVATE_KEY (keep the `\n` characters)

### Step 2: Add Environment Variables to ALL Projects

For **EACH of the 7 projects** listed above:

1. Click the "Dashboard URL" link
2. Go to: **Settings → Environment Variables**
3. Add these variables (see `scripts/env-template.txt` for complete list):

#### Public Variables (same for all):
```
NEXT_PUBLIC_MAIN_DOMAIN=www.ainexsuite.com
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAvYZXrWGomqINh20NNiMlWxddm5eetkKc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=alnexsuite.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=alnexsuite
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=alnexsuite.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1062785888767
NEXT_PUBLIC_FIREBASE_APP_ID=1:1062785888767:web:9e29360b8b12e9723a77ca
```

#### Secret Variables (same for all, mark as SENSITIVE):
```
FIREBASE_ADMIN_PROJECT_ID=alnexsuite
FIREBASE_ADMIN_CLIENT_EMAIL=<from-step-1>
FIREBASE_ADMIN_PRIVATE_KEY=<from-step-1>
```

#### App-Specific Variable (CHANGE per app):
```
NEXT_PUBLIC_APP_NAME=<app-name>
```

**App name values**:
- main → `NEXT_PUBLIC_APP_NAME=main`
- journey → `NEXT_PUBLIC_APP_NAME=journey`
- notes → `NEXT_PUBLIC_APP_NAME=notes`
- todo → `NEXT_PUBLIC_APP_NAME=tasks`
- moments → `NEXT_PUBLIC_APP_NAME=moments`
- grow → `NEXT_PUBLIC_APP_NAME=grow`
- track → `NEXT_PUBLIC_APP_NAME=track`

4. Select: **Production, Preview, and Development**
5. Mark SECRET variables as **Sensitive**

### Step 3: Connect GitHub Integration

For **EACH project**:

1. Go to: **Settings → Git**
2. Click: **Connect Git Repository**
3. Select: **GitHub**
4. Repository: **ainexllc/ainexsuite**
5. Production Branch: **main**
6. Root Directory: **apps/[app-name]** (e.g., `apps/journey`)

This will enable auto-deployment when you push to GitHub.

### Step 4: Add Custom Domains

For **EACH project**, go to: **Settings → Domains**

#### Main App
- ainexsuite.com
- www.ainexsuite.com

#### Journey App
- journey.ainexsuite.com
- ainexjourney.com
- www.ainexjourney.com

#### Notes App
- notes.ainexsuite.com
- ainexnotes.com
- www.ainexnotes.com

#### Todo App
- tasks.ainexsuite.com
- ainextasks.com
- www.ainextasks.com

#### Moments App
- moments.ainexsuite.com
- ainexmoments.com
- www.ainexmoments.com

#### Grow App
- grow.ainexsuite.com
- ainexgrow.com
- www.ainexgrow.com

#### Track App
- track.ainexsuite.com
- ainextrack.com
- www.ainextrack.com

**Total: 20 domains to configure**

### Step 5: Configure DNS Records

See: `VERCEL_DEPLOYMENT_ACTION_PLAN.md` lines 278-309 for complete DNS configuration.

**Quick summary - Add these records at your DNS provider**:

#### On ainexsuite.com:
```
Type: A,     Name: @,       Value: 76.76.21.21
Type: CNAME, Name: www,     Value: cname.vercel-dns.com
Type: CNAME, Name: journey, Value: cname.vercel-dns.com
Type: CNAME, Name: notes,   Value: cname.vercel-dns.com
Type: CNAME, Name: tasks,   Value: cname.vercel-dns.com
Type: CNAME, Name: moments, Value: cname.vercel-dns.com
Type: CNAME, Name: grow,    Value: cname.vercel-dns.com
Type: CNAME, Name: track,   Value: cname.vercel-dns.com
```

#### On each standalone domain (ainexjourney.com, ainexnotes.com, etc.):
```
Type: A,     Name: @,   Value: 76.76.21.21
Type: CNAME, Name: www, Value: cname.vercel-dns.com
```

**Total: 21 DNS records**

---

## 🚀 Deployment Status

### What's Done ✅
- [x] 7 Vercel projects created
- [x] All projects linked locally (.vercel directories)
- [x] vercel.json configurations ready
- [x] Build commands configured
- [x] Next.js framework detected
- [x] Monorepo structure configured

### What's Needed ⏳
- [ ] Add environment variables (Step 2)
- [ ] Connect GitHub integration (Step 3)
- [ ] Add custom domains (Step 4)
- [ ] Configure DNS records (Step 5)
- [ ] Wait for DNS propagation (24-48h)
- [ ] Deploy Firebase backend
- [ ] Test deployments

---

## 📊 Quick Access Links

**Team Dashboard**: https://vercel.com/dinohorn35-gmailcoms-projects

**Firebase Console**: https://console.firebase.google.com/project/alnexsuite

**GitHub Repository**: https://github.com/ainexllc/ainexsuite

---

## 🔧 Helpful Commands

```bash
# Check project status
vercel ls

# Deploy specific app manually
cd apps/main && vercel --prod

# View deployment logs
vercel logs <deployment-url>

# Pull environment variables locally
cd apps/main && vercel env pull .env.local

# Check DNS propagation
dig ainexsuite.com
dig journey.ainexsuite.com

# Or use online tool
open https://dnschecker.org
```

---

## 📖 Additional Documentation

- **Complete deployment guide**: `VERCEL_DEPLOYMENT_ACTION_PLAN.md`
- **Environment variables template**: `scripts/env-template.txt`
- **Setup script**: `scripts/setup-vercel-projects.sh`
- **Firebase configuration**: `FIREBASE_AUTH_SETUP.md`
- **Firebase production review**: `FIREBASE_PRODUCTION_REVIEW.md`
- **User workflow**: `USER_WORKFLOW.md`

---

## 💡 Tips

1. **Batch Environment Variables**: You can copy/paste the same environment variables to all projects at once using the Vercel dashboard.

2. **GitHub Auto-Deploy**: Once GitHub is connected, every push to `main` will trigger deployments for changed apps only (thanks to `ignoreCommand`).

3. **Preview Deployments**: Every pull request will create preview deployments automatically.

4. **DNS Propagation**: After adding DNS records, use https://dnschecker.org to monitor propagation worldwide.

5. **SSL Certificates**: Vercel will automatically provision SSL certificates for all custom domains after DNS is configured.

---

**Next Action**: Start with Step 1 (Get Firebase Admin credentials) and work through Steps 2-5 systematically.

**Estimated Time**:
- Steps 1-3: 1-2 hours
- Step 4-5: 30 minutes
- DNS Propagation: 24-48 hours
