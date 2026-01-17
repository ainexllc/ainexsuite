/**
 * Hints Module
 *
 * Re-exports shared hints components from @ainexsuite/ui
 * and local Todo-specific hint configurations.
 */

// Re-export shared components
export { Hint, HintsProvider, useHints, createLocalStorageAdapter } from '@ainexsuite/ui';
export type { HintConfig, HintPlacement, HintsStorageAdapter, HintProps } from '@ainexsuite/ui';

// Export local hint configurations
export { HINTS } from './hints-config';
export type { HintId } from './hints-config';
