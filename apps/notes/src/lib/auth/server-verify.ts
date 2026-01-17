import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdminAuth } from "@ainexsuite/auth/server";
import { cookies } from "next/headers";

export async function verifyIdToken(
  idToken: string,
): Promise<DecodedIdToken | null> {
  try {
    return await getAdminAuth().verifyIdToken(idToken, true);
  } catch {
    return null;
  }
}

export async function getUserFromHeaders(
  headers: Headers,
): Promise<DecodedIdToken | null> {
  const authorization = headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.replace("Bearer ", "").trim();

  if (!token) {
    return null;
  }

  return verifyIdToken(token);
}

/**
 * Get user from session cookie (preferred for browser requests)
 */
export async function getUserFromSession(): Promise<DecodedIdToken | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session")?.value;

    if (!sessionCookie) {
      return null;
    }

    const adminAuth = getAdminAuth();
    return await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}
