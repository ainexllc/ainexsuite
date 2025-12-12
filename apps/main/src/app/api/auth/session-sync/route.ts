/**
 * Session Sync API Route
 *
 * This endpoint receives session cookies from other apps and sets them
 * on the main app, enabling cross-app SSO.
 */

import { SessionSyncPOST, SessionSyncOPTIONS } from '@ainexsuite/auth/server';

export const POST = SessionSyncPOST;
export const OPTIONS = SessionSyncOPTIONS;
