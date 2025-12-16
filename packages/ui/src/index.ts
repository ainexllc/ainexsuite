/**
 * @ainexsuite/ui
 * Shared UI components and design system for AINexSuite
 *
 * This package provides:
 * - Design system CSS (globals.css)
 * - Utility functions (cn)
 * - Tailwind configuration
 * - Standardized components with theme system integration
 */

// Core utilities
export * from './lib/utils';
export * from './utils/reactFlowEdgeUtils';
export * from './utils/navigation';
export * from './utils/cross-app-navigation';

// Components and templates
export * from './components';
export * from './templates';

// Hooks
export * from './hooks';
export * from './hooks/use-system-updates';

// Providers
export * from './providers';

// Design system configuration
export * from './config';

// Constants
export * from './constants';
