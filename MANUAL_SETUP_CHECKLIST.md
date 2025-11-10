# Vercel Manual Setup Checklist

**Quick Reference**: Steps that must be completed manually in Vercel dashboard

## ✅ Completed

- [x] Created 7 Vercel projects
- [x] Linked projects locally
- [x] Fixed build configurations
- [x] Renamed main to ainexsuite-main
- [x] Updated local project.json files

## 📋 To-Do List

### 🧹 Optional Cleanup

- [ ] **Delete old "ainexsuite" project**
  - URL: https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite
  - Settings → General → Delete Project

### 🔑 Step 1: Get Firebase Credentials

- [ ] **Download Firebase Admin SDK JSON**
  - URL: https://console.firebase.google.com/project/alnexsuite/settings/serviceaccounts/adminsdk
  - Click "Generate New Private Key"
  - Extract: project_id, client_email, private_key

### 🔧 Step 2: Add Environment Variables to 7 Projects

For each project below, go to Settings → Environment Variables and add all variables from `scripts/env-template.txt`:

- [ ] **ainexsuite-main**
  - [ ] 8 public Firebase variables
  - [ ] 3 secret Firebase Admin variables (mark as Sensitive)
  - [ ] NEXT_PUBLIC_APP_NAME=main
  - [ ] Apply to: Production, Preview, Development

- [ ] **ainexsuite-journey**
  - [ ] 8 public Firebase variables
  - [ ] 3 secret Firebase Admin variables (mark as Sensitive)
  - [ ] NEXT_PUBLIC_APP_NAME=journey
  - [ ] Apply to: Production, Preview, Development

- [ ] **ainexsuite-notes**
  - [ ] 8 public Firebase variables
  - [ ] 3 secret Firebase Admin variables (mark as Sensitive)
  - [ ] NEXT_PUBLIC_APP_NAME=notes
  - [ ] Apply to: Production, Preview, Development

- [ ] **ainexsuite-todo**
  - [ ] 8 public Firebase variables
  - [ ] 3 secret Firebase Admin variables (mark as Sensitive)
  - [ ] NEXT_PUBLIC_APP_NAME=todo
  - [ ] Apply to: Production, Preview, Development

- [ ] **ainexsuite-moments**
  - [ ] 8 public Firebase variables
  - [ ] 3 secret Firebase Admin variables (mark as Sensitive)
  - [ ] NEXT_PUBLIC_APP_NAME=moments
  - [ ] Apply to: Production, Preview, Development

- [ ] **ainexsuite-grow**
  - [ ] 8 public Firebase variables
  - [ ] 3 secret Firebase Admin variables (mark as Sensitive)
  - [ ] NEXT_PUBLIC_APP_NAME=grow
  - [ ] Apply to: Production, Preview, Development

- [ ] **ainexsuite-track**
  - [ ] 8 public Firebase variables
  - [ ] 3 secret Firebase Admin variables (mark as Sensitive)
  - [ ] NEXT_PUBLIC_APP_NAME=track
  - [ ] Apply to: Production, Preview, Development

### 🔗 Step 3: Connect GitHub Integration

For each project, go to Settings → Git:

- [ ] **ainexsuite-main**
  - [ ] Repository: ainexllc/ainexsuite
  - [ ] Production Branch: main
  - [ ] Root Directory: apps/main

- [ ] **ainexsuite-journey**
  - [ ] Repository: ainexllc/ainexsuite
  - [ ] Production Branch: main
  - [ ] Root Directory: apps/journey

- [ ] **ainexsuite-notes**
  - [ ] Repository: ainexllc/ainexsuite
  - [ ] Production Branch: main
  - [ ] Root Directory: apps/notes

- [ ] **ainexsuite-todo**
  - [ ] Repository: ainexllc/ainexsuite
  - [ ] Production Branch: main
  - [ ] Root Directory: apps/todo

- [ ] **ainexsuite-moments**
  - [ ] Repository: ainexllc/ainexsuite
  - [ ] Production Branch: main
  - [ ] Root Directory: apps/moments

- [ ] **ainexsuite-grow**
  - [ ] Repository: ainexllc/ainexsuite
  - [ ] Production Branch: main
  - [ ] Root Directory: apps/grow

- [ ] **ainexsuite-track**
  - [ ] Repository: ainexllc/ainexsuite
  - [ ] Production Branch: main
  - [ ] Root Directory: apps/track

### 🌐 Step 4: Add Custom Domains

For each project, go to Settings → Domains:

- [ ] **ainexsuite-main**
  - [ ] ainexsuite.com
  - [ ] www.ainexsuite.com

- [ ] **ainexsuite-journey**
  - [ ] journey.ainexsuite.com
  - [ ] ainexjourney.com
  - [ ] www.ainexjourney.com

- [ ] **ainexsuite-notes**
  - [ ] notes.ainexsuite.com
  - [ ] ainexnotes.com
  - [ ] www.ainexnotes.com

- [ ] **ainexsuite-todo**
  - [ ] todo.ainexsuite.com
  - [ ] ainextodo.com
  - [ ] www.ainextodo.com

- [ ] **ainexsuite-moments**
  - [ ] moments.ainexsuite.com
  - [ ] ainexmoments.com
  - [ ] www.ainexmoments.com

- [ ] **ainexsuite-grow**
  - [ ] grow.ainexsuite.com
  - [ ] ainexgrow.com
  - [ ] www.ainexgrow.com

- [ ] **ainexsuite-track**
  - [ ] track.ainexsuite.com
  - [ ] ainextrack.com
  - [ ] www.ainextrack.com

### 📝 Step 5: Configure DNS Records

After adding each domain in Vercel, configure DNS with your registrar:

**Apex Domains** (example.com):
- [ ] ainexsuite.com → A record → 76.76.21.21
- [ ] ainexjourney.com → A record → 76.76.21.21
- [ ] ainexnotes.com → A record → 76.76.21.21
- [ ] ainextodo.com → A record → 76.76.21.21
- [ ] ainexmoments.com → A record → 76.76.21.21
- [ ] ainexgrow.com → A record → 76.76.21.21
- [ ] ainextrack.com → A record → 76.76.21.21

**WWW Subdomains**:
- [ ] www.ainexsuite.com → CNAME → cname.vercel-dns.com
- [ ] www.ainexjourney.com → CNAME → cname.vercel-dns.com
- [ ] www.ainexnotes.com → CNAME → cname.vercel-dns.com
- [ ] www.ainextodo.com → CNAME → cname.vercel-dns.com
- [ ] www.ainexmoments.com → CNAME → cname.vercel-dns.com
- [ ] www.ainexgrow.com → CNAME → cname.vercel-dns.com
- [ ] www.ainextrack.com → CNAME → cname.vercel-dns.com

**App Subdomains** (on ainexsuite.com):
- [ ] journey.ainexsuite.com → CNAME → cname.vercel-dns.com
- [ ] notes.ainexsuite.com → CNAME → cname.vercel-dns.com
- [ ] todo.ainexsuite.com → CNAME → cname.vercel-dns.com
- [ ] moments.ainexsuite.com → CNAME → cname.vercel-dns.com
- [ ] grow.ainexsuite.com → CNAME → cname.vercel-dns.com
- [ ] track.ainexsuite.com → CNAME → cname.vercel-dns.com

### ⏱️ Step 6: Wait for DNS Propagation

- [ ] **Monitor DNS propagation** (24-48 hours)
  - Use: https://dnschecker.org
  - Check all 21 DNS records

### 🧪 Step 7: Testing and Verification

- [ ] **Build Test**
  - [ ] Push test commit to main branch
  - [ ] Verify all 7 projects build successfully
  - [ ] Check deployment logs

- [ ] **Domain Test**
  - [ ] Visit each custom domain
  - [ ] Verify correct app loads
  - [ ] Test SSL certificates

- [ ] **Authentication Test**
  - [ ] Test Google sign-in on each app
  - [ ] Verify Firebase Admin SDK works
  - [ ] Check cross-app authentication

- [ ] **Environment Variable Test**
  - [ ] Verify NEXT_PUBLIC_APP_NAME is correct
  - [ ] Check Firebase connection
  - [ ] Test main domain detection

## 🎯 Progress Summary

**Total Tasks**: 7 automated + 189 manual
- ✅ Automated: 7/7 (100%)
- ⏳ Manual: 0/189 (0%)

**Estimated Time for Manual Steps**:
- Environment Variables: ~45 minutes (7 projects × 11 variables × 45 seconds)
- GitHub Integration: ~15 minutes (7 projects × 2 minutes)
- Domain Configuration: ~30 minutes (20 domains × 1.5 minutes)
- DNS Configuration: ~35 minutes (21 records × 1.5 minutes)
- Testing: ~20 minutes
- **Total**: ~2 hours 25 minutes

## 💡 Pro Tips

1. **Use Browser Tabs**: Open all 7 project dashboards in separate tabs
2. **Copy-Paste**: Keep Firebase credentials in a secure text file for quick pasting
3. **Test Early**: Use Vercel's auto URLs before configuring custom domains
4. **One Project at a Time**: Complete all steps for one project before moving to next
5. **Save Progress**: Check off items as you go

## 📚 Reference Files

- **Full Status**: `VERCEL_PROJECT_STATUS.md`
- **Env Template**: `scripts/env-template.txt`
- **Action Plan**: `VERCEL_DEPLOYMENT_ACTION_PLAN.md`

---

**Ready to Start?** Begin with Step 1: Get Firebase Credentials
