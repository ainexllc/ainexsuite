# Environment Variables Reference

Complete reference for all environment variables used in AiNex Next.js applications.

## Overview

**What You'll Learn:**
- Firebase configuration variables
- Vercel environment setup
- Local vs. production environments
- Security best practices
- Troubleshooting environment issues

**Time Required:** ~5 minutes to set up

---

## Required Variables

### Firebase Configuration

These variables connect your app to Firebase services (Authentication, Firestore, Storage).

#### `NEXT_PUBLIC_FIREBASE_API_KEY`
- **Type:** String
- **Required:** Yes
- **Visibility:** Client-side (public)
- **Example:** `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Where to Find:** Firebase Console → Project Settings → Your apps → Firebase SDK snippet
- **Purpose:** Authenticates your app with Firebase services

**Security Note:** Despite being public, this key is safe to expose. Firebase security rules protect your data, not the API key.

#### `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- **Type:** String
- **Required:** Yes
- **Visibility:** Client-side (public)
- **Example:** `your-project.firebaseapp.com`
- **Where to Find:** Firebase Console → Project Settings → Your apps
- **Purpose:** Domain for Firebase Authentication

#### `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- **Type:** String
- **Required:** Yes
- **Visibility:** Client-side (public)
- **Example:** `your-project-id-12345`
- **Where to Find:** Firebase Console → Project Settings
- **Purpose:** Unique identifier for your Firebase project

#### `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- **Type:** String
- **Required:** Yes (if using Firebase Storage)
- **Visibility:** Client-side (public)
- **Example:** `your-project.appspot.com`
- **Where to Find:** Firebase Console → Project Settings → Your apps
- **Purpose:** Cloud Storage bucket for file uploads

#### `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- **Type:** String
- **Required:** Yes
- **Visibility:** Client-side (public)
- **Example:** `123456789012`
- **Where to Find:** Firebase Console → Project Settings → Your apps → Cloud Messaging
- **Purpose:** Firebase Cloud Messaging sender identification

#### `NEXT_PUBLIC_FIREBASE_APP_ID`
- **Type:** String
- **Required:** Yes
- **Visibility:** Client-side (public)
- **Example:** `1:123456789012:web:abcdef123456`
- **Where to Find:** Firebase Console → Project Settings → Your apps
- **Purpose:** Unique identifier for your Firebase web app

---

## Optional Variables

### Firebase Emulator Configuration (Development Only)

Use these variables when running Firebase emulators locally for development.

#### `NEXT_PUBLIC_USE_FIREBASE_EMULATOR`
- **Type:** Boolean (string "true" or "false")
- **Required:** No
- **Default:** `false`
- **Visibility:** Client-side (public)
- **Example:** `true`
- **Purpose:** Enables Firebase emulator mode
- **When to Use:** Local development with Firebase emulators

#### `NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST`
- **Type:** String
- **Required:** Only if using Firestore emulator
- **Default:** N/A
- **Visibility:** Client-side (public)
- **Example:** `localhost:8080`
- **Purpose:** Firestore emulator host and port
- **When to Use:** Running `firebase emulators:start`

#### `NEXT_PUBLIC_AUTH_EMULATOR_URL`
- **Type:** String
- **Required:** Only if using Auth emulator
- **Default:** N/A
- **Visibility:** Client-side (public)
- **Example:** `http://localhost:9099`
- **Purpose:** Authentication emulator URL
- **When to Use:** Testing auth flows locally without production Firebase

---

## Environment Files

### `.env.local` (Local Development)

**Purpose:** Development environment variables for your local machine

**Location:** Project root (never commit to Git)

**Example:**
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Firebase Emulators (optional - uncomment to use)
# NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
# NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=localhost:8080
# NEXT_PUBLIC_AUTH_EMULATOR_URL=http://localhost:9099
```

**Usage:**
```bash
# Create from example
cp .env.example .env.local

# Edit with your values
nano .env.local  # or use your preferred editor
```

### `.env.example` (Template)

**Purpose:** Template file showing required environment variables

**Location:** Project root (commit to Git)

**Example:**
```env
# Firebase Configuration
# Get these values from: Firebase Console → Project Settings → Your apps
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Emulators (Development Only)
# NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
# NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=localhost:8080
# NEXT_PUBLIC_AUTH_EMULATOR_URL=http://localhost:9099
```

### `.env.production` (Production - Optional)

**Purpose:** Production-specific variables (alternative to Vercel dashboard)

**Location:** Project root (never commit to Git)

**Note:** Vercel environment variables (set via dashboard or CLI) take precedence over this file in production.

---

## Setting Environment Variables

### Local Development

**Step 1: Create `.env.local`**
```bash
cd ~/ainex/your-app
touch .env.local
```

**Step 2: Add Firebase Config**
1. Go to Firebase Console → Project Settings → Your apps
2. Copy the `firebaseConfig` object values
3. Add to `.env.local` with `NEXT_PUBLIC_` prefix

**Step 3: Restart Dev Server**
```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

**Verification:**
```typescript
// Check if variables load
console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
// Should NOT be undefined
```

### Vercel Deployment

**Option A: Via Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. For each variable:
   - **Key:** `NEXT_PUBLIC_FIREBASE_API_KEY`
   - **Value:** Your actual value
   - **Environment:** Check all (Production, Preview, Development)
   - Click **Save**

**Option B: Via Vercel CLI**

```bash
# Set environment variable
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY

# Prompts:
# - Value: [paste your API key]
# - Environments: Select all

# Repeat for each variable
```

**Step: Redeploy**

Environment variables only apply to new deployments:
```bash
# Option 1: Push to GitHub (triggers auto-deploy)
git push origin main

# Option 2: Deploy via CLI
vercel --prod

# Option 3: Redeploy from dashboard
# Deployments → ⋯ → Redeploy
```

### Firebase Hosting

If deploying to Firebase Hosting, environment variables are baked into the build:

```bash
# Build with environment variables
npm run build

# Deploy
firebase deploy --only hosting
```

**Important:** Firebase Hosting serves static files. All `NEXT_PUBLIC_` variables are compiled into the bundle at build time.

---

## Variable Naming Conventions

### `NEXT_PUBLIC_` Prefix

**Why it's required:**
- Next.js only exposes variables with `NEXT_PUBLIC_` prefix to the browser
- Variables without this prefix are server-side only
- Firebase config must be client-accessible (browser needs it)

**Example:**
```env
# ✅ CORRECT - Accessible in browser
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...

# ❌ WRONG - Not accessible in browser
FIREBASE_API_KEY=AIza...
```

**In Code:**
```typescript
// ✅ Works
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// ❌ Undefined in browser
const apiKey = process.env.FIREBASE_API_KEY;
```

### Server-Side Only Variables

For sensitive data that should never reach the browser (API secrets, private keys):

```env
# No NEXT_PUBLIC_ prefix
STRIPE_SECRET_KEY=sk_live_...
DATABASE_PASSWORD=super_secret
```

**Usage (server-side only):**
```typescript
// app/api/route.ts (API route - server-side)
const secret = process.env.STRIPE_SECRET_KEY;  // ✅ Works

// components/MyComponent.tsx (client component)
const secret = process.env.STRIPE_SECRET_KEY;  // ❌ Undefined
```

---

## Security Best Practices

### 1. Never Commit Secrets

**Wrong:**
```bash
# ❌ DON'T DO THIS
git add .env.local
git commit -m "Add environment variables"
```

**Correct:**
```bash
# ✅ .env.local is in .gitignore
# Only commit .env.example
git add .env.example
git commit -m "Update environment template"
```

### 2. Use `.gitignore`

Verify `.gitignore` includes:
```
# local env files
.env*.local
.env
.env.production
.env.development

# Keep .env.example
!.env.example
```

### 3. Rotate Keys Regularly

If you suspect a key is compromised:

1. **Firebase:**
   - Go to Firebase Console → Project Settings → Service accounts
   - Generate new keys
   - Update environment variables
   - Revoke old keys

2. **Vercel:**
   ```bash
   # Update variable
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
   # Override existing value

   # Redeploy
   vercel --prod
   ```

### 4. Separate Environments

**Development:**
- Use separate Firebase project for development
- Different API keys
- Test with emulators

**Production:**
- Dedicated Firebase project
- Production-grade security rules
- Monitor usage and quota

### 5. Never Hardcode Values

**Wrong:**
```typescript
// ❌ NEVER hardcode config
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "my-project.firebaseapp.com",
};
```

**Correct:**
```typescript
// ✅ Use environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
};
```

---

## Troubleshooting

### Variables Not Loading

**Symptom:** `process.env.NEXT_PUBLIC_FIREBASE_API_KEY` is `undefined`

**Solutions:**

1. **Check file name:**
   ```bash
   # File must be exactly .env.local (not .env.local.txt)
   ls -la | grep env
   ```

2. **Check variable prefix:**
   ```env
   # ✅ CORRECT
   NEXT_PUBLIC_FIREBASE_API_KEY=...

   # ❌ WRONG - Missing NEXT_PUBLIC_
   FIREBASE_API_KEY=...
   ```

3. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

4. **Check for quotes:**
   ```env
   # ✅ CORRECT - No quotes
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB...

   # ❌ WRONG - Don't use quotes
   NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyB..."
   ```

### Build Fails on Vercel

**Symptom:** Vercel build fails with "Firebase not initialized"

**Solution:**
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Verify ALL Firebase variables are set
3. Ensure variables are enabled for "Production" environment
4. Redeploy

### Variables Not Updating

**Symptom:** Changed variable but app still uses old value

**Solutions:**

1. **Local:**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run dev
   ```

2. **Vercel:**
   ```bash
   # Redeploy to pick up new variables
   vercel --prod
   ```

3. **Firebase Hosting:**
   ```bash
   # Rebuild and redeploy
   npm run build
   firebase deploy --only hosting
   ```

### Emulator Variables Not Working

**Symptom:** App connects to production Firebase instead of emulators

**Solution:**
```env
# Make sure ALL emulator variables are set
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=localhost:8080
NEXT_PUBLIC_AUTH_EMULATOR_URL=http://localhost:9099
```

**Verify in code:**
```typescript
// lib/firebase.ts
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
  console.log("Using Firebase Emulators");
  // Connect to emulators
} else {
  console.log("Using Production Firebase");
}
```

---

## Environment Cheat Sheet

### Quick Setup

```bash
# 1. Copy template
cp .env.example .env.local

# 2. Get Firebase config
# Firebase Console → Project Settings → Your apps

# 3. Add to .env.local
# Replace all placeholder values

# 4. Restart dev server
npm run dev

# 5. Verify
# Open browser DevTools → Console
# Should see Firebase initialized without errors
```

### Essential Commands

```bash
# Local development
npm run dev                    # Uses .env.local

# Build (uses current environment)
npm run build

# Vercel CLI
vercel env ls                  # List all variables
vercel env add                 # Add new variable
vercel env pull .env.vercel    # Download to local file
vercel env rm                  # Remove variable

# Test if variables load
node -e "require('dotenv').config({ path: '.env.local' }); console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)"
```

### Template File

**.env.local** (create this, never commit):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

---

## Next Steps

- [Local Development →](./local-development.md) - Set up dev environment
- [Firebase Setup →](./firebase-setup.md) - Configure Firebase project
- [Vercel Deployment →](./vercel-deployment.md) - Deploy to production

---

## Quick Reference

**Required for All Environments:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Optional for Development:**
- `NEXT_PUBLIC_USE_FIREBASE_EMULATOR`
- `NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST`
- `NEXT_PUBLIC_AUTH_EMULATOR_URL`

**Important Files:**
- `.env.local` - Local variables (don't commit)
- `.env.example` - Template (commit this)
- `.gitignore` - Prevents committing secrets

**Common Issues:**
- Missing `NEXT_PUBLIC_` prefix → Variable undefined in browser
- Forgot to restart dev server → Old values cached
- Quotes around values → May cause issues
- Wrong file name → `.env.local.txt` won't work
