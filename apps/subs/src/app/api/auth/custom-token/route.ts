/**
 * Custom Token API route - exchanges session cookie for Firebase custom token
 * Required for Firestore security rules which check request.auth.uid
 */
export { CustomTokenPOST as POST, CustomTokenOPTIONS as OPTIONS } from '@ainexsuite/auth/server';
