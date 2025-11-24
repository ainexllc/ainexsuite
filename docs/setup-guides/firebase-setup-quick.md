# Firebase Setup - Quick Reference

## Prerequisites
- Google account
- Firebase CLI: `npm install -g firebase-tools`

## 1. Create Project
```bash
# Visit console.firebase.google.com
# Create new project → Enable Google Analytics (optional)
```

## 2. Register Web App
- Project Overview → Add app → Web (</>) icon
- Register app name → Copy config
- Add Firebase SDK via npm:
  ```bash
  npm install firebase
  ```

## 3. Enable Authentication
**Console**: Build → Authentication → Get Started

**Providers to Enable**:
- Google: Enable → Save
- Email/Password: Enable → Save

## 4. Create Firestore Database
**Console**: Build → Firestore Database → Create

**Settings**:
- Production mode (recommended)
- Location: `us-central1` or closest region
- Security rules: Update via CLI or console

## 5. Configure Security Rules
```bash
# Deploy rules from local
firebase deploy --only firestore:rules

# Or edit in console:
# Firestore Database → Rules
```

## 6. Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 7. Initialize Firebase in App
```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

## Common Commands
```bash
# Login to Firebase
firebase login

# Initialize project
firebase init

# Deploy rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# Deploy hosting
firebase deploy --only hosting
```

## Troubleshooting
- **Auth errors**: Check OAuth redirect URIs in Google Cloud Console
- **Firestore errors**: Verify security rules allow authenticated access
- **Missing indexes**: Deploy from `firestore.indexes.json`

For detailed setup, see `firebase-setup.md`
