/**
 * SSO Status API Route
 *
 * This endpoint is called by the SSOBridge iframe to check if the user
 * is authenticated on the Auth Hub (main app) and get a custom token.
 */

import { SSOStatusGET, SSOStatusOPTIONS } from '@ainexsuite/auth/server';

export const GET = SSOStatusGET;
export const OPTIONS = SSOStatusOPTIONS;
