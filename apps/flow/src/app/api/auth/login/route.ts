/**
 * Login API route - creates session cookie from ID token
 * Delegated to shared @ainexsuite/auth package for consistent SSO
 */
export { LoginPOST as POST, LoginOPTIONS as OPTIONS } from '@ainexsuite/auth/server';
