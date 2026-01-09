/**
 * Next.js Middleware for Route Protection
 *
 * Protects /workspace routes by verifying the session cookie.
 * Unauthenticated users are redirected to the login page.
 */

import { createAuthMiddleware } from '@ainexsuite/auth/server';

export const middleware = createAuthMiddleware({
  loginUrl: '/',
  protectedPaths: ['/workspace'],
});

export const config = {
  matcher: ['/workspace/:path*'],
};
