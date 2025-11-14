/**
 * Auth API Handlers
 * Shared Next.js API route handlers for authentication
 *
 * Usage in app routes:
 *
 * // apps/journey/src/app/api/auth/session/route.ts
 * import { handleSessionCreation } from '@ainexsuite/auth/api';
 * export async function POST(req: NextRequest) {
 *   return handleSessionCreation(req);
 * }
 */

export * from './session-handler';
