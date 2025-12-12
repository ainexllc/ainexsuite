/**
 * Server-side authentication exports
 * Provides route handlers and admin utilities for server-side operations
 */

export * from './admin';
export * from './session-handlers';

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
