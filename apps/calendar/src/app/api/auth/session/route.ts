/**
 * Session API routes - delegated to shared @ainexsuite/auth package
 * This ensures consistent SSO behavior across all apps
 */
export { GET, POST, PUT, DELETE, OPTIONS } from '@ainexsuite/auth/server';

// Ensure this runs on Node.js runtime (required for firebase-admin)
export const runtime = 'nodejs';