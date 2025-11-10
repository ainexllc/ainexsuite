# AinexSuite Deployment Scripts

Automated scripts for deploying AinexSuite apps to Vercel.

## 📁 Available Scripts

### 1. `setup-vercel-projects.sh` ✅ ALREADY RUN

**Status**: Completed - all 7 projects created and linked

**Purpose**: Create and link Vercel projects for all apps

**What it does**:
- Creates 7 Vercel projects (if they don't exist)
- Links local apps to Vercel projects
- Creates `.vercel/project.json` files
- Safe to re-run (idempotent)

**Usage**:
```bash
./scripts/setup-vercel-projects.sh
```

**Result**: 7 projects created:
- ainexsuite-main (prj_qWQuZ68lqYmfGA0hJJwygUtRW0s4)
- ainexsuite-journey (prj_fS5vskHrC6t4P6PR9APDCFZvc1y4)
- ainexsuite-notes (prj_2frXVyo3VBqYKGQpvukDVK7JJOL9)
- ainexsuite-todo (prj_aL0K7qBIi0zN3ry3nLLwxzwcwAyy)
- ainexsuite-moments (prj_kQrxgJDlJBaps4NLzyHLW3pHlv6p)
- ainexsuite-grow (prj_fHkxkE3uGUEBeTjaM3q7COU8QMPx)
- ainexsuite-track (prj_DmQ6gHMjLanp6UvqccgE0fDf0X5m)

---

### 2. `setup-env-helper.sh` ⭐ RUN THIS NEXT

**Status**: Ready to run

**Purpose**: Interactive setup for environment variables

**What it does**:
1. Guides you to download Firebase Admin SDK JSON
2. Extracts credentials from JSON automatically
3. Validates credentials before proceeding
4. Calls `add-env-variables.sh` to add variables
5. Offers to delete JSON file for security

**Usage**:
```bash
./scripts/setup-env-helper.sh
```

**Requirements**:
- Firebase Admin SDK JSON file
  - Get from: https://console.firebase.google.com/project/alnexsuite/settings/serviceaccounts/adminsdk
  - Click "Generate New Private Key"

**Interactive prompts**:
1. "Have you downloaded the JSON file? (y/n)"
2. "Enter the path to the downloaded JSON file:"
3. "Proceed with adding environment variables? (y/n)"
4. "Delete the Firebase JSON file now? (y/n)"

**Time**: ~5 minutes

**What gets added**: 11 environment variables per project × 7 projects × 3 environments = 231 operations

---

### 3. `add-env-variables.sh` (Called by setup-env-helper.sh)

**Status**: Ready (automatically called by setup-env-helper.sh)

**Purpose**: Add environment variables to all Vercel projects

**What it does**:
- Adds 8 public Firebase variables
- Adds 3 secret Firebase Admin variables (marked sensitive)
- Adds app-specific NEXT_PUBLIC_APP_NAME variable
- Applies to production, preview, and development environments

**Direct usage** (advanced):
```bash
# Export Firebase credentials first
export FIREBASE_ADMIN_PROJECT_ID='alnexsuite'
export FIREBASE_ADMIN_CLIENT_EMAIL='<from-firebase-json>'
export FIREBASE_ADMIN_PRIVATE_KEY='<from-firebase-json>'

# Then run the script
./scripts/add-env-variables.sh
```

**Note**: It's easier to use `setup-env-helper.sh` instead.

---

### 4. `env-template.txt`

**Purpose**: Reference template for environment variables

**Usage**: View to see what variables are being added

```bash
cat scripts/env-template.txt
```

**Contains**:
- Public Firebase configuration (8 variables)
- Secret Firebase Admin credentials (3 variables)
- App-specific configuration (1 variable)
- Comments explaining each variable

## 🚀 Recommended Workflow

### First Time Setup

1. **Create Projects** (Already completed ✅)
   ```bash
   ./scripts/setup-vercel-projects.sh
   ```

2. **Add Environment Variables** (Run this next ⭐)
   ```bash
   ./scripts/setup-env-helper.sh
   ```

3. **Connect GitHub** (Manual - see below)

4. **Add Domains** (Manual - see below)

### Updating Existing Projects

**To update environment variables**:
```bash
# Remove old variables first (if needed)
cd apps/main && vercel env rm VARIABLE_NAME production

# Re-run env setup
./scripts/setup-env-helper.sh
```

**To re-link projects**:
```bash
./scripts/setup-vercel-projects.sh
```

## 🔧 Manual Steps Still Required

After running the automated scripts, you need to manually:

### 1. Connect GitHub Integration

For each project, go to Settings → Git:

**Quick Links**:
- [ainexsuite-main](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-main/settings/git)
- [ainexsuite-journey](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-journey/settings/git)
- [ainexsuite-notes](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-notes/settings/git)
- [ainexsuite-todo](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-todo/settings/git)
- [ainexsuite-moments](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-moments/settings/git)
- [ainexsuite-grow](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-grow/settings/git)
- [ainexsuite-track](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-track/settings/git)

**Configuration**:
- Repository: `ainexllc/ainexsuite`
- Production Branch: `main`
- Root Directory: `apps/[app-name]`

### 2. Add Custom Domains

See `../MANUAL_SETUP_CHECKLIST.md` for complete domain list and DNS configuration.

## 🆘 Troubleshooting

### Script won't run
```bash
# Make scripts executable
chmod +x scripts/*.sh
```

### "vercel command not found"
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login
```

### Environment variables not added
```bash
# Check if projects are linked
cd apps/main && vercel project ls

# Check existing env variables
cd apps/main && vercel env ls

# Re-run with verbose output
cd apps/main && vercel env add VARIABLE_NAME production --debug
```

### Firebase credentials extraction fails
```bash
# Manually extract from JSON using jq
cat firebase-adminsdk.json | jq -r '.project_id'
cat firebase-adminsdk.json | jq -r '.client_email'
cat firebase-adminsdk.json | jq -r '.private_key'
```

## 📚 Related Documentation

- `../QUICK_START_DEPLOYMENT.md` - Quick start guide
- `../VERCEL_PROJECT_STATUS.md` - Current project status
- `../MANUAL_SETUP_CHECKLIST.md` - Complete manual checklist
- `../VERCEL_DEPLOYMENT_ACTION_PLAN.md` - Detailed deployment plan

## 🔐 Security Best Practices

1. **Never commit Firebase JSON files**
   - Already in `.gitignore`
   - Delete after extracting credentials

2. **Use sensitive flag for secrets**
   - Automatically applied by scripts
   - Prevents secrets in logs

3. **Rotate credentials periodically**
   - Generate new Firebase Admin SDK keys
   - Re-run `setup-env-helper.sh`

4. **Review environment variables**
   ```bash
   cd apps/main && vercel env ls
   ```

## 📊 What Gets Automated

✅ **Fully Automated**:
- Project creation and linking
- Environment variable addition (with helper script)
- Multi-environment configuration
- Credential extraction from JSON

⚠️ **Semi-Automated** (requires confirmation):
- Firebase credential setup (interactive)
- JSON file cleanup (prompted)

❌ **Manual Only** (Vercel API limitations):
- GitHub integration
- Custom domain addition
- DNS configuration
- Domain verification

## 🎯 Success Indicators

After running scripts successfully:

```bash
# All projects should be listed
vercel project ls | grep ainexsuite

# Each app should have .vercel/project.json
find apps -name "project.json" -path "*/.vercel/*"

# Environment variables should be set
cd apps/main && vercel env ls
# Should show 11 variables across 3 environments
```

## 💡 Tips

1. **Run in order**: setup-vercel-projects.sh → setup-env-helper.sh → manual steps

2. **Test one app first**: Verify environment variables work before configuring all apps

3. **Use Vercel CLI**: Faster than dashboard for many operations

4. **Keep credentials secure**: Use password manager or secure note for Firebase credentials

5. **Monitor deployments**: Check Vercel dashboard for build status after GitHub connection

---

**Ready to deploy?** Start with `./scripts/setup-env-helper.sh`
