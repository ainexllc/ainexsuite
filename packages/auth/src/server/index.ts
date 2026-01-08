/**
 * Server-side authentication exports
 * Provides route handlers and admin utilities for server-side operations
 */

export * from './admin';
export {
  GET,
  POST,
  PUT,
  DELETE,
  OPTIONS,
  CustomTokenPOST,
  CustomTokenOPTIONS,
} from './session-handlers';

// SSO status handler exports with prefixed names to avoid conflicts
export {
  GET as SSOStatusGET,
  OPTIONS as SSOStatusOPTIONS,
} from './sso-status-handler';

// Session sync handler exports for cross-app SSO
export {
  POST as SessionSyncPOST,
  OPTIONS as SessionSyncOPTIONS,
} from './session-sync-handler';

// Logout sync handler exports for cross-app logout propagation
export {
  POST as LogoutSyncPOST,
  OPTIONS as LogoutSyncOPTIONS,
} from './logout-sync-handler';

// Fast bootstrap handler exports for optimized auth startup
export {
  POST as FastBootstrapPOST,
  OPTIONS as FastBootstrapOPTIONS,
} from './fast-bootstrap-handler';
