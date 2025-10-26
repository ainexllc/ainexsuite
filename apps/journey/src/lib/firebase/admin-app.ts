import type { AppOptions } from "firebase-admin";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { serverEnv, clientEnv } from "@/env";

let adminAppInitialized = false;

function getAdminOptions(): AppOptions {
  if (
    !serverEnv.FIREBASE_ADMIN_PROJECT_ID ||
    !serverEnv.FIREBASE_ADMIN_CLIENT_EMAIL ||
    !serverEnv.FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    throw new Error(
      "Firebase admin environment variables are missing. Populate FIREBASE_ADMIN_* in .env.local to enable secure server features.",
    );
  }

  return {
    credential: cert({
      projectId: serverEnv.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: serverEnv.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: serverEnv.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
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
