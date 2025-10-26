/**
 * Firebase client SDK initialization
 * Use this in Next.js apps (client-side)
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | undefined;

export function initializeFirebase() {
  // Only initialize if not already initialized
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Analytics only works in browser
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }

  return { app, auth, db, storage, analytics };
}

// Initialize immediately
const firebase = initializeFirebase();

export { firebase, app, auth, db, storage, analytics };
