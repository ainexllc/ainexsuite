import type { AppOptions } from "firebase-admin";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { firebaseConfig } from "@ainexsuite/firebase/config";

let adminAppInitialized = false;

/**
 * Normalizes a Firebase private key to ensure proper formatting.
 * Handles various edge cases:
 * - Keys with literal \n strings that need conversion to actual newlines
 * - Keys that already have actual newlines
 * - Keys with surrounding quotes (single or double)
 * - Keys with extra whitespace
 */
function normalizePrivateKey(rawKey: string): string {
  // Step 1: Trim whitespace
  let key = rawKey.trim();

  // Step 2: Remove surrounding quotes if present (single or double)
  if ((key.startsWith('"') && key.endsWith('"')) ||
      (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }

  // Step 3: Convert literal \n strings to actual newlines
  // Only do this if the key doesn't already contain actual newlines
  if (!key.includes('\n') && key.includes('\\n')) {
    key = key.replace(/\\n/g, '\n');
  }

  // Step 4: Ensure proper PEM format with headers
  const BEGIN_MARKER = '-----BEGIN PRIVATE KEY-----';
  const END_MARKER = '-----END PRIVATE KEY-----';

  if (!key.includes(BEGIN_MARKER) || !key.includes(END_MARKER)) {
    throw new Error(
      'Invalid private key format: Missing PEM headers. ' +
      'Key must start with "-----BEGIN PRIVATE KEY-----" and end with "-----END PRIVATE KEY-----"'
    );
  }

  // Step 5: Normalize line breaks
  const lines = key.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length < 3) {
    throw new Error(
      'Invalid private key format: Key must have at least header, body, and footer lines'
    );
  }

  return lines.join('\n');
}

/**
 * Get Firebase Admin options with validated credentials.
 *
 * IMPORTANT: projectId is hardcoded from shared firebaseConfig to prevent
 * auth/argument-error "incorrect aud (audience)" errors during token verification.
 * The projectId MUST match the client's project ID (alnexsuite) for proper SSO.
 */
function getAdminOptions(): AppOptions {
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Firebase admin environment variables are missing. Populate FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY in .env.local to enable secure server features.",
    );
  }

  const normalizedPrivateKey = normalizePrivateKey(privateKey);

  // CRITICAL: Use the hardcoded projectId from shared config to ensure
  // token verification matches the client's project ID (alnexsuite).
  // This prevents auth/argument-error "incorrect aud (audience)" errors.
  const projectId = firebaseConfig.projectId; // Always "alnexsuite"

  return {
    credential: cert({
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: normalizedPrivateKey,
    }),
    storageBucket: firebaseConfig.storageBucket,
    projectId: projectId,
  };
}

/**
 * Get or initialize the Firebase Admin app instance.
 * Singleton pattern ensures only one instance is created.
 */
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

/**
 * Get Firebase Admin Auth instance.
 */
export function getAdminAuth() {
  return getAuth(getAdminApp());
}

/**
 * Get Firebase Admin Firestore instance.
 */
export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}

/**
 * Get Firebase Admin Storage instance.
 */
export function getAdminStorage() {
  return getStorage(getAdminApp());
}
