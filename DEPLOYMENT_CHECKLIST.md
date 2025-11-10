# AinexSuite Multi-App Deployment Checklist

## Pre-Deployment Preparation

### 1. Repository & Code ✅
- [x] All app `vercel.json` files updated with smart ignoreCommand
- [x] Firebase functions configured for cross-domain auth
- [x] Environment variables documented in `.env.template`
- [x] All shared packages built successfully
- [x] No TypeScript errors in any app
- [x] All apps build successfully locally

### 2. Firebase Setup
- [ ] Firebase project `alnexsuite` is active
- [ ] Firestore database created and configured
- [ ] Firebase Authentication enabled (Google provider)
- [ ] Cloud Functions deployed and working
- [ ] Security rules deployed
- [ ] Firestore indexes deployed
- [ ] Firebase Admin SDK key generated and stored securely

### 3. Domain Acquisition
- [ ] `ainexsuite.com` domain purchased and accessible
- [ ] `ainexnotes.com` domain purchased and accessible
- [ ] `ainexjourney.com` domain purchased and accessible
- [ ] `ainextodo.com` domain purchased and accessible
- [ ] DNS management access configured

---

## Phase 1: Create Vercel Projects (Day 1)

### Main Dashboard App
- [ ] Create project `ainexsuite-main`
- [ ] Link to GitHub repository `ainexllc/ainexsuite`
- [ ] Set Root Directory to `apps/main`
- [ ] Configure build settings:
  - Build Command: `cd ../.. && pnpm install && pnpm turbo run build --filter=@ainexsuite/main`
  - Install Command: `cd ../.. && pnpm install`
  - Output Directory: `.next`
  - Node Version: `22.x`
- [ ] Set ignore command: `cd ../.. && git diff --quiet HEAD^ HEAD -- ./apps/main ./packages ./package.json ./pnpm-lock.yaml ./turbo.json`
- [ ] Add environment variables (use `.env.template` as reference)
  - [ ] NEXT_PUBLIC_APP_NAME=main
  - [ ] NEXT_PUBLIC_MAIN_DOMAIN=www.ainexsuite.com
  - [ ] All Firebase config variables
  - [ ] FIREBASE_SERVICE_ACCOUNT_KEY (secret)
- [ ] Deploy project
- [ ] Verify build succeeds
- [ ] Note deployment URL

### Notes App
- [ ] Create project `ainexsuite-notes`
- [ ] Link to GitHub repository `ainexllc/ainexsuite`
- [ ] Set Root Directory to `apps/notes`
- [ ] Configure build settings (same as main, but filter=@ainexsuite/notes)
- [ ] Set ignore command (replace `apps/main` with `apps/notes`)
- [ ] Add environment variables
  - [ ] NEXT_PUBLIC_APP_NAME=notes
  - [ ] (all other variables same as main)
- [ ] Deploy project
- [ ] Verify build succeeds
- [ ] Note deployment URL

### Journey App
- [ ] Create project `ainexsuite-journey`
- [ ] Link to GitHub repository `ainexllc/ainexsuite`
- [ ] Set Root Directory to `apps/journey`
- [ ] Configure build settings (filter=@ainexsuite/journey)
- [ ] Set ignore command (replace `apps/main` with `apps/journey`)
- [ ] Add environment variables
  - [ ] NEXT_PUBLIC_APP_NAME=journal
  - [ ] (all other variables same as main)
- [ ] Deploy project
- [ ] Verify build succeeds
- [ ] Note deployment URL

### Todo App
- [ ] Create project `ainexsuite-todo`
- [ ] Link to GitHub repository `ainexllc/ainexsuite`
- [ ] Set Root Directory to `apps/todo`
- [ ] Configure build settings (filter=@ainexsuite/todo)
- [ ] Set ignore command (replace `apps/main` with `apps/todo`)
- [ ] Add environment variables
  - [ ] NEXT_PUBLIC_APP_NAME=todo
  - [ ] (all other variables same as main)
- [ ] Deploy project
- [ ] Verify build succeeds
- [ ] Note deployment URL

---

## Phase 2: Configure DNS (Day 1-2)

### Configure ainexsuite.com
- [ ] Add A record: `@` → `76.76.21.21`
- [ ] Add CNAME: `www` → `cname.vercel-dns.com`
- [ ] Add CNAME: `notes` → `cname.vercel-dns.com`
- [ ] Add CNAME: `journey` → `cname.vercel-dns.com`
- [ ] Add CNAME: `todo` → `cname.vercel-dns.com`
- [ ] Verify records with `dig` command
- [ ] Wait for DNS propagation (check dnschecker.org)

### Configure ainexnotes.com
- [ ] Add A record: `@` → `76.76.21.21`
- [ ] Add CNAME: `www` → `cname.vercel-dns.com`
- [ ] Verify records propagate

### Configure ainexjourney.com
- [ ] Add A record: `@` → `76.76.21.21`
- [ ] Add CNAME: `www` → `cname.vercel-dns.com`
- [ ] Verify records propagate

### Configure ainextodo.com
- [ ] Add A record: `@` → `76.76.21.21`
- [ ] Add CNAME: `www` → `cname.vercel-dns.com`
- [ ] Verify records propagate

---

## Phase 3: Add Domains to Vercel (Day 2)

### Main App Domains
- [ ] Go to ainexsuite-main → Settings → Domains
- [ ] Add domain: `ainexsuite.com`
- [ ] Add domain: `www.ainexsuite.com`
- [ ] Set `www.ainexsuite.com` as primary
- [ ] Verify SSL certificate issued
- [ ] Test HTTPS access

### Notes App Domains
- [ ] Go to ainexsuite-notes → Settings → Domains
- [ ] Add domain: `notes.ainexsuite.com`
- [ ] Add domain: `ainexnotes.com`
- [ ] Add domain: `www.ainexnotes.com`
- [ ] Set `notes.ainexsuite.com` as primary
- [ ] Verify SSL certificates issued
- [ ] Test HTTPS access

### Journey App Domains
- [ ] Go to ainexsuite-journey → Settings → Domains
- [ ] Add domain: `journey.ainexsuite.com`
- [ ] Add domain: `ainexjourney.com`
- [ ] Add domain: `www.ainexjourney.com`
- [ ] Set `journey.ainexsuite.com` as primary
- [ ] Verify SSL certificates issued
- [ ] Test HTTPS access

### Todo App Domains
- [ ] Go to ainexsuite-todo → Settings → Domains
- [ ] Add domain: `todo.ainexsuite.com`
- [ ] Add domain: `ainextodo.com`
- [ ] Add domain: `www.ainextodo.com`
- [ ] Set `todo.ainexsuite.com` as primary
- [ ] Verify SSL certificates issued
- [ ] Test HTTPS access

---

## Phase 4: Enable GitHub Auto-Deploy (Day 2)

### For All 4 Projects
- [ ] ainexsuite-main: Enable auto-deploy on `main` branch
- [ ] ainexsuite-notes: Enable auto-deploy on `main` branch
- [ ] ainexsuite-journey: Enable auto-deploy on `main` branch
- [ ] ainexsuite-todo: Enable auto-deploy on `main` branch
- [ ] Verify "Automatically create production deployment" is enabled
- [ ] Verify "Preview Deployments" is enabled

---

## Phase 5: Testing (Day 2-3)

### Functional Testing

#### Main Dashboard
- [ ] Visit https://www.ainexsuite.com
- [ ] Verify page loads correctly
- [ ] Test Google login
- [ ] Verify user profile created in Firestore
- [ ] Check session cookie set with domain `.ainexsuite.com`
- [ ] Test navigation to other apps from dashboard

#### Notes App - Subdomain
- [ ] Visit https://notes.ainexsuite.com (while logged in on main)
- [ ] Verify authentication maintained (no re-login)
- [ ] Test creating a note
- [ ] Test editing a note
- [ ] Test deleting a note
- [ ] Verify data saves to Firestore

#### Notes App - Standalone Domain
- [ ] Visit https://ainexnotes.com (new session)
- [ ] Verify redirected to login
- [ ] Test Google login
- [ ] Verify authentication works independently
- [ ] Test note CRUD operations

#### Journey App - Subdomain
- [ ] Visit https://journey.ainexsuite.com (while logged in)
- [ ] Verify authentication maintained
- [ ] Test creating journal entry
- [ ] Test editing entry
- [ ] Verify data saves correctly

#### Journey App - Standalone Domain
- [ ] Visit https://ainexjourney.com (new session)
- [ ] Test independent authentication
- [ ] Test journal functionality

#### Todo App - Subdomain
- [ ] Visit https://todo.ainexsuite.com (while logged in)
- [ ] Verify authentication maintained
- [ ] Test creating todo
- [ ] Test completing todo
- [ ] Verify data sync

#### Todo App - Standalone Domain
- [ ] Visit https://ainextodo.com (new session)
- [ ] Test independent authentication
- [ ] Test todo functionality

### Cross-Domain Testing
- [ ] **Single App User Test**:
  - [ ] New user registers on ainexnotes.com
  - [ ] Can access notes.ainexsuite.com and ainexnotes.com
  - [ ] No dashboard redirect (only 1 app)

- [ ] **Multi-App User Test**:
  - [ ] User activates 2nd app (e.g., journey)
  - [ ] System detects 2+ apps
  - [ ] On next login → Redirected to ainexsuite.com/workspace
  - [ ] Dashboard shows both apps (Notes, Journey)
  - [ ] Click "Open Notes" → Opens notes.ainexsuite.com with SSO
  - [ ] Click "Open Journey" → Opens journey.ainexsuite.com with SSO

- [ ] **Subdomain SSO**:
  - [ ] Login on www.ainexsuite.com
  - [ ] Navigate to notes.ainexsuite.com → Stay logged in ✅
  - [ ] Navigate to journey.ainexsuite.com → Stay logged in ✅
  - [ ] Navigate to todo.ainexsuite.com → Stay logged in ✅

- [ ] **Standalone Domain**:
  - [ ] Navigate to ainexnotes.com → Redirected to login (expected) ✅
  - [ ] Login works independently on standalone domain

### Smart Deployment Testing
- [ ] Make change to `apps/notes/src/app/page.tsx`
- [ ] Push to GitHub
- [ ] Verify ONLY ainexsuite-notes deploys
- [ ] Other 3 projects should skip deployment

- [ ] Make change to `packages/ui/src/index.ts`
- [ ] Push to GitHub
- [ ] Verify ALL 4 projects deploy

- [ ] Make change to root `package.json`
- [ ] Push to GitHub
- [ ] Verify ALL 4 projects deploy

### Performance Testing
- [ ] Check Lighthouse scores for all apps (target: >90)
- [ ] Test page load times (target: <2s)
- [ ] Test mobile responsiveness
- [ ] Test different browsers (Chrome, Firefox, Safari, Edge)

### Security Testing
- [ ] Verify all domains use HTTPS
- [ ] Check SSL certificate validity
- [ ] Test session expiration (should expire after 14 days)
- [ ] Verify logout clears cookies
- [ ] Test unauthorized access to protected routes

---

## Phase 6: Monitoring & Optimization (Day 3+)

### Setup Monitoring
- [ ] Configure Vercel Analytics for all 4 projects
- [ ] Set up uptime monitoring (UptimeRobot or similar)
- [ ] Configure error tracking (Sentry or similar)
- [ ] Set up log aggregation

### Performance Optimization
- [ ] Review and optimize bundle sizes
- [ ] Enable image optimization in all apps
- [ ] Configure caching headers appropriately
- [ ] Review and optimize Firestore queries

### Documentation
- [ ] Update main README.md with deployment URLs
- [ ] Document any deployment issues encountered
- [ ] Create runbook for common deployment tasks
- [ ] Document rollback procedures

---

## Phase 7: User Acceptance Testing (Day 4-7)

### Internal Testing
- [ ] Test all functionality end-to-end
- [ ] Verify data persistence across sessions
- [ ] Test multi-device access (desktop, mobile, tablet)
- [ ] Verify email notifications work
- [ ] Test AI features (if enabled)

### Beta Testing (Optional)
- [ ] Invite 5-10 beta users
- [ ] Collect feedback on UX/UI
- [ ] Monitor error rates
- [ ] Address any critical issues

---

## Phase 8: Production Launch (Day 8+)

### Pre-Launch
- [ ] Final security audit
- [ ] Final performance review
- [ ] Backup Firebase data
- [ ] Document rollback plan
- [ ] Prepare launch announcement

### Launch Day
- [ ] Announce on social media/channels
- [ ] Monitor deployment status
- [ ] Watch error rates and logs
- [ ] Be ready for quick fixes
- [ ] Collect initial user feedback

### Post-Launch (Week 1-4)
- [ ] Monitor daily active users
- [ ] Track app usage patterns
- [ ] Address user feedback
- [ ] Fix any bugs discovered
- [ ] Plan Phase 2 deployment (remaining 5 apps)

---

## Phase 9: Deploy Remaining Apps (Week 5+)

### Apps to Deploy
- [ ] Track (ainextrack.com / track.ainexsuite.com)
- [ ] Moments (ainexmoments.com / moments.ainexsuite.com)
- [ ] Grow (ainexgrow.com / grow.ainexsuite.com)
- [ ] Pulse (ainexpulse.com / pulse.ainexsuite.com)
- [ ] Fit (ainexfit.com / fit.ainexsuite.com)

### Repeat Process
- [ ] Follow same Vercel project creation steps
- [ ] Configure DNS for new domains
- [ ] Add domains to Vercel
- [ ] Enable auto-deploy
- [ ] Test functionality
- [ ] Launch progressively

---

## Success Criteria

### Technical Success
✅ All 4 apps deployed and accessible
✅ All domains resolve correctly with SSL
✅ Authentication works across subdomains
✅ Smart deployment logic working
✅ No critical bugs or errors
✅ Performance targets met (>90 Lighthouse, <2s load)

### User Success
✅ Users can sign up and access apps
✅ Data persists correctly
✅ Cross-app navigation seamless
✅ Mobile experience smooth
✅ Positive user feedback

### Business Success
✅ All apps production-ready
✅ Scalable architecture proven
✅ Monitoring and analytics active
✅ Ready for user acquisition
✅ Foundation for remaining 5 apps

---

## Emergency Contacts & Resources

**GitHub Repository**: https://github.com/ainexllc/ainexsuite
**Vercel Dashboard**: https://vercel.com/dinohorn35-gmailcoms-projects
**Firebase Console**: https://console.firebase.google.com/project/alnexsuite
**DNS Provider**: [Your DNS provider dashboard URL]

**Key Documentation**:
- VERCEL_SETUP_GUIDE.md
- DNS_CONFIGURATION.md
- FIREBASE_CORS_UPDATE.md
- .env.template

**Support**:
- Vercel Support: https://vercel.com/support
- Firebase Support: https://firebase.google.com/support
- GitHub Issues: https://github.com/ainexllc/ainexsuite/issues

---

**Last Updated**: November 10, 2025
**Status**: Ready for Phase 1 - Create Vercel Projects
**Estimated Timeline**: 8-10 days for full deployment of 4 apps
