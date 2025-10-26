/**
 * Firebase Admin SDK initialization
 * Use this in Cloud Functions and server-side code
 */

import * as admin from 'firebase-admin';
import { firebaseConfig } from '../config';

let app: admin.app.App;

export function initializeAdmin(): {
  app: admin.app.App;
  auth: admin.auth.Auth;
  db: admin.firestore.Firestore;
  storage: admin.storage.Storage;
} {
  if (!admin.apps.length) {
    app = admin.initializeApp({
      projectId: firebaseConfig.projectId,
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
