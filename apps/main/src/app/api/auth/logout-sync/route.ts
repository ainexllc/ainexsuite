/**
 * Logout Sync API Route
 *
 * This endpoint receives logout notifications from other apps and clears
 * the session from the in-memory store, enabling cross-app logout.
 */

import { LogoutSyncPOST, LogoutSyncOPTIONS } from '@ainexsuite/auth/server';

export const POST = LogoutSyncPOST;
export const OPTIONS = LogoutSyncOPTIONS;
