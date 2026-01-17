/**
 * Firebase Admin SDK initialization
 * Use this in Cloud Functions and server-side code
 */

import * as admin from 'firebase-admin';
import { firebaseConfig } from '../config';

let app: admin.app.App;

/**
 * Get Admin SDK credential from environment variables
 */
function getAdminCredential(): admin.credential.Credential | undefined {
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || firebaseConfig.projectId;

  if (clientEmail && privateKey) {
    return admin.credential.cert({
      projectId,
      clientEmail,
      // Handle escaped newlines in the private key
      privateKey: privateKey.replace(/\\n/g, '\n'),
    });
  }

  return undefined;
}

export function initializeAdmin(): {
  app: admin.app.App;
  auth: admin.auth.Auth;
  db: admin.firestore.Firestore;
  storage: admin.storage.Storage;
} {
  if (!admin.apps.length) {
    const credential = getAdminCredential();

    app = admin.initializeApp({
      projectId: firebaseConfig.projectId,
      ...(credential && { credential }),
      storageBucket: firebaseConfig.storageBucket,
    });
  } else {
    app = admin.apps[0] as admin.app.App;
  }

  return {
    app,
    auth: admin.auth(),
    db: admin.firestore(),
    storage: admin.storage(),
  };
}

// Initialize immediately
const adminFirebase = initializeAdmin();

export { adminFirebase, app };
export const auth: admin.auth.Auth = adminFirebase.auth;
export const db: admin.firestore.Firestore = adminFirebase.db;
export const storage: admin.storage.Storage = adminFirebase.storage;
export default admin;

// Export Stripe utilities
export * from './stripe';

// Export bot avatars admin utilities
export * from './bot-avatars';
