import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdminAuth } from "@ainexsuite/auth/server";

export async function verifyIdToken(
  idToken: string,
): Promise<DecodedIdToken | null> {
  try {
    return await getAdminAuth().verifyIdToken(idToken, true);
  } catch (error) {
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
