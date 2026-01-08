/**
 * Fast Bootstrap API Route
 *
 * Single endpoint for fast authentication bootstrap.
 * Combines auth validation + session + user data in one request.
 */

import { FastBootstrapPOST, FastBootstrapOPTIONS } from '@ainexsuite/auth/server';

export const POST = FastBootstrapPOST;
export const OPTIONS = FastBootstrapOPTIONS;
