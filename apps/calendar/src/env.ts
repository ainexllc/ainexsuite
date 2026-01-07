import { firebaseConfig as defaultFirebaseConfig } from "@ainexsuite/firebase";

export const clientEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? defaultFirebaseConfig.apiKey ?? "",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    defaultFirebaseConfig.authDomain ??
    "",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
    defaultFirebaseConfig.projectId ??
    "",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    defaultFirebaseConfig.storageBucket ??
    "",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
    defaultFirebaseConfig.messagingSenderId ??
    "",
  NEXT_PUBLIC_FIREBASE_APP_ID:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? defaultFirebaseConfig.appId ?? "",
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ??
    defaultFirebaseConfig.measurementId ??
    "",
} as const;

export const serverEnv = {
  FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID ?? "",
  FIREBASE_ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? "",
  FIREBASE_ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "",
  FIREBASE_ADMIN_DATABASE_URL: process.env.FIREBASE_ADMIN_DATABASE_URL ?? "",
  GROK_API_KEY: process.env.GROK_API_KEY ?? "",
} as const;

export const firebaseClientConfig = {
  apiKey: clientEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: clientEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: clientEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: clientEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: clientEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: clientEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: clientEnv.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined,
};
