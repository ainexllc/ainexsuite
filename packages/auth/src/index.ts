/**
 * @ainexsuite/auth
 * SSO authentication with session cookies for AINexSuite
 *
 * Key features:
 * - Server-side session cookies scoped to .ainexspace.com
 * - Cookie is the single source of truth for auth state
 * - Middleware protection for /workspace routes
 * - Dev mode localStorage fallback for cross-port SSO
 */

// Core auth exports
export * from './context';
export * from './use-workspace-auth';
export * from './session';

// UI components
export * from './app-activation-modal';
export * from './app-activation-box';
export * from './use-app-activation';
export * from './auth-box';
export * from './suite-guard';

// Utilities
export * from './email-detection';
export * from './auth-errors';
export * from './user-utils';
export * from './stripe-client';

// Suite access utilities
export {
  getAppsUsedCount,
  hasUsedMultipleApps,
  needsSuiteAccess,
  markAppAsUsed,
} from './suite-utils';

// Subscription utilities
export * from './subscription-utils';
export * from './subscription-guard';

// NOTE: Server-side utilities (Firebase Admin SDK) are NOT exported here
// to prevent bundling Node.js-only code into client bundles.
// Import from '@ainexsuite/auth/server' instead for server-side code.
