/**
 * Firebase Configuration and Initialization Template
 *
 * Initialize Firebase app and export auth, db, and storage instances.
 *
 * File: lib/firebase.ts
 */

import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {

  // Auth emulator
  if (process.env.NEXT_PUBLIC_AUTH_EMULATOR_URL) {
    const authUrl = new URL(process.env.NEXT_PUBLIC_AUTH_EMULATOR_URL);
    connectAuthEmulator(
      auth,
      `http://${authUrl.hostname}:${authUrl.port}`,
      { disableWarnings: true }
    );
  }

  // Firestore emulator
  if (process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST) {
    const [host, port] = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST.split(":");
    connectFirestoreEmulator(db, host, parseInt(port));
  }

  // Storage emulator (if needed)
  // const [storageHost, storagePort] = process.env.NEXT_PUBLIC_STORAGE_EMULATOR_HOST?.split(":") || [];
  // if (storageHost && storagePort) {
  //   connectStorageEmulator(storage, storageHost, parseInt(storagePort));
  // }
}

export default app;
