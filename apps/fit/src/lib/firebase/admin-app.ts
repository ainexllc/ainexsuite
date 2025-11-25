import type { AppOptions } from "firebase-admin";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { serverEnv, clientEnv } from "@/env";

let adminAppInitialized = false;

function getAdminOptions(): AppOptions {
  // Debug: Log what credentials we have
  console.log('[admin-app] Checking Firebase Admin env vars:', {
    hasProjectId: !!serverEnv.FIREBASE_ADMIN_PROJECT_ID,
    projectId: serverEnv.FIREBASE_ADMIN_PROJECT_ID,
    hasClientEmail: !!serverEnv.FIREBASE_ADMIN_CLIENT_EMAIL,
    clientEmail: serverEnv.FIREBASE_ADMIN_CLIENT_EMAIL,
    hasPrivateKey: !!serverEnv.FIREBASE_ADMIN_PRIVATE_KEY,
    privateKeyLength: serverEnv.FIREBASE_ADMIN_PRIVATE_KEY?.length,
    privateKeyStart: serverEnv.FIREBASE_ADMIN_PRIVATE_KEY?.substring(0, 30),
    privateKeyEnd: serverEnv.FIREBASE_ADMIN_PRIVATE_KEY?.substring(-30),
  });

  if (
    !serverEnv.FIREBASE_ADMIN_PROJECT_ID ||
    !serverEnv.FIREBASE_ADMIN_CLIENT_EMAIL ||
    !serverEnv.FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    throw new Error(
      "Firebase admin environment variables are missing. Populate FIREBASE_ADMIN_* in .env.local to enable secure server features.",
    );
  }

  const privateKey = serverEnv.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n");
  console.log('[admin-app] Private key after replacement - starts with:', privateKey.substring(0, 30));
  console.log('[admin-app] Private key after replacement - ends with:', privateKey.substring(privateKey.length - 30));
  console.log('[admin-app] Private key contains actual newlines:', privateKey.includes('\n'));

  return {
    credential: cert({
      projectId: serverEnv.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: serverEnv.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
    storageBucket: clientEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    projectId: clientEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    databaseURL: serverEnv.FIREBASE_ADMIN_DATABASE_URL,
  };
}

export function getAdminApp() {
  if (!adminAppInitialized) {
    const apps = getApps();

    if (!apps.length) {
      initializeApp(getAdminOptions());
    }

    adminAppInitialized = true;
  }

  return getApps()[0]!;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}

export function getAdminStorage() {
  return getStorage(getAdminApp());
}
