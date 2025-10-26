# Firebase Setup Guide

Complete guide to setting up Firebase for authentication, Firestore database, and hosting for your AiNex application.

## Overview

**What You'll Set Up:**
- Firebase project and web app
- Google Authentication provider
- Email/Password authentication
- Cloud Firestore database
- Security rules and indexes
- Firebase Hosting (optional)

**Time Required:** ~20 minutes

---

## Step 1: Create Firebase Project

### 1.1 Access Firebase Console

Go to **https://console.firebase.google.com**

Sign in with your Google account.

### 1.2 Create New Project

1. Click **"Add project"** or **"Create a project"**

2. **Project name:** Enter your app name (e.g., "TaskNex", "HabitNex")
   - Firebase will generate a unique project ID (e.g., `tasknex-a1b2c`)

3. **Google Analytics:**
   - Toggle ON (recommended for production apps)
   - Toggle OFF (for quick testing/development)
   - Click **Continue**

4. **Analytics Configuration** (if enabled):
   - Select existing account or create new
   - Click **Create project**

5. Wait for project to be created (~30 seconds)

6. Click **Continue** when ready

---

## Step 2: Register Web App

### 2.1 Add Web App

1. In Firebase Console, click the **web icon** (`</>`) to add a web app

2. **App nickname:** Enter a descriptive name (e.g., "TaskNex Web App")

3. **Firebase Hosting:**
   - Check this box if you plan to deploy on Firebase Hosting
   - Leave unchecked if deploying to Vercel

4. Click **Register app**

### 2.2 Get Firebase Config

You'll see your Firebase configuration object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**Important:** Keep this open - you'll need these values for `.env.local`

Click **Continue to console**

---

## Step 3: Configure Authentication

### 3.1 Enable Authentication

1. In left sidebar, click **Build** → **Authentication**

2. Click **Get started**

3. You'll see the **Sign-in method** tab

### 3.2 Enable Google Sign-In

1. Click **Google** from the provider list

2. Toggle **Enable** to ON

3. **Project support email:** Select your email from dropdown

4. **Project public-facing name:** Enter your app name (e.g., "TaskNex")
   - This is what users see during Google sign-in

5. Click **Save**

### 3.3 Enable Email/Password Sign-In

1. Click **Email/Password** from provider list

2. Toggle **Enable** to ON

3. Leave "Email link (passwordless sign-in)" disabled for now

4. Click **Save**

### 3.4 Configure Authorized Domains

1. Still in **Authentication**, click **Settings** tab

2. Scroll to **Authorized domains** section

3. By default, you'll see:
   - `localhost`
   - `your-app.firebaseapp.com`

4. **Add custom domain** (if you have one):
   - Click **Add domain**
   - Enter your domain (e.g., `tasknex.com`)
   - Click **Add**

**For local development:** `localhost` must be in this list.

---

## Step 4: Set Up Cloud Firestore

### 4.1 Create Firestore Database

1. In left sidebar, click **Build** → **Firestore Database**

2. Click **Create database**

3. **Select location:**
   - Choose region closest to your users
   - Recommended: `us-east1` (US East), `us-central1` (US Central), `europe-west1` (Belgium)
   - **Warning:** Cannot change location after creation

4. Click **Next**

5. **Security rules:** Select **Start in production mode**
   - Don't worry, we'll set up proper rules next
   - Click **Create**

6. Wait for database to provision (~1 minute)

### 4.2 Set Up Security Rules

1. In Firestore Database page, click **Rules** tab

2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User document - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // User subcollections (notes, habits, tasks, etc.)
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Shared/public collections (if needed)
    match /public/{document=**} {
      allow read: if request.auth != null;
    }
  }
}
```

**What these rules do:**
- Users can only access their own data under `/users/{userId}/`
- All subcollections under a user document inherit these permissions
- Public collections are read-only for authenticated users

3. Click **Publish**

### 4.3 Create Indexes

1. Click **Indexes** tab

2. For now, leave this empty - Firebase will suggest indexes when you run queries

**Later:** When you run queries that need composite indexes, Firebase will show an error with a link to create the index. Click that link and Firebase will auto-create it.

**Manual index creation:**
```bash
# After setting up Firebase CLI
firebase deploy --only firestore:indexes
```

---

## Step 5: Configure OAuth for Google Sign-In

### 5.1 Access Google Cloud Console

1. Go to **https://console.cloud.google.com**

2. Select your Firebase project from the dropdown (top left)
   - It should be named the same as your Firebase project

### 5.2 Configure OAuth Consent Screen

1. In left sidebar, navigate to **APIs & Services** → **OAuth consent screen**

2. **User Type:** Select **External** (unless you have a Google Workspace)

3. Click **Create**

4. **App information:**
   - **App name:** Your app name (e.g., "TaskNex")
   - **User support email:** Your email
   - **App logo:** Optional (can add later)

5. **App domain:**
   - **Application home page:** Your production URL (or leave blank)
   - **Authorized domains:** Add your domain (e.g., `tasknex.com`)

6. **Developer contact information:** Your email

7. Click **Save and Continue**

8. **Scopes:** Click **Save and Continue** (use defaults)

9. **Test users:**
   - Add your email and any test user emails
   - Click **Save and Continue**

10. **Summary:** Review and click **Back to Dashboard**

### 5.3 Create OAuth 2.0 Client ID

1. In left sidebar, go to **APIs & Services** → **Credentials**

2. Click **Create Credentials** → **OAuth client ID**

3. **Application type:** Select **Web application**

4. **Name:** Enter a name (e.g., "TaskNex Web Client")

5. **Authorized JavaScript origins:**
   - Click **Add URI** and add:
     - `http://localhost:3000` (or your dev port)
     - `http://localhost:3001` (if using multiple ports)
     - `https://your-app.firebaseapp.com` (your Firebase domain)
     - `https://your-custom-domain.com` (if you have one)
     - `https://your-app.vercel.app` (if deploying to Vercel)

6. **Authorized redirect URIs:**
   - Click **Add URI** and add:
     - `http://localhost:3000/__/auth/handler`
     - `http://localhost:3001/__/auth/handler` (if using port 3001)
     - `https://your-app.firebaseapp.com/__/auth/handler`
     - `https://your-custom-domain.com/__/auth/handler`
     - `https://your-app.vercel.app/__/auth/handler`

   **Important:** The `/__/auth/handler` suffix is required for Firebase Auth

7. Click **Create**

8. **OAuth client created:**
   - You'll see your Client ID and Client Secret
   - Click **OK** (Firebase handles these automatically)

### 5.4 Update Firebase with OAuth Client

Firebase should automatically detect the OAuth client. To verify:

1. Go back to **Firebase Console** → **Authentication** → **Sign-in method**

2. Click on **Google** provider

3. **Web SDK configuration:**
   - Should show your Client ID automatically
   - If not, copy Client ID from Google Cloud Console and paste here

4. Click **Save**

---

## Step 6: Set Up Environment Variables

### 6.1 Get Firebase Config Values

1. In Firebase Console, click the **gear icon** (⚙️) → **Project settings**

2. Scroll down to **Your apps** section

3. Find your web app and click the **config** icon (`</>`)

4. Copy the `firebaseConfig` object

### 6.2 Create `.env.local` File

In your project root, create `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-app-12345
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**Replace values** with your actual Firebase config values.

**Important:**
- Use `NEXT_PUBLIC_` prefix for client-side variables
- Don't use quotes around values
- Don't commit `.env.local` to Git (it's in `.gitignore`)

### 6.3 Create `.env.example` Template

For team members, create `.env.example`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Commit this file** to Git so others know what variables are needed.

---

## Step 7: Initialize Firebase CLI

### 7.1 Install Firebase CLI

```bash
# Install globally
npm install -g firebase-tools

# Verify installation
firebase --version
```

### 7.2 Login to Firebase

```bash
firebase login
```

This will:
1. Open browser for authentication
2. Ask for permissions
3. Confirm login in terminal

### 7.3 Initialize Firebase in Project

In your project directory:

```bash
firebase init
```

**Select features:**
- [ ] Realtime Database (not needed, we use Firestore)
- [x] Firestore (select this)
- [ ] Functions (optional, not needed initially)
- [x] Hosting (select if deploying on Firebase)
- [x] Storage (select if using file uploads)
- [ ] Emulators (optional, recommended for local testing)

**Firestore setup:**
1. **Use existing project:** Select your Firebase project from list
2. **Firestore rules:** `firestore.rules` (default)
3. **Firestore indexes:** `firestore.indexes.json` (default)

**Hosting setup** (if selected):
1. **Public directory:** Enter `out` (for Next.js static export)
2. **Configure as single-page app:** Yes
3. **Set up automatic builds:** No (we'll use Vercel or manual builds)
4. **Overwrite files:** No

### 7.4 Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

---

## Step 8: Test Firebase Connection

### 8.1 Start Your App

```bash
npm run dev
```

### 8.2 Test Authentication

1. Open http://localhost:3000

2. Click **Sign in with Google**

3. **Expected behavior:**
   - Google sign-in popup appears
   - You authorize the app
   - You're redirected back and signed in
   - User data is stored in Firestore under `/users/{userId}`

### 8.3 Check Firestore Data

1. Go to Firebase Console → Firestore Database

2. You should see a new document under `users` collection:
   ```
   users/
     {userId}/
       email: "you@example.com"
       displayName: "Your Name"
       photoURL: "https://..."
       createdAt: timestamp
   ```

### 8.4 Test Email/Password Auth

1. Click **Sign up with email**

2. Enter email and password

3. **Expected behavior:**
   - Account created in Firebase Authentication
   - User document created in Firestore
   - Signed in automatically

### 8.5 Verify Authentication Users

1. Go to Firebase Console → Authentication → Users

2. You should see your test accounts listed

---

## Step 9: Set Up Firebase Hosting (Optional)

### 9.1 Configure Next.js for Static Export

Update `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Enable static export
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
```

### 9.2 Configure Firebase Hosting

Create or update `firebase.json`:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 9.3 Build and Deploy

```bash
# Build Next.js app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

**Your app will be live at:**
- `https://your-project-id.web.app`
- `https://your-project-id.firebaseapp.com`

---

## Troubleshooting

### Google Auth Popup Blocked

**Issue:** Browser blocks authentication popup

**Solution:**
1. Add `http://localhost:3000` to authorized domains in Firebase Console
2. Use redirect method instead of popup:

```typescript
// lib/auth.ts
const isLocalhost = typeof window !== 'undefined' &&
  window.location.hostname === 'localhost';

if (isLocalhost) {
  await signInWithRedirect(auth, provider); // Use redirect on localhost
} else {
  await signInWithPopup(auth, provider);
}
```

### "Invalid Origin" Error

**Issue:** OAuth redirect URI not authorized

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Edit OAuth 2.0 Client ID
3. Add your origin to "Authorized JavaScript origins"
4. Add redirect URI: `{your-origin}/__/auth/handler`

### Firestore Permission Denied

**Issue:** Can't read/write to Firestore

**Possible causes:**
1. **Not authenticated:** Make sure user is signed in
2. **Wrong userId:** Verify `request.auth.uid` matches document path
3. **Rules not deployed:** Run `firebase deploy --only firestore:rules`

**Debug:**
```javascript
// Check auth state
console.log('Auth user:', auth.currentUser);

// Check Firestore path
console.log('Writing to:', `users/${userId}/notes/${noteId}`);
```

### Missing Indexes Error

**Issue:** Firestore query fails with "index required" error

**Solution:**
Firebase provides a link in the error message. Click it to auto-create the index.

**Or manually create:**
1. Go to Firebase Console → Firestore → Indexes
2. Click **Add index**
3. Configure collection and fields
4. Click **Create**

### Environment Variables Not Loading

**Check:**
1. File named exactly `.env.local` (not `.env.local.txt`)
2. Variables prefixed with `NEXT_PUBLIC_`
3. No quotes around values
4. Restart dev server after adding variables

---

## Security Best Practices

### 1. Never Expose Service Account Keys

**Don't do this:**
```env
# ❌ WRONG - Never put service account JSON in .env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account"...}
```

**Do this instead:**
- Use Firebase client SDK (only needs public config)
- For server-side: Use environment variables or Secret Manager

### 2. Use Security Rules

**Don't do this:**
```javascript
// ❌ WRONG - Allows anyone to read/write everything
match /{document=**} {
  allow read, write;
}
```

**Do this:**
```javascript
// ✅ CORRECT - User-specific access
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}
```

### 3. Validate Input

**Don't do this:**
```javascript
// ❌ WRONG - No validation
match /users/{userId}/notes/{noteId} {
  allow create: if request.auth.uid == userId;
}
```

**Do this:**
```javascript
// ✅ CORRECT - Validate data
match /users/{userId}/notes/{noteId} {
  allow create: if request.auth.uid == userId
    && request.resource.data.title is string
    && request.resource.data.title.size() <= 200;
}
```

### 4. Use Billing Alerts

1. Go to Firebase Console → Settings (gear icon) → Usage and billing
2. Set up budget alerts to avoid surprise charges
3. Start with generous limits, adjust as needed

---

## Next Steps

- [Environment Variables →](./environment-variables.md) - Complete variable reference
- [Local Development →](./local-development.md) - Set up dev environment
- [Vercel Deployment →](./vercel-deployment.md) - Deploy to production

---

## Quick Reference

**Firebase Console URLs:**
- Main Console: https://console.firebase.google.com
- Google Cloud Console: https://console.cloud.google.com
- OAuth Consent Screen: https://console.cloud.google.com/apis/credentials/consent

**Essential Commands:**
```bash
firebase login                          # Login to Firebase
firebase init                           # Initialize Firebase in project
firebase deploy --only firestore:rules  # Deploy security rules
firebase deploy --only firestore:indexes # Deploy indexes
firebase deploy --only hosting          # Deploy to Firebase Hosting
firebase emulators:start                # Start local emulators
```

**Key Files:**
- `firebase.json` - Firebase configuration
- `firestore.rules` - Security rules
- `firestore.indexes.json` - Composite indexes
- `.env.local` - Environment variables (local only)
- `.env.example` - Environment template (commit to Git)

**Security Rules Location:**
Firebase Console → Firestore Database → Rules tab
