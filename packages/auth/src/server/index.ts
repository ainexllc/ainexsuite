/**
 * Server-side authentication exports
 * Provides route handlers and admin utilities for server-side operations
 */

// Admin SDK utilities
export * from './admin';

// Session core utilities (new simplified system)
export * from './session-core';

// Middleware utilities for Next.js route protection
export * from './middleware-utils';

// Auth handlers for login/logout/session/custom-token endpoints
export {
  LoginPOST,
  LoginOPTIONS,
  LogoutPOST,
  LogoutOPTIONS,
  SessionGET,
  SessionOPTIONS,
  CustomTokenPOST,
  CustomTokenOPTIONS,
} from './auth-handlers';

// Session handlers for profile/preferences
export {
  GET,
  POST,
  PUT,
  DELETE,
  OPTIONS,
} from './session-handlers';
