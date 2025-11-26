/**
 * Shared Session Route Handler
 *
 * This ensures consistent SSO behavior across all apps by using the shared handlers
 * from @ainexsuite/auth.
 *
 * - GET: Checks if the user has a valid session cookie
 * - POST: Creates a session cookie from an ID token
 * - OPTIONS: Handles CORS preflight requests
 */

export { GET, POST, OPTIONS } from '@ainexsuite/auth/server';