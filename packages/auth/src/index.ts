/**
 * @ainexsuite/auth
 * SSO authentication with session cookies for AINexSuite
 */

export * from './session';
export * from './context';
export * from './auth-bootstrap';
export * from './app-activation-modal';
export * from './app-activation-box';
export * from './use-app-activation';
export * from './email-detection';
export * from './auth-errors';
export * from './suite-guard';
export * from './auth-box';
export * from './user-utils';
export * from './stripe-client';

// Export suite-utils functions that don't conflict
export {
  getAppsUsedCount,
  hasUsedMultipleApps,
  needsSuiteAccess,
  markAppAsUsed,
} from './suite-utils';

// Export subscription-utils (includes re-exports of suite-utils functions)
export * from './subscription-utils';
export * from './subscription-guard';
