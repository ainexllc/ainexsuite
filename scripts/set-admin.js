#!/usr/bin/env node
/**
 * Set admin role for a user in Firestore
 * Usage: node scripts/set-admin.js <user-uid>
 *
 * You can find your UID in the Firebase Console under Authentication > Users
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin with service account
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, '..', 'service-account.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (err) {
  console.error('Error: Could not load service account credentials.');
  console.error('Make sure you have a service-account.json file in the project root');
  console.error('or set GOOGLE_APPLICATION_CREDENTIALS environment variable.');
  console.error('\nTo get a service account key:');
  console.error('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.error('2. Click "Generate new private key"');
  console.error('3. Save as service-account.json in project root');
  process.exit(1);
}

const db = admin.firestore();

async function setAdmin(uid) {
  if (!uid) {
    console.error('Usage: node scripts/set-admin.js <user-uid>');
    console.error('\nTo find your UID:');
    console.error('1. Go to Firebase Console > Authentication > Users');
    console.error('2. Find your user and copy the User UID');
    process.exit(1);
  }

  try {
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      // Update existing document
      await userRef.update({ role: 'admin' });
      console.log(`✓ Updated user ${uid} with admin role`);
    } else {
      // Create new document with admin role
      await userRef.set({ role: 'admin' }, { merge: true });
      console.log(`✓ Created user ${uid} with admin role`);
    }

    console.log('\nYou can now access admin features in the Admin app.');
  } catch (err) {
    console.error('Error setting admin role:', err.message);
    process.exit(1);
  }

  process.exit(0);
}

const uid = process.argv[2];
setAdmin(uid);
