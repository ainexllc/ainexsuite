/**
 * Custom Token API Route
 *
 * Uses the shared handler from @ainexsuite/auth/server
 */
import { CustomTokenPOST, CustomTokenOPTIONS } from '@ainexsuite/auth/server';

export const POST = CustomTokenPOST;
export const OPTIONS = CustomTokenOPTIONS;
