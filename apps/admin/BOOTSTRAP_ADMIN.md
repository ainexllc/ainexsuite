/**
 * BOOTSTRAP ADMIN USER SCRIPT
 * 
 * Since the Admin App is protected by role-based access control, no one can access it initially.
 * Use this script to manually promote a user to 'admin' role.
 * 
 * Usage:
 * 1. Ensure you are logged into the Firebase CLI.
 * 2. Run this script using ts-node or by compiling it.
 *    Alternative: Use the Firebase Console directly.
 * 
 * Manual Steps via Firebase Console:
 * 1. Go to Firestore Database.
 * 2. Find the 'users' collection.
 * 3. Locate your user document by UID.
 * 4. Add a new field:
 *    - Field: role
 *    - Type: string
 *    - Value: admin
 * 
 * Programmatic Way (if needed in future):
 * Run this in a cloud function or local admin script:
 * 
 * ```typescript
 * import { admin } from './firebase-admin'; // Your admin initialization
 * 
 * async function makeAdmin(uid: string) {
 *   await admin.firestore().collection('users').doc(uid).update({
 *     role: 'admin'
 *   });
 *   console.log(`User ${uid} is now an admin.`);
 * }
 * ```
 */

console.log("To bootstrap the first admin, please update your user document in Firestore manually:");
console.log("1. Go to Firebase Console > Firestore Database > users collection");
console.log("2. Find your document ID (UID)");
console.log("3. Add field 'role': 'admin'");
