import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
  type Analytics,
} from "firebase/analytics";
import { firebaseClientConfig } from "@/env";

let app: FirebaseApp | undefined;
let authPromise: Promise<Auth> | null = null;
let firestoreInstance: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (app) {
    return app;
  }

  if (!getApps().length) {
    app = initializeApp(firebaseClientConfig);
  } else {
    app = getApp();
  }

  return app;
}

export async function getFirebaseAuth(): Promise<Auth> {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseAuth can only be used in the browser.");
  }

  if (!authPromise) {
    authPromise = (async () => {
      const firebaseApp = getFirebaseApp();
      const auth = getAuth(firebaseApp);
      await setPersistence(auth, browserLocalPersistence);
      return auth;
    })();
  }

  return authPromise;
}

export function getFirebaseFirestore(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = initializeFirestore(getFirebaseApp(), {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  }

  return firestoreInstance;
}

export function getFirebaseStorage(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}

export async function initAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const supported = await isAnalyticsSupported();

  if (!supported) {
    return null;
  }

  return getAnalytics(getFirebaseApp());
}
