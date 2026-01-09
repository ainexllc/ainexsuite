/**
 * Logout API route - clears session cookie for SSO logout
 * Delegated to shared @ainexsuite/auth package for consistent SSO
 */
export { LogoutPOST as POST, LogoutOPTIONS as OPTIONS } from '@ainexsuite/auth/server';
